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

	// --- Limiters initialisation ---
	// Bottleneck limiters to manage rate limits for site API calls during the cleaning process.
	// getUserLimiter: for fetching user data from the site. Reservoir of 240 requests per minute (the site allows 300/minute), max 4 concurrent requests, with a minimum of 250 ms between requests (to stay within site API rate limits when fetching members).
	const getUserLimiter = new Bottleneck({
		reservoir: 240,
		reservoirRefreshAmount: 240,
		reservoirRefreshInterval: 60 * 1000,
		maxConcurrent: 4,
		minTime: 250,
	});

	// deleteLimiter: for deleting users via the site API, with a reservoir of 80 requests per minute (the site allows 100/minute) and max 1 concurrent request (with 750 ms spacing, so 1,33 req/sec).
	const deleteLimiter = new Bottleneck({
		reservoir: 80,
		reservoirRefreshAmount: 80,
		reservoirRefreshInterval: 60 * 1000,
		maxConcurrent: 1,
		minTime: 750,
	});

	// Fetch limiter for Discord API fetch calls (e.g., fetching members), to avoid hitting rate limits. Here we have 40 req/sec (for a max allowed by Discord of 50 req/sec).
	const fetchLimiter = new Bottleneck({
		maxConcurrent: 10,
		minTime: 250,
	});

	// --- Handling error 429 ---
	getUserLimiter.on("failed", async (error, jobInfo) => {
		const id = jobInfo.options.id || "unknown";

		const retryAfter = error.response?.headers?.["retry-after"];

		if (error.response?.status === 429) {
			// default to 60 seconds if no retryAfter provided
			const delay = retryAfter ? retryAfter * 1000 : 60 * 1000;
			logChannel.send(`${config.emojis.cross} [${id}] Rate limit atteint. Nouvelle tentative dans ${delay / 1000} secondes...`);
			return delay;
		}

		logChannel.send(`${config.emojis.cross} <@${config.botAdminsIds[0]}> Le nettoyage quotidien de la base de données ne s'est pas effectué correctement : \`${error.message}\``);
		return null;
	});
	deleteLimiter.on("failed", async (error, jobInfo) => {
		const id = jobInfo.options.id || "unknown";

		const retryAfter = error.response?.headers?.["retry-after"];

		if (error.response?.status === 429) {
			// default to 60 seconds if no retryAfter provided
			const delay = retryAfter ? retryAfter * 1000 : 60 * 1000;
			logChannel.send(`${config.emojis.cross} [${id}] Rate limit atteint. Nouvelle tentative dans ${delay / 1000} secondes...`);
			return delay;
		}

		logChannel.send(`${config.emojis.cross} <@${config.botAdminsIds[0]}> Le nettoyage quotidien de la base de données ne s'est pas effectué correctement : \`${error.message}\``);
		return null;
	});
	fetchLimiter.on("failed", async (error, jobInfo) => {
		const id = jobInfo.options.id || "unknown";

		const retryAfter = error.response?.headers?.["retry-after"];

		if (error.response?.status === 429) {
			// default to 60 seconds if no retryAfter provided
			const delay = retryAfter ? retryAfter * 1000 : 60 * 1000;
			logChannel.send(`${config.emojis.cross} [${id}] Rate limit atteint. Nouvelle tentative dans ${delay / 1000} secondes...`);
			return delay;
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
			fetchLimiter.schedule(async () => {
				try {
					const member = await gardenGuild.members.fetch(dbUser.discordId).catch(() => null);
					if (!member) {
						const deleteResponse = await deleteLimiter.schedule(() =>
							client.functions.deleteUser(dbUser.discordId),
						);
						if (deleteResponse.status === 204) {
							allLogs.push(`-# 🧹 La connexion au site de l'ID \`${dbUser.discordId}\` (username : \`${dbUser.discordUsername}\`) a été supprimée car il n'est plus sur le Manoir.`);
						}
						await LinkedUser.deleteOne({ discordId: dbUser.discordId });
						await dbUser.deleteOne();
						allLogs.push(`-# 🧹 L'ID \`${dbUser.discordId}\` (username : \`${dbUser.discordUsername}\`) a été supprimé.`);
					}
				} catch (err) {
					console.error(err);
					await logChannel.send(`${config.emojis.cross} <@${config.botAdminsIds[0]}> Erreur lors de la suppression de l'utilisateur ${dbUser.discordId} : \`${err}\``);
				}
			}),
		);

		// Wait for all user tasks to complete
		await Promise.all(userTasks);

		// Log output after processing all users
		while (allLogs.length > 0) {
			const logsToSend = allLogs.splice(0, 10);
			await logChannel.send({ content: logsToSend.join("\n") });
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

		const linkedUserTasks = linkedUsers.map(async dbLinkedUser => {
			try {
				const getResponse = await getUserLimiter.schedule(() =>
					client.functions.getUser(dbLinkedUser.discordId),
				);
				// If the user is not found on the site, remove roles and delete from DB
				if (getResponse.status === 404) {
					await fetchLimiter.schedule(async () => {
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
					});

					await deleteLimiter.schedule(() =>
						client.functions.deleteUser(dbLinkedUser.discordId),
					);
					await LinkedUser.deleteOne({ discordId: dbLinkedUser.discordId });
					allLogs.push(`-# 🧹 La connexion au site de l'ID \`${dbLinkedUser.discordId}\` (siteId : \`${dbLinkedUser.siteId}\`, username : \`${dbLinkedUser.discordUsername}\`) a été supprimée car il n'est plus sur le Manoir.`);
				} else {
					await fetchLimiter.schedule(async () => {
						const member = await gardenGuild.members.fetch(dbLinkedUser.discordId).catch(() => null);
						// If the user exists on the site, sync roles
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

							// Accessory roles
							const accessoryRoles = [config.livingRoomRoleId,
								config.workshopRoleId,
								config.libraryRoleId,
								config.terraceRoleId,
								config.seriousRoleId,
								config.irlRoleId];

							// Determine current roles in guild
							const memberRoles = member.roles;
							const hasNonConfirmedRole = memberRoles.cache.has(config.nonConfirmedUserRoleId);
							const hasConfirmedRole = memberRoles.cache.has(config.confirmedUserRoleId);
							const hasAccessoryRoles = accessoryRoles.some(roleId => memberRoles.cache.has(roleId));

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

							if (isNonConfirmed && hasAccessoryRoles) {
								toRemove.push(...accessoryRoles);
								allLogs.push(`-# 🧹 Rôles accessoires de l'ID \`${member.user.id}\` retiré car ce n'est pas une Esperluette.`);
							}

							if (isConfirmed && !hasConfirmedRole) {
								toAdd.push(config.confirmedUserRoleId);
								allLogs.push(`-# ➕ Rôle Esperluette de l'ID \`${member.user.id}\` ajouté.`);
							} else if (!isConfirmed && hasConfirmedRole) {
								toRemove.push(config.confirmedUserRoleId,
									...accessoryRoles,
								);
								allLogs.push(`-# 🧹 Rôles Esperluette et accessoires de l'ID \`${member.user.id}\` retiré.`);
							}

							// Apply role changes
							if (toAdd.length) await memberRoles.add(toAdd);
							if (toRemove.length) await memberRoles.remove(toRemove);
						}
					});
				}
			} catch (err) {
				console.error(`Erreur lors de la suppression du LinkedUser ${dbLinkedUser.discordId}:`, err);
				logChannel.send(`Erreur lors de la vérification du LinkedUser \`${dbLinkedUser.discordId}\` : ${err}`);
			}
		});

		await Promise.all(linkedUserTasks);

		// Log output after processing all users
		while (allLogs.length > 0) {
			const logsToSend = allLogs.splice(0, 10);
			await logChannel.send({ content: logsToSend.join("\n") });
		}

		await logChannel.send(`${config.emojis.check} Le nettoyage quotidien de la collection \`LinkedUsers\` s'est effectué correctement.`);
		console.log("✅ Fin du nettoyage quotidien de la collection LinkedUsers...");
	} catch (err) {
		console.error(err);
		logChannel.send(`${config.emojis.cross} <@${config.botAdminsIds[0]}> Le nettoyage quotidien de la collection \`LinkedUsers\` ne s'est pas effectué correctement :\`${err}\``);
	}
	logChannel.send(`${config.emojis.check} Fin de la boucle quotidienne de nettoyage de la base de données.`);
}
