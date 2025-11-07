/* eslint-disable no-console */
import type { Guild, TextChannel } from "discord.js";
import type { ShewenyClient } from "sheweny";

import config from "../config";
import { LinkedUser, User } from "../database/models";

export async function dailySeriousRolesUpdate(gardenGuild: Guild, client: ShewenyClient, logChannel: TextChannel) {
	const todayTime = new Date().getTime();
	const dbUsers = await User.find();

	try {
		for (let i = 0; i < dbUsers.length; i++) {
			const userDoc = dbUsers[i];

			// Check if the Discord user exists
			const user = await gardenGuild?.members.fetch(dbUsers[i].discordId).catch(() => null);
			// If not, destroy link with site, deleting all db infos and continue to next user
			if (!user) {
				const getResponse = await client.functions.getUser(userDoc.discordId);
				if (getResponse.status !== 404) {
					await client.functions.deleteUser(userDoc.discordId);
				}
				await LinkedUser.deleteOne({ discordId: userDoc.discordId });
				await userDoc.deleteOne();
				continue;
			}

			// Cleaning up the old days and calculation of total messages
			let messagesSum = 0;
			userDoc.messagesPerDay = userDoc.messagesPerDay.filter(day => {
				const diffDays = (todayTime - new Date(day.date).getTime()) / (1000 * 60 * 60 * 24);
				if (diffDays <= 30) messagesSum += day.count;
				return diffDays <= 30;
			});
			await userDoc.save();

			// Management of the ‘serious’ role
			const hasRole = user.roles.cache.has(config.seriousRoleId);
			if (messagesSum >= 50 && !hasRole) {
				await user.roles.add(config.seriousRoleId);
			} else if (messagesSum < 50 && hasRole) {
				await user.roles.remove(config.seriousRoleId);
			}

			// Pause every 40 iterations
			if ((i + 1) % 40 === 0) {
				await logChannel.send(`<a:load:1424326891778867332> Pause de 4 secondes après ${i + 1} itérations...`);
				await client.functions.delay(4000);
			}
		}

		logChannel.send("<:round_check:1424065559355592884> Fin de la boucle quotidienne d'ajout/suppression du rôle d'accès au fumoir.");
		console.log("✅ Fin de la boucle quotidienne d'ajout/suppression du rôle d'accès au fumoir.");
	}
	catch (err) {
		console.error(err);
		logChannel.send(`<:round_cross:1424312051794186260> <@${config.botAdminsIds[0]}> La boucle quotidienne d'ajouts/suppressions du rôle d'accès au fumoir ne s'est pas effectuée correctement : \`${err}\``);
	}
}
