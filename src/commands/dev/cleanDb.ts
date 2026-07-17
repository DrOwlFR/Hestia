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
	 * Execute: main handler for the `cleandb` command.
	 * Summary: Manually triggers the daily database cleaning task for the guild.
	 * Steps:
	 * - Check if the command is executed in the correct guild
	 * - Access the log channel for database cleaning
	 * - Notify the user and log channel that the manual database cleaning is starting
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		const { guild, guildId } = interaction;

		// Check if the command is executed in the correct guild
		if (!(guild instanceof Guild)) return;
		if (guildId !== config.gardenGuildId) return;

		// Access the log channel for database cleaning
		const dbCleaningCronLogChannel = this.client.channels.cache.get("1427009582076788846");
		if (!dbCleaningCronLogChannel || dbCleaningCronLogChannel.type !== ChannelType.GuildText) return;

		// Notify the user and log channel that the manual database cleaning is starting
		await interaction.reply({
			content: `${config.emojis.loading} Lancement **manuel** du nettoyage de la base de données...`,
			flags: MessageFlags.Ephemeral,
		});

		// Perform the database cleaning task
		await dbCleaningCronLogChannel.send(`${config.emojis.loading} Lancement **manuel** du nettoyage de la base de données...`);
		await dailyDBCleaning(guild, this.client, dbCleaningCronLogChannel);

		// Notify the user that the manual database cleaning has completed
		interaction.editReply({ content: `${config.emojis.check} Fin du nettoyage manuel de la base de données.` });

	}
}
