import { Event } from "sheweny";
import type { ShewenyClient } from "sheweny";
import config from "../structures/config";
import { ActivityType, ChannelType, type TextChannel } from "discord.js";
import { version } from "../../package.json";
import { LinkedUser, User } from "../structures/database/models";
import { EJSON } from "bson";
import fs from "fs";
import { schedule } from "node-cron";

export class ReadyEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "ready", {
			description: "Client is logged in",
			once: true,
			emitter: client,
		});
	}

	async execute() {
		const users = this.client.users.cache.filter(user => !user.bot).size;
		const gardenGuild = this.client.guilds.cache.get(config.gardenGuildId);
		const ampersands = gardenGuild?.roles.cache.get(config.ampersandRoleId)?.members.size;
		const seeds = gardenGuild?.roles.cache.get(config.seedRoleId)?.members.size;
		const guildsIn = this.client.guilds.cache.size;
		const channels = this.client.channels.cache.filter(channel => channel.type !== ChannelType.GuildCategory).size;

		const statusList = [
			`${users} membres`,
			`${ampersands} esperluettes`,
			`${seeds} graines`,
			`Version ${version}`,
		];

		let index = 0;
		setInterval(() => {
			if (index === statusList.length) index = 0;
			const status = statusList[index];

			this.client.user?.setPresence({ activities: [{ name: "status", type: ActivityType.Custom, state: `${status}` }], status: "online" });

			index++;
		}, 7000);

		schedule("0 3 * * 1", async () => {
			const dbBackupLogChannel = this.client.channels.cache.get("1426661664475975762") as TextChannel;
			dbBackupLogChannel!.send("<a:load:1424326891778867332> Lancement de la sauvegarde hebdomadaire de la base de donnée...");
			try {
				const usersDocuments = await User.find().lean();
				const usersEjsonData = EJSON.stringify(usersDocuments, { relaxed: false });
				const now = new Date();
				const formattedDateTime = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
				fs.writeFileSync(`Users-${formattedDateTime}.json`, usersEjsonData, "utf8");
				dbBackupLogChannel!.send("<:round_check:1424065559355592884> La sauvegarde hebdomadaire de la collection `Users` s'est correctement effectuée.");
			}
			catch (err) {
				console.error(err);
				dbBackupLogChannel!.send("<:round_cross:1424312051794186260> <@158205521151787009> La sauvegarde hebdomadaire de la collection `Users` ne s'est pas correctement effectuée.");
			}
			try {
				const linkedUsersDocuments = await LinkedUser.find().lean();
				const linkedUsersEjsonData = EJSON.stringify(linkedUsersDocuments, { relaxed: false });
				const now = new Date();
				const formattedDateTime = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
				fs.writeFileSync(`LinkedUsers-${formattedDateTime}.json`, linkedUsersEjsonData, "utf8");
				dbBackupLogChannel!.send("<:round_check:1424065559355592884> La sauvegarde hebdomadaire de la collection `LinkedUsers` s'est correctement effectuée.");
			}
			catch (err) {
				console.error(err);
				dbBackupLogChannel!.send("<:round_cross:1424312051794186260> <@158205521151787009> La sauvegarde hebdomadaire de la collection `LinkedUsers` ne s'est pas correctement effectuée.");
			}
			dbBackupLogChannel!.send("<:round_cross:1424312051794186260> Fin du script de sauvegarde hebdomadaire de la base de données...");
		}, {
			timezone: "Europe/Paris",
		});

		return console.log(`Le bot est prêt et connecté en tant que ${this.client.user?.tag} ! ${guildsIn} serveurs. ${users} utilisateurs et ${channels} salons.`);
	}
};
