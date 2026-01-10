/* eslint-disable no-console */
import type { Guild, TextChannel } from "discord.js";
import { ActivityType } from "discord.js";
import { schedule } from "node-cron";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";

import { version } from "../../package.json";
import config from "../structures/config";
import { LinkedUser, User } from "../structures/database/models";
import { weeklyDBBackup } from "../structures/tasks/dBBackup";
import { dailyDBCleaning } from "../structures/tasks/dBCleaning";
import { getSeasonStartingToday, updateRulesMessages } from "../structures/tasks/seasonsSystem";
import { dailySeriousRolesUpdate } from "../structures/tasks/seriousRole";

export class ReadyEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "ready", {
			description: "Client is logged in",
			once: true,
			emitter: client,
		});
	}

	async execute() {

		// Bot status messages
		let index = 0;
		setInterval(() => {
			const gardenGuild = this.client.guilds.cache.get(config.gardenGuildId);

			const users = gardenGuild!.members.cache.filter(member => !member.user.bot).size;
			const confirmedUsers = gardenGuild?.roles.cache.get(config.confirmedUserRoleId)?.members.size;
			const nonConfirmedUsers = gardenGuild?.roles.cache.get(config.nonConfirmedUserRoleId)?.members.size;
			const statusList = [
				`${users} membre${users > 1 ? "s" : ""}`,
				`${confirmedUsers} esperluette${confirmedUsers! > 1 ? "s" : ""}`,
				`${nonConfirmedUsers} graine${nonConfirmedUsers! > 1 ? "s" : ""}`,
				`Version ${version}`,
			];

			if (index === statusList.length) index = 0;
			const status = statusList[index];

			this.client.user?.setPresence({ activities: [{ name: "status", type: ActivityType.Custom, state: `${status}` }], status: "online" });

			index++;
		}, 7000);

		// --- DB cleaning cron: everyday at 1 AM ---
		schedule("0 1 * * *", async () => {
			const gardenGuild = this.client.guilds.cache.get(config.gardenGuildId);
			const dbCleaningCronLogChannel = this.client.channels.cache.get("1427009582076788846") as TextChannel;

			console.log("⌚ Lancement du nettoyage quotidien de la base de données...");
			dbCleaningCronLogChannel.send("<a:load:1424326891778867332> Lancement de la boucle quotidienne de nettoyage de la base de données...");
			await dailyDBCleaning(gardenGuild as Guild, this.client, dbCleaningCronLogChannel);
		}, {
			timezone: "Europe/Paris",
		});

		// --- Serious role adding/removing cron: everyday at 2AM ---
		schedule("0 2 * * *", async () => {
			const gardenGuild = this.client.guilds.cache.get(config.gardenGuildId);
			const seriousRoleCronLogChannel = this.client.channels.cache.get("1426975372716806316") as TextChannel;

			console.log("⌚ Lancement de la boucle quotidienne d'ajouts/suppressions du rôle d'accès au fumoir...");
			seriousRoleCronLogChannel.send("<a:load:1424326891778867332> Lancement de la boucle quotidienne d'ajouts/suppressions du rôle d'accès au fumoir...");
			await dailySeriousRolesUpdate(gardenGuild as Guild, this.client, seriousRoleCronLogChannel);
		}, {
			timezone: "Europe/Paris",
		});

		// --- DB saving cron: every monday at 3AM ---
		schedule("0 3 * * 1", async () => {
			const dbBackupLogChannel = this.client.channels.cache.get("1426661664475975762") as TextChannel;

			console.log("⌚ Lancement de la sauvegarde hebdomadaire de la base de données...");
			dbBackupLogChannel.send("<a:load:1424326891778867332> Lancement de la sauvegarde hebdomadaire de la base de données...");
			await weeklyDBBackup(User, LinkedUser, dbBackupLogChannel);
		}, {
			timezone: "Europe/Paris",
		});

		// --- Season theme system ---

		// On each start up (in case the bot was down on the day the season changed), check current season and edit the rules messages color
		const rulesChannel = this.client.channels.cache.get(config.rulesChannelId) as TextChannel;

		await updateRulesMessages(rulesChannel, this.client);

		// Each day at 00:05, check if a new season is starting, if not, do nothing. If yes, edit rules messages.
		schedule("5 0 * * *", async () => {
			const startingSeason = getSeasonStartingToday();
			if (!startingSeason) return;

			const seasonsLogChannel = this.client.channels.cache.get("1459323515030212780") as TextChannel;

			console.log("⌚ Changement de saison en cours...");
			seasonsLogChannel.send("<a:load:1424326891778867332> Changement de saison en cours...");

			await updateRulesMessages(rulesChannel, this.client);

			const seasonTranslate = {
				"spring": "au printemps 🌸",
				"summer": "en été ☀️",
				"autumn": "en automne 🍂",
				"winter": "en hiver ❄️",
			};

			seasonsLogChannel.send(`<:round_check:1424065559355592884> Nous sommes passés ${seasonTranslate[startingSeason]} !`);
		},
		{
			timezone: "Europe/Paris",
		},
		);

		return console.log(`Le bot est prêt et connecté en tant que ${this.client.user?.tag}.`);

	}
};
