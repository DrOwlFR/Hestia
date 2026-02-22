/* eslint-disable no-console */
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

	try {
		for (let i = 0; i < dbUsers.length; i++) {
			// Pause processing every 40 users to avoid rate limits
			if ((i + 1) % 40 === 0) {
				await logChannel.send(`${config.emojis.loading} Pause de 4 secondes après ${i + 1} itérations...`);
				await client.functions.delay(4000);
			}

			const userDoc = dbUsers[i];

			// Check if user is still in the guild
			const user = await gardenGuild?.members.fetch(dbUsers[i].discordId).catch(() => null);
			// If not in guild, delete site link and DB records, skip to next
			if (!user) {
				const getResponse = await client.functions.getUser(userDoc.discordId);
				if (getResponse.status !== 404) {
					await client.functions.deleteUser(userDoc.discordId);
				}
				await LinkedUser.deleteOne({ discordId: userDoc.discordId });
				await userDoc.deleteOne();
				continue;
			}

			// Filter messages to last 30 days and calculate total
			let messagesSum = 0;
			userDoc.messagesPerDay = userDoc.messagesPerDay.filter(day => {
				const diffDays = (todayTime - new Date(day.date).getTime()) / (1000 * 60 * 60 * 24);
				if (diffDays <= 30) messagesSum += day.count;
				return diffDays <= 30;
			});
			await userDoc.save();

			// Check if user has confirmed role
			const isConfirmed = user.roles.cache.has(config.confirmedUserRoleId);
			// Skip if not confirmed
			if (!isConfirmed) continue;

			// Manage serious role assignment
			const hasRole = user.roles.cache.has(config.seriousRoleId);
			if (messagesSum >= 50 && !hasRole) {
				await user.roles.add(config.seriousRoleId);
			} else if (messagesSum < 50 && hasRole) {
				await user.roles.remove(config.seriousRoleId);
			}
		}

		logChannel.send(`${config.emojis.check} Fin de la boucle quotidienne d'ajout/suppression du rôle d'accès au fumoir.`);
		console.log("✅ Fin de la boucle quotidienne d'ajout/suppression du rôle d'accès au fumoir.");
	}
	catch (err) {
		console.error(err);
		logChannel.send(`${config.emojis.cross} <@${config.botAdminsIds[0]}> La boucle quotidienne d'ajouts/suppressions du rôle d'accès au fumoir ne s'est pas effectuée correctement : \`${err}\``);
	}
}
