/* eslint-disable no-console */
import Bottleneck from "bottleneck";
import type { Guild, TextChannel } from "discord.js";
import type { ShewenyClient } from "sheweny";

import type { responseJson } from "../../types";
import config from "../config";
import { LinkedUser, User } from "../database/models";

/**
 * dailyDBCleaning: performs daily cleanup of database collections.
 * Summary: Removes users no longer in the guild from Users and LinkedUsers collections, deletes site links, and removes associated roles.
 * Steps:
 * - Initialize rate limiter for API calls
 * - Clean Users collection: for each user not in guild, delete site link, remove from LinkedUsers and Users
 * - Clean LinkedUsers collection: for linked users with no site account, remove roles and delete from DB
 * - Log progress and completion
 * @param gardenGuild - The Discord guild to check membership.
 * @param client - The Sheweny client for API functions.
 * @param logChannel - The Discord channel to send log messages.
 */
export async function dailyDBCleaning(gardenGuild: Guild, client: ShewenyClient, logChannel: TextChannel) {

	// --- Limiter initialisation ---
	const limiter = new Bottleneck({
		reservoir: 50,
		reservoirRefreshAmount: 50,
		reservoirRefreshInterval: 60 * 1000,
		minTime: 100,
	});

	// --- Handling error 429 ---
	limiter.on("failed", async (error, jobInfo) => {
		const id = jobInfo.options.id || "unknown";

		if (error.response?.status === 429) {
			logChannel.send(`${config.emojis.cross} [${id}] Rate limit atteint. Nouvelle tentative dans 60 secondes...`);
			return 60 * 1000;
		}

		logChannel.send(`${config.emojis.cross} <@${config.botAdminsIds[0]}> Le nettoyage quotidien de la base de données ne s'est pas effectué correctement : \`${error.message}\``);
		return null;
	});

	// --- Cleaning the Users collection ---
	try {
		console.log("⌚ Lancement du nettoyage quotidien de la collection Users...");
		await logChannel.send(`${config.emojis.loading} Lancement du nettoyage quotidien de la collection \`Users\`...`);

		// Fetch all users from the database
		const users = await User.find();
		const allLogs: string[] = [];

		// For each user, check if they are still in the guild
		const userTasks = users.map(dbUser =>
			limiter.schedule(async () => {
				try {
					const member = await gardenGuild.members.fetch(dbUser.discordId).catch(() => null);
					if (!member) {
						const deleteResponse = await client.functions.deleteUser(dbUser.discordId);
						if (deleteResponse.status === 204) {
							allLogs.push(`-# 🧹 La connexion au site de l'ID \`${dbUser.discordId}\` (username : \`${dbUser.discordUsername}\`) a été supprimée car il n'est plus sur le Manoir.`);
						}
						await LinkedUser.deleteOne({ discordId: dbUser.discordId });
						await dbUser.deleteOne();
						allLogs.push(`-# 🧹 L'ID \`${dbUser.discordId}\` (username : \`${dbUser.discordUsername}\`) a été supprimé.`);
					}
					// Sending logs in batches of 10 to avoid message length limits
					if (allLogs.length >= 10) {
						const logsToSend = allLogs.splice(0, 10);
						await logChannel.send({
							content: logsToSend.join("\n"),
						});
					}
				} catch (err) {
					console.error(err);
					await logChannel.send(`${config.emojis.cross} <@${config.botAdminsIds[0]}> Erreur lors de la suppression de l'utilisateur ${dbUser.discordId} : \`${err}\``);
				}
			}),
		);

		// Wait for all user tasks to complete
		await Promise.all(userTasks);

		// Final log output after processing all linked users
		if (allLogs.length > 0) {
			await logChannel.send({
				content: allLogs.join("\n"),
			});
		}

		await logChannel.send(`${config.emojis.check} Le nettoyage quotidien de la collection \`Users\` s'est effectué correctement.`);
		console.log("✅ Fin du nettoyage quotidien de la collection Users...");
	} catch (err) {
		console.error(err);
		logChannel.send(`${config.emojis.cross} <@${config.botAdminsIds[0]}> Le nettoyage quotidien de la collection \`Users\` ne s'est pas effectué correctement :\n\`${err}\``);
	}

	// --- Cleaning the LinkedUsers collection ---
	try {
		console.log("⌚ Lancement du nettoyage quotidien de la collection LinkedUsers...");
		await logChannel.send(`${config.emojis.loading} Lancement du nettoyage quotidien de la collection \`LinkedUsers\`...`);

		// Fetch all linked users from the database
		const linkedUsers = await LinkedUser.find();
		const allLogs: string[] = [];

		const linkedUserTasks = linkedUsers.map(dbLinkedUser =>
			limiter.schedule(async () => {
				try {
					const getResponse = await client.functions.getUser(dbLinkedUser.discordId);
					// If the user is not found on the site, remove roles and delete from DB
					if (getResponse.status === 404) {
						const member = await gardenGuild.members.fetch(dbLinkedUser.discordId).catch(() => null);
						if (member) {
							const rolesToRemove = [
								config.confirmedUserRoleId,
								config.nonConfirmedUserRoleId,
								config.livingRoomRoleId,
								config.workshopRoleId,
								config.libraryRoleId,
								config.terraceRoleId,
								config.seriousRoleId,
								config.irlRoleId,
							];
							const memberRoles = member.roles;
							const rolesOwned = rolesToRemove.filter(roleId => memberRoles.cache.has(roleId));

							if (rolesOwned.length > 0) {
								await memberRoles.remove(rolesOwned);
							}
						}
						await client.functions.deleteUser(dbLinkedUser.discordId);
						await LinkedUser.deleteOne({ discordId: dbLinkedUser.discordId });
						allLogs.push(`-# 🧹 La connexion au site de l'ID \`${dbLinkedUser.discordId}\` (siteId : \`${dbLinkedUser.siteId}\`, username : \`${dbLinkedUser.discordUsername}\`) a été supprimée car il n'est plus sur le Manoir.`);
					} else {
						// If the user exists on the site, sync roles
						const member = await gardenGuild.members.fetch(dbLinkedUser.discordId).catch(() => null);
						if (member) {
							// Sync roles between DB and site account
							const getResponseJson = await getResponse.json() as responseJson;
							const rolesApi = getResponseJson.roles || [];
							const rolesDb = dbLinkedUser.roles;
							const rolesDiffer = rolesApi.length !== rolesDb.length || !rolesApi.every(role => rolesDb.includes(role));
							if (rolesDiffer) {
								await LinkedUser.findOneAndUpdate(
									{ discordId: dbLinkedUser.discordId },
									{ roles: rolesApi },
								);
							}

							// Determine confirmation status from site roles
							const isNonConfirmed = rolesApi.includes("user");
							const isConfirmed = rolesApi.includes("user-confirmed");

							// Determine current roles in guild
							const memberRoles = member.roles;
							const hasNonConfirmedRole = memberRoles.cache.has(config.nonConfirmedUserRoleId);
							const hasConfirmedRole = memberRoles.cache.has(config.confirmedUserRoleId);

							// Determine roles to add or remove
							const toAdd: string[] = [];
							const toRemove: string[] = [];

							if (isNonConfirmed && !hasNonConfirmedRole) {
								toAdd.push(config.nonConfirmedUserRoleId);
								allLogs.push(`-# ➕ Rôle Graine de l'ID \`${member.user.id}\` ajouté.`);
							} else if (!isNonConfirmed && hasNonConfirmedRole) {
								toRemove.push(config.nonConfirmedUserRoleId);
								allLogs.push(`-# 🧹 Rôle Graine de l'ID \`${member.user.id}\` retiré.`);
							}

							if (isConfirmed && !hasConfirmedRole) {
								toAdd.push(config.confirmedUserRoleId);
								allLogs.push(`-# ➕ Rôle Esperluette de l'ID \`${member.user.id}\` ajouté.`);
							} else if (!isConfirmed && hasConfirmedRole) {
								toRemove.push(config.confirmedUserRoleId,
									config.livingRoomRoleId,
									config.workshopRoleId,
									config.libraryRoleId,
									config.terraceRoleId,
									config.seriousRoleId,
									config.irlRoleId);
								allLogs.push(`-# 🧹 Rôles Esperluette et accessoires de l'ID \`${member.user.id}\` retiré.`);
							}

							// Apply role changes
							if (toAdd.length) await memberRoles.add(toAdd);
							if (toRemove.length) await memberRoles.remove(toRemove);

							// Sending logs in batches of 10 to avoid message length limits
							if (allLogs.length >= 10) {
								const logsToSend = allLogs.splice(0, 10);
								await logChannel.send({
									content: logsToSend.join("\n"),
								});
							}
						}
					}
				} catch (err) {
					console.error(`Erreur lors de la suppression du LinkedUser ${dbLinkedUser.discordId}:`, err);
					logChannel.send(`Erreur lors de la vérification du LinkedUser \`${dbLinkedUser.discordId}\` : ${err}`);
				}
			}),
		);

		await Promise.all(linkedUserTasks);

		// Final log output after processing all linked users
		if (allLogs.length > 0) {
			await logChannel.send({
				content: allLogs.join("\n"),
			});
		}

		await logChannel.send(`${config.emojis.check} Le nettoyage quotidien de la collection \`LinkedUsers\` s'est effectué correctement.`);
		console.log("✅ Fin du nettoyage quotidien de la collection LinkedUsers...");
	} catch (err) {
		console.error(err);
		logChannel.send(`${config.emojis.cross} <@${config.botAdminsIds[0]}> Le nettoyage quotidien de la collection \`LinkedUsers\` ne s'est pas effectué correctement :\`${err}\``);
	}
	logChannel.send(`${config.emojis.check} Fin de la boucle quotidienne de nettoyage de la base de données.`);
}
