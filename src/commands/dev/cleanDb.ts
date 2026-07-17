import { ChannelType, type ChatInputCommandInteraction, Guild, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

import config from "../../structures/config";
import { dailyDBCleaning } from "../../structures/tasks/dBCleaning";

export class CleanDbCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "cleandb",
			description: "Nettoie la base de données.",
			category: "Dev",
			adminsOnly: true,
			usage: "cleandb",
			examples: ["cleandb"],
		});
	}

	/**
	 * Execute: main handler invoked when the command is used.
	 * Steps:
	 * - Fetch the target message by ID in the current channel
	 * - Edit the message content
	 * - Reply to the command issuer with success or error (ephemeral)
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		const { guild, guildId } = interaction;

		if (!(guild instanceof Guild)) return;
		if (guildId !== config.gardenGuildId) return;

		const dbCleaningCronLogChannel = this.client.channels.cache.get("1427009582076788846");
		if (!dbCleaningCronLogChannel || dbCleaningCronLogChannel.type !== ChannelType.GuildText) return;

		interaction.reply({
			content: `${config.emojis.loading} Lancement **manuel** du nettoyage de la base de données...`,
			flags: MessageFlags.Ephemeral,
		});

		await dbCleaningCronLogChannel.send(`${config.emojis.loading} Lancement **manuel** du nettoyage de la base de données...`);
		await dailyDBCleaning(guild, this.client, dbCleaningCronLogChannel);

		interaction.editReply({ content: `${config.emojis.check} Fin du nettoyage manuel de la base de données.` });

	}
}
