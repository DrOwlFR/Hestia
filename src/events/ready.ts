/* eslint-disable no-console */
import Bottleneck from "bottleneck";
import type { ThreadChannel } from "discord.js";
import { ActivityType, ChannelType } from "discord.js";
import { schedule } from "node-cron";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";

import { version } from "../../package.json";
import config from "../structures/config";
import { LinkedUser, MessageStats, User } from "../structures/database/models";
import { weeklyDBBackup } from "../structures/tasks/dBBackup";
import { dailyDBCleaning } from "../structures/tasks/dBCleaning";
import { getCurrentSeason, getSeasonStartingToday, updateSeasonalTheme } from "../structures/tasks/seasonsSystem";
import { dailySeriousRolesUpdate } from "../structures/tasks/seriousRole";
import { getGardenGuild } from "../structures/utils/functions";

export class ReadyEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "ready", {
			description: "Client is logged in",
			once: true,
			emitter: client,
		});
	}

	/**
	 * Execute: handler for the `ready` event (fired once when the bot logs in).
	 * Summary: Initializes bot presence, schedules cron jobs for maintenance tasks, updates seasonal rules, and joins active threads.
	 * Steps:
	 * - Set up rotating status messages
	 * - Schedule daily DB cleaning, serious role updates, weekly DB backups
	 * - Handle seasonal theme changes and rules updates
	 * - Join all active threads in text/announcement/forum channels
	 */
	async execute() {

		// Bot status messages
		let index = 0;
		setInterval(async () => {
			const gardenGuild = await getGardenGuild(this.client);
			if (!gardenGuild) return;

			const users = gardenGuild.members.cache.filter(member => !member.user.bot).size;
			const confirmedUsers = gardenGuild.roles.cache.get(config.confirmedUserRoleId)?.members.size;
			const nonConfirmedUsers = gardenGuild.roles.cache.get(config.nonConfirmedUserRoleId)?.members.size;
			const statusList = [
				`${users} membre${users > 1 ? "s" : ""}`,
				`${confirmedUsers} esperluette${confirmedUsers! > 1 ? "s" : ""}`,
				`${nonConfirmedUsers} graine${nonConfirmedUsers! > 1 ? "s" : ""}`,
				`Version ${version}`,
				`Illustration par ${config.illustratorName}`,
			];

			if (index === statusList.length) index = 0;
			const status = statusList[index];

			this.client.user?.setPresence({ activities: [{ name: "status", type: ActivityType.Custom, state: `${status}` }], status: "online" });

			index++;
		}, 7000);

		// --- DB cleaning cron: everyday at 1 AM ---
		// Cleans the Users and LinkedUsers collections: removes users no longer in guild, deletes site links, removes roles
		schedule("0 1 * * *", async () => {
			await dailyDBCleaning(this.client);
		}, {
			timezone: "Europe/Paris",
		});

		// --- Serious role adding/removing cron: everyday at 2AM ---
		// Updates 'serious' role based on message count (50+ in last 30 days for confirmed users)
		schedule("0 2 * * *", async () => {
			await dailySeriousRolesUpdate(this.client);
		}, {
			timezone: "Europe/Paris",
		});

		// --- DB saving cron: every monday at 3AM ---
		// Backs up Users, LinkedUsers, and MessageStats collections to JSON files
		schedule("0 3 * * 1", async () => {
			await weeklyDBBackup(this.client, User, LinkedUser, MessageStats);
		}, {
			timezone: "Europe/Paris",
		});

		// --- Season theme system ---

		// On each start up (in case the bot was down on the day the season changed), check current season and edit the rules messages color and guild icon accordingly
		const currentSeason = getCurrentSeason();
		await updateSeasonalTheme(this.client, currentSeason);

		// Each day at 00:05, check if a new season is starting, if not, do nothing. If yes, edit rules messages.
		schedule("5 0 * * *", async () => {
			const startingSeason = getSeasonStartingToday();
			if (!startingSeason) return;

			// Edits rules messages and guild icon with new seasonal colors
			await updateSeasonalTheme(this.client, startingSeason);
		}, {
			timezone: "Europe/Paris",
		},
		);

		// --- Threads joining system ---

		// Fetch all channels in the guild
		const gardenGuild = await getGardenGuild(this.client);
		if (!gardenGuild) return;
		const channels = await gardenGuild.channels.fetch();

		// Rate limiter to avoid hitting Discord's API limits when joining threads
		const threadJoinLimiter = new Bottleneck({
			maxConcurrent: 1,
			minTime: 300,
		});

		// Iterate through channels and join active threads
		for (const channel of channels.values()) {
			if (!channel) continue;
			if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement && channel.type !== ChannelType.GuildForum) { continue; }

			// Fetch active threads for the channel (different methods for forum vs text/announcement)
			const activeThreads =
				channel.type === ChannelType.GuildForum
					? await channel.threads.fetch()
					: await channel.threads.fetchActive();

			// Join each active thread if not already joined, using rate limiter
			for (const thread of activeThreads.threads.values()) {
				if (!thread.joined) {
					try {
						await threadJoinLimiter.schedule<ThreadChannel>(async () => thread.join());
					} catch {}
				}
			}

		}

		return console.log(`Le bot est prêt et connecté en tant que ${this.client.user?.tag}.`);

	}
};
