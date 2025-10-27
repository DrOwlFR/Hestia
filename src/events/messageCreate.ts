import type { Message } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";

import config from "../structures/config";
import { User } from "../structures/database/models";

export class MessageCreateEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "messageCreate", {
			description: "New message is send",
			once: false,
			emitter: client,
		});
	}

	async execute(message: Message) {

		if (message.author.bot) return;
		if (!message.guild) return;
		if (message.guildId !== config.gardenGuildId) return;

		const [today] = new Date().toISOString().split("T");

		try {
			const user = await User.findOneAndUpdate(
				{ discordId: message.author.id },
				{
					$inc: { totalMessages: 1 },
					$setOnInsert: {
						joinedAt: message.member?.joinedAt,
						messagesPerDay: [{ date: today, count: 0 }],
					},
				},
				{ new: true, upsert: true },
			);

			const index = user.messagesPerDay.findIndex(entry => entry.date === today);
			if (index !== -1) {
				const entryToUpdate = { ...user.messagesPerDay[index] };
				entryToUpdate.count += 1;
				user.messagesPerDay[index] = entryToUpdate;
			}
			else {
				user.messagesPerDay.push({ date: today, count: 1 });
			}
			await user.save();
		}
		catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
		}

	}
};
