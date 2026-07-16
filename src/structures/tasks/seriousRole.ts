/* eslint-disable no-console */
import Bottleneck from "bottleneck";
import type { Guild, TextChannel } from "discord.js";
import type { ShewenyClient } from "sheweny";

import config from "../config";
import { LinkedUser, User } from "../database/models";

/**
 * dailySeriousRolesUpdate: updates the 'serious' role based on message activity.
 * Summary: For confirmed users, grants or removes the 'serious' role if they have 50+ messages in the last 30 days.
 * Steps:
 * - Fetch all users from DB
 * - For each user: pause every 40 iterations, check guild membership, clean old message data, calculate 30-day sum
 * - If confirmed user and sum >=50, add role; if sum <50, remove role
 * - Log progress and completion
 * @param gardenGuild - The Discord guild.
 * @param client - The Sheweny client.
 * @param logChannel - The channel to log updates.
 */
export async function dailySeriousRolesUpdate(gardenGuild: Guild, client: ShewenyClient, logChannel: TextChannel) {
	const todayTime = new Date().getTime();
	const dbUsers = await User.find();
	const allLogs: string[] = [];

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

	const seriousRoleTasks = dbUsers.map(userDoc =>
		fetchLimiter.schedule(async () => {
			try {
				// Check if user is still in the guild
				const member = await gardenGuild?.members.fetch(userDoc.discordId).catch(() => null);

				// If yes, filter messages to last 30 days, calculate total, and manage role
				if (member) {
					// Filter messages to last 30 days and calculate total
					let messagesSum = 0;
					userDoc.messagesPerDay = userDoc.messagesPerDay.filter(day => {
						const diffDays = (todayTime - new Date(day.date).getTime()) / (1000 * 60 * 60 * 24);
						if (diffDays <= 30) messagesSum += day.count;
						return diffDays <= 30;
					});
					await userDoc.save();

					// Check if user has confirmed role
					const isConfirmed = member.roles.cache.has(config.confirmedUserRoleId);
					// Skip if not confirmed
					if (isConfirmed) {
						// Manage serious role assignment
						const hasRole = member.roles.cache.has(config.seriousRoleId);
						if (messagesSum >= 50 && !hasRole) {
							await member.roles.add(config.seriousRoleId);
							allLogs.push(`-# ➕ Rôle Fumoir de l'ID \`${member.user.id}\` (\`${userDoc.discordUsername}\`) ajouté.`);
						} else if (messagesSum < 50 && hasRole) {
							await member.roles.remove(config.seriousRoleId);
							allLogs.push(`-# 🧹 Rôle Fumoir de l'ID \`${member.user.id}\` (\`${userDoc.discordUsername}\`) retiré.`);
						}
					}
				} else {
					// If user is not in the guild, delete site link and DB records, skip to next
					const getResponse = await getUserLimiter.schedule(() =>
						client.functions.getUser(userDoc.discordId),
					);
					if (getResponse.status !== 404) {
						await deleteLimiter.schedule(() =>
							client.functions.deleteUser(userDoc.discordId),
						);
						allLogs.push(`-# 🧹 La connexion au site de l'ID \`${userDoc.discordId}\` (\`${userDoc.discordUsername}\`) a été supprimée car il n'est plus sur le Manoir.`);
					}
					await LinkedUser.deleteOne({ discordId: userDoc.discordId });
					await userDoc.deleteOne();
				}
			}
			catch (err) {
				console.error(err);
				logChannel.send(`${config.emojis.cross} <@${config.botAdminsIds[0]}> La boucle quotidienne d'ajouts/suppressions du rôle d'accès au fumoir ne s'est pas effectuée correctement : \`${err}\``);
			}
		}),
	);

	await Promise.all(seriousRoleTasks);

	// Log output after processing all users
	while (allLogs.length > 0) {
		const logsToSend = allLogs.splice(0, 10);
		await logChannel.send({ content: logsToSend.join("\n") });
	}

	logChannel.send(`${config.emojis.check} Fin de la boucle quotidienne d'ajout/suppression du rôle d'accès au fumoir.`);
	console.log("✅ Fin de la boucle quotidienne d'ajout/suppression du rôle d'accès au fumoir.");
}
