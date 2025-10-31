/* eslint-disable no-console */
import type { Guild, TextChannel } from "discord.js";
import { ActivityType, ChannelType } from "discord.js";
import { schedule } from "node-cron";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";

import { version } from "../../package.json";
import config from "../structures/config";
import { LinkedUser, User } from "../structures/database/models";
import { weeklyDBBackup } from "../structures/tasks/dBBackup";
import { dailyDBCleaning } from "../structures/tasks/dBCleaning";
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

		let users = this.client.users.cache.filter(user => !user.bot).size;
		const guildsIn = this.client.guilds.cache.size;
		const channels = this.client.channels.cache.filter(channel => channel.type !== ChannelType.GuildCategory).size;

		// Bot status messages
		let index = 0;
		setInterval(() => {
			const gardenGuild = this.client.guilds.cache.get(config.gardenGuildId);

			users = gardenGuild!.members.cache.filter(member => !member.user.bot).size;
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
			const seriousRoleCronLogChannel = gardenGuild?.channels.cache.get("1426975372716806316") as TextChannel;

			console.log("⌚ Lancement de la boucle quotidienne d'ajouts/suppressions du rôle d'accès au fumoir...");
			seriousRoleCronLogChannel.send("<a:load:1424326891778867332> Lancement de la boucle quotidienne d'ajouts/suppressions du rôle d'accès au fumoir...");
			await dailySeriousRolesUpdate(gardenGuild as Guild, this.client, seriousRoleCronLogChannel);
		}, {
			timezone: "Europe/Paris",
		});

		// --- DB saving cron: every monday at 3AM ---
		schedule("0 3 * * 1", async () => {
			const gardenGuild = this.client.guilds.cache.get(config.gardenGuildId);
			const dbBackupLogChannel = gardenGuild?.channels.cache.get("1426661664475975762") as TextChannel;

			console.log("⌚ Lancement de la sauvegarde hebdomadaire de la base de données...");
			dbBackupLogChannel.send("<a:load:1424326891778867332> Lancement de la sauvegarde hebdomadaire de la base de données...");
			await weeklyDBBackup(User, LinkedUser, dbBackupLogChannel);
		}, {
			timezone: "Europe/Paris",
		});

		return console.log(`Le bot est prêt et connecté en tant que ${this.client.user?.tag} ! ${guildsIn} serveurs. ${users} utilisateurs et ${channels} salons.`);
	}
};
