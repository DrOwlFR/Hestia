import type { GuildMember, TextChannel } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";

import config from "../structures/config";
import { User } from "../structures/database/models";

export class GuildMemberAddEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "guildMemberAdd", {
			description: "New member joins the guild",
			once: false,
			emitter: client,
		});
	}

	async execute(member: GuildMember) {

		if (member.user.bot) return;
		if (member.guild.id !== config.gardenGuildId) return;

		try {
			await User.findOneAndUpdate(
				{ discordId: member.id },
				[{
					$set: {
						discordUsername: { $ifNull: ["$discordUsername", member?.user.username] },
						totalMessages: { $ifNull: ["$totalMessages", 0] },
						messagesPerDay: { $ifNull: ["$messagesPerDay", []] },
						joinedAt: { $ifNull: ["$joinedAt", (member as GuildMember).joinedAt] },
						__v: { $add: { $ifNull: ["$__v", 0] } },
						createdAt: { $ifNull: ["$createdAt", "$$NOW"] },
					},
				}],
				{ upsert: true },
			);
		}
		catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
			(this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@158205521151787009> Le document **User** de l'id discord \`${member.id}\` n'a pas été créé correctement lors de son **arrivée sur le serveur**. À vérifier.`);
		}

	}
};
