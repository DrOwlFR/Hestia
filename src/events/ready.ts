import { Event } from "sheweny";
import type { ShewenyClient } from "sheweny";
import config from "../structures/config";
import { ActivityType, ChannelType } from "discord.js";
import { version } from "../../package.json";

export class ReadyEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "ready", {
			description: "Client is logged in",
			once: true,
			emitter: client,
		});
	}

	execute() {
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

		return console.log(`Le bot est prêt et connecté en tant que ${this.client.user?.tag} ! ${guildsIn} serveurs. ${users} utilisateurs et ${channels} salons.`);
	}
};
