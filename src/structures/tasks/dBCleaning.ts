/* eslint-disable no-console */
import Bottleneck from "bottleneck";
import type { Guild, GuildMemberRoleManager, TextChannel } from "discord.js";
import type { ShewenyClient } from "sheweny";

import config from "../config";
import { LinkedUser, User } from "../database/models";

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
			logChannel.send(`<:round_cross:1424312051794186260> [${id}] Rate limit atteint. Nouvelle tentative dans 60 secondes...`);
			return 60 * 1000;
		}

		logChannel.send(`<:round_cross:1424312051794186260> <@158205521151787009> Le nettoyage quotidien de la collection \`LinkedUsers\` ne s'est pas effectué correctement : \`${error.message}\``);
		return null;
	});

	// --- Cleaning the Users collection ---
	try {
		console.log("⌚ Lancement du nettoyage quotidien de la collection Users...");
		logChannel.send("<a:load:1424326891778867332> Lancement du nettoyage quotidien de la collection `Users`...");

		const users = await User.find();

		for (const dbUser of users) {
			try {
				const member = await gardenGuild.members.fetch(dbUser.discordId).catch(() => null);
				if (!member) {
					await limiter.schedule(async () => {
						const deleteResponse = await client.functions.deleteUser(dbUser.discordId);
						if (deleteResponse.status === 204) logChannel.send(`-# La connexion au site de l'ID \`${dbUser.discordId}\` (username : \`${dbUser.discordUsername}\`) a été supprimée car il n'est plus sur le Jardin.`);
					});
					await LinkedUser.deleteOne({ discordId: dbUser.discordId });
					await dbUser.deleteOne();
					logChannel.send(`-# L'id \`${dbUser.discordId}\` (username : \`${dbUser.discordUsername}\`) a été supprimé.`);
				}
			} catch (err) {
				console.error(err);
				logChannel.send(`<:round_cross:1424312051794186260> <@158205521151787009> Erreur lors de la suppression de l'utilisateur ${dbUser.discordId} : \`${err}\``);
			}
		}

		logChannel.send("<:round_check:1424065559355592884> Le nettoyage quotidien de la collection `Users` s'est effectué correctement.");
		console.log("✅ Fin du nettoyage quotidien de la collection Users...");
	} catch (err) {
		console.error(err);
		logChannel.send(`<:round_cross:1424312051794186260> <@158205521151787009> Le nettoyage quotidien de la collection \`Users\` ne s'est pas effectué correctement :\n\`${err}\``);
	}

	// --- Cleaning the LinkedUsers collection ---
	try {
		console.log("⌚ Lancement du nettoyage quotidien de la collection LinkedUsers...");
		logChannel.send("<a:load:1424326891778867332> Lancement du nettoyage quotidien de la collection `LinkedUsers`...");

		const linkedUsers = await LinkedUser.find();
		for (const dbLinkedUser of linkedUsers) {
			limiter.schedule(async () => {
				try {
					const getResponse = await client.functions.getUser(dbLinkedUser.discordId);
					if (getResponse.status === 404) {
						const member = await gardenGuild.members.fetch(dbLinkedUser.discordId).catch(() => null);
						if (member) {
							const rolesToRemove = [
								config.ampersandRoleId,
								config.seedRoleId,
								config.livingRoomRoleId,
								config.workshopRoleId,
								config.libraryRoleId,
								config.terraceRoleId,
								config.seriousRoleId,
								config.irlRoleId,
							];
							const memberRoles = member.roles as GuildMemberRoleManager;
							const rolesOwned = rolesToRemove.filter(roleId => memberRoles.cache.has(roleId));

							if (rolesOwned.length > 0) {
								await memberRoles.remove(rolesOwned);
							}
						}
						await client.functions.deleteUser(dbLinkedUser.discordId);
						await LinkedUser.deleteOne({ discordId: dbLinkedUser.discordId });
						logChannel.send(`-# La connexion au site de l'ID \`${dbLinkedUser.discordId}\` (siteId : \`${dbLinkedUser.siteId}\`, username : \`${dbLinkedUser.discordUsername}\`) a été supprimée.`);
					}
				} catch (err) {
					console.error(`Erreur lors de la suppression du LinkedUser ${dbLinkedUser.discordId}:`, err);
					logChannel.send(`Erreur lors de la vérification du LinkedUser \`${dbLinkedUser.discordId}\` : ${err}`);
				}
			});
		}

		await limiter.stop({ dropWaitingJobs: false });

		logChannel.send("<:round_check:1424065559355592884> Le nettoyage quotidien de la collection `LinkedUsers` s'est effectué correctement.");
		console.log("✅ Fin du nettoyage quotidien de la collection LinkedUsers...");
	} catch (err) {
		console.error(err);
		logChannel.send(`<:round_cross:1424312051794186260> <@158205521151787009> Le nettoyage quotidien de la collection \`LinkedUsers\` ne s'est pas effectué correctement :\`${err}\``);
	}
	logChannel.send("<:round_check:1424065559355592884> Fin de la boucle quotidienne de nettoyage de la base de données.");
}
