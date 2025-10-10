import { Event } from "sheweny";
import type { ShewenyClient } from "sheweny";
import type { GuildMember, TextChannel } from "discord.js";
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

		await User.findOne({ discordId: member.id }).then(doc => {
			try {
				if (!doc) {
					new User({
						discordId: member.id,
						totalMessages: 0,
						joinedAt: new Date(),
					}).save();
				} else {
					doc.totalMessages = 0;
					doc.joinedAt = new Date();
					doc.save();
				}
			}
			catch (err) {
				console.error(err);
				(this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@158205521151787009> Le document **User** de l'id discord \`${member.id}\` n'a pas été créé correctement lors de son **arrivée sur le serveur**. À vérifier.`);
			}
			finally {
				return doc;
			}
		});

	}
};
