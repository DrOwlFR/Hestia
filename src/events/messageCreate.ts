import { Event } from "sheweny";
import type { ShewenyClient } from "sheweny";
import type { Message } from "discord.js";
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

		try {
			await User.findOneAndUpdate({ discordId: message.author.id }, { $inc: { totalMessages: +1 } }).then(doc => {
				if (!doc) {
					new User({
						discordId: message.author.id,
						totalMessages: 1,
						joinedAt: message.member?.joinedAt,
					}).save();
				}
			});
		}
		catch (err) {
			console.error(err);
		}

	}
};
