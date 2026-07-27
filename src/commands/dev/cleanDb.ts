import { type ChatInputCommandInteraction, Guild, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

import config from "../../structures/config";
import { dailyDBCleaning } from "../../structures/tasks/dBCleaning";
import { sendLog } from "../../structures/utils/functions";

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

		// Notify the user and log channel that the manual database cleaning is starting
		await interaction.reply({
			content: `${config.emojis.loading} Lancement __**manuel**__ du nettoyage de la base de données...`,
			flags: MessageFlags.Ephemeral,
		});

		// Perform the database cleaning task
		await sendLog(this.client, "dbCleaningCron", `${config.emojis.loading} Lancement __**manuel**__ du nettoyage de la base de données...`);
		await dailyDBCleaning(this.client);

		// Notify the user that the manual database cleaning has completed
		await sendLog(this.client, "dbCleaningCron", `${config.emojis.check} Fin du nettoyage __**manuel**__ de la base de données.`);
		await interaction.editReply({ content: `${config.emojis.check} Fin du nettoyage __**manuel**__ de la base de données.` });

	}
}
