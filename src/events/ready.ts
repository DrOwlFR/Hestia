import fs from "fs";

import { EJSON } from "bson";
import type { TextChannel } from "discord.js";
import { ActivityType, ChannelType } from "discord.js";
import { schedule } from "node-cron";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";

import { version } from "../../package.json";
import config from "../structures/config";
import { LinkedUser, User } from "../structures/database/models";

export class ReadyEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "ready", {
			description: "Client is logged in",
			once: true,
			emitter: client,
		});
	}

	async execute() {

		let users = this.client.users.cache.filter(user => !user.bot).size;
		const gardenGuild = this.client.guilds.cache.get(config.gardenGuildId);
		const guildsIn = this.client.guilds.cache.size;
		const channels = this.client.channels.cache.filter(channel => channel.type !== ChannelType.GuildCategory).size;

		// Bot status messages
		let index = 0;
		setInterval(() => {
			users = this.client.users.cache.filter(user => !user.bot).size;
			const ampersands = gardenGuild?.roles.cache.get(config.ampersandRoleId)?.members.size;
			const seeds = gardenGuild?.roles.cache.get(config.seedRoleId)?.members.size;
			const statusList = [
				`${users} membre${users > 1 ? "s" : ""}`,
				`${ampersands} esperluette${ampersands! > 1 ? "s" : ""}`,
				`${seeds} graine${seeds! > 1 ? "s" : ""}`,
				`Version ${version}`,
			];

			if (index === statusList.length) index = 0;
			const status = statusList[index];

			this.client.user?.setPresence({ activities: [{ name: "status", type: ActivityType.Custom, state: `${status}` }], status: "online" });

			index++;
		}, 7000);

		// DB cleaning cron
		schedule("0 1 * * *", async () => {
			const dbCleaningCronLogChannel = this.client.channels.cache.get("1427009582076788846") as TextChannel;
			dbCleaningCronLogChannel!.send("<a:load:1424326891778867332> Lancement de la boucle quotidienne de nettoyage de la base de données...");
			// eslint-disable-next-line no-console
			console.log("⌚ Lancement du nettoyage quotidien de la base de données...");
			// Users DB cleaning
			try {
				// eslint-disable-next-line no-console
				console.log("⌚ Lancement du nettoyage quotidien de la collection Users...");
				(await User.find()).forEach(async dbUser => {
					const member = gardenGuild?.members.cache.get(dbUser.discordId);
					if (!member) {
						await this.client.functions.deleteUser(dbUser.discordId);
						await LinkedUser.deleteOne({ discordId: dbUser.discordId });
						await dbUser.deleteOne();
					}
					return;
				});
				dbCleaningCronLogChannel!.send("<:round_check:1424065559355592884> Le nettoyage quotidien de la collection `Users` s'est effectué correctement.");
				// eslint-disable-next-line no-console
				console.log("✅ Fin du nettoyage quotidien de la collection Users...");
			}
			catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
				dbCleaningCronLogChannel!.send(`<:round_cross:1424312051794186260> <@158205521151787009> Le nettoyage de la collection \`Users\` ne s'est pas effectué correctement :\n\`${err}\``);
			}
			// LinkedUsers DB cleaning
			try {
				// eslint-disable-next-line no-console
				console.log("⌚ Lancement du nettoyage quotidien de la collection LinkedUsers...");
				(await LinkedUser.find()).forEach(async dbLinkedUser => {
					const getResponse = await this.client.functions.getUser(dbLinkedUser.discordId);
					if (getResponse.status === 404) {
						await this.client.functions.deleteUser(dbLinkedUser.discordId);
						await LinkedUser.deleteOne({ discordId: dbLinkedUser.discordId });
					}
					return;
				});
				dbCleaningCronLogChannel!.send("<:round_check:1424065559355592884> Le nettoyage quotidien de la collection `LinkedUsers` s'est effectué correctement.");
				// eslint-disable-next-line no-console
				console.log("✅ Fin du nettoyage quotidien de la collection des LinkedUsers...");
			}
			catch (err) {
				// eslint-disable-next-line no-console
				console.log(err);
				dbCleaningCronLogChannel!.send(`<:round_cross:1424312051794186260> <@158205521151787009> Le nettoyage de la collection \`LinkedUsers\` ne s'est pas effectué correctement :\n\`${err}\``);
			}
		}, {
			timezone: "Europe/Paris",
		});

		// Serious role adding/removing cron
		schedule("0 2 * * *", async () => {
			const seriousRoleCronLogChannel = this.client.channels.cache.get("1426975372716806316") as TextChannel;
			seriousRoleCronLogChannel.send("<a:load:1424326891778867332> Lancement de la boucle quotidienne d'ajouts/suppressions du rôle d'accès au fumoir...");
			// eslint-disable-next-line no-console
			console.log("⌚ Lancement de la boucle quotidienne d'ajouts/suppressions du rôle d'accès au fumoir...");

			const todayTime = new Date().getTime();
			const dbUsers = await User.find();

			try {
				for (let i = 0; i < dbUsers.length; i++) {
					const userDoc = dbUsers[i];

					// Check if the Discord user exists
					const user = gardenGuild?.members.cache.get(userDoc.discordId);
					// If not, destroy with site, deleting all db info and continue to next user
					if (!user) {
						const getResponse = await this.client.functions.getUser(userDoc.discordId);
						if (getResponse.status !== 404) {
							await this.client.functions.deleteUser(userDoc.discordId);
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
						await seriousRoleCronLogChannel.send(`<a:load:1424326891778867332> Pause de 4 secondes après ${i + 1} itérations...`);
						await this.client.functions.delay(4000);
					}
				}

				seriousRoleCronLogChannel.send("<:round_check:1424065559355592884> Fin de la boucle quotidienne d'ajout/suppression du rôle d'accès au fumoir.");
				// eslint-disable-next-line no-console
				console.log("✅ Fin de la boucle quotidienne d'ajout/suppression du rôle d'accès au fumoir.");
			}
			catch (err) {
				console.error(err);
				seriousRoleCronLogChannel.send(`<:round_cross:1424312051794186260> <@158205521151787009> La boucle quotidienne d'ajouts/suppressions du rôle d'accès au fumoir ne s'est pas effectuée correctement : \`${err}\``);
			}

		}, {
			timezone: "Europe/Paris",
		});

		// DB saving cron
		schedule("0 3 * * 1", async () => {
			const dbBackupLogChannel = this.client.channels.cache.get("1426661664475975762") as TextChannel;
			dbBackupLogChannel!.send("<a:load:1424326891778867332> Lancement de la sauvegarde hebdomadaire de la base de données...");
			// eslint-disable-next-line no-console
			console.log("⌚ Lancement de la sauvegarde hebdomadaire de la base de données...");
			try {
				const usersDocuments = await User.find().lean();
				const usersEjsonData = EJSON.stringify(usersDocuments, { relaxed: false });
				const now = new Date();
				const formattedDateTime = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
				await fs.promises.writeFile(`Users-${formattedDateTime}.json`, usersEjsonData, "utf8");
				dbBackupLogChannel!.send("<:round_check:1424065559355592884> La sauvegarde hebdomadaire de la collection `Users` s'est effectuée correctement.");
			}
			catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
				dbBackupLogChannel!.send(`<:round_cross:1424312051794186260> <@158205521151787009> La sauvegarde hebdomadaire de la collection \`Users\` ne s'est pas effectuée correctement : \`${err}\``);
			}
			try {
				const linkedUsersDocuments = await LinkedUser.find().lean();
				const linkedUsersEjsonData = EJSON.stringify(linkedUsersDocuments, { relaxed: false });
				const now = new Date();
				const formattedDateTime = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
				await fs.promises.writeFile(`LinkedUsers-${formattedDateTime}.json`, linkedUsersEjsonData, "utf8");
				dbBackupLogChannel!.send("<:round_check:1424065559355592884> La sauvegarde hebdomadaire de la collection `LinkedUsers` s'est correctement effectuée.");
			}
			catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
				dbBackupLogChannel!.send(`<:round_cross:1424312051794186260> <@158205521151787009> La sauvegarde hebdomadaire de la collection \`LinkedUsers\` ne s'est pas effectuée correctement : \`${err}\``);
			}
			dbBackupLogChannel!.send("<:round_check:1424065559355592884> Fin du script de sauvegarde hebdomadaire de la base de données.");
			// eslint-disable-next-line no-console
			console.log("✅ Fin du script de sauvegarde hebdomadaire de la base de données...");
		}, {
			timezone: "Europe/Paris",
		});

		// eslint-disable-next-line no-console
		return console.log(`Le bot est prêt et connecté en tant que ${this.client.user?.tag} ! ${guildsIn} serveurs. ${users} utilisateurs et ${channels} salons.`);
	}
};
