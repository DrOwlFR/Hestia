import { GuildMember } from "discord.js";
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

	/**
	 * Execute: handler for the `guildMemberAdd` event.
	 * Summary: Triggered when a new member joins the guild. Creates or updates their User document in the database.
	 * Behavior:
	 * - Skips bots and members from other guilds
	 * - Upserts a User document with initial stats and join info
	 * - Logs errors to a specific channel if database operation fails
	 * @param member - The guild member that joined.
	 */
	async execute(member: GuildMember) {

		// Skip bots and members from other guilds
		if (!(member instanceof GuildMember)) return;
		if (member.user.bot) return;
		if (member.guild.id !== config.gardenGuildId) return;

		await this.client.functions.log("dbError", `Erreur lors de la création du document **User** pour l'id discord \`${member.id}\` à son arrivée sur le serveur.\n\`\`\`test\`\`\``);

		try {
			// Create or update the User document with initial data
			await User.findOneAndUpdate(
				{ discordId: member.id },
				[{
					$set: {
						discordUsername: { $ifNull: ["$discordUsername", member?.user.username] },
						totalMessages: { $ifNull: ["$totalMessages", 0] },
						messagesPerDay: { $ifNull: ["$messagesPerDay", []] },
						joinedAt: { $ifNull: ["$joinedAt", member.joinedAt] },
						__v: { $add: { $ifNull: ["$__v", 0] } },
						createdAt: { $ifNull: ["$createdAt", "$$NOW"] },
					},
				}],
				{ upsert: true, updatePipeline: true },
			);
		}
		catch (err) {
			// Log the error to console and notify admins in a channel
			// eslint-disable-next-line no-console
			console.error(err);
			await this.client.functions.log("dbError", `<@${config.botAdminsIds[0]}> Le document **User** de l'id discord \`${member.id}\` n'a pas été créé correctement lors de son **arrivée sur le serveur**. À vérifier.\n\`\`\`${err}\`\`\``);
		}

	}
};
