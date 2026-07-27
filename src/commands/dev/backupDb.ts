import { type ChatInputCommandInteraction, Guild, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

import config from "../../structures/config";
import { LinkedUser, MessageStats, User } from "../../structures/database/models";
import { weeklyDBBackup } from "../../structures/tasks/dBBackup";
import { sendLog } from "../../structures/utils/functions";

export class BackupDbCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "backupdb",
			description: "Sauvegarde la base de données.",
			category: "Dev",
			adminsOnly: true,
			usage: "backupdb",
			examples: ["backupdb"],
		});
	}

	/**
	 * Execute: main handler for the `backupdb` command.
	 * Summary: Manually triggers the daily database backup task for the guild.
	 * Steps:
	 * - Check if the command is executed in the correct guild
	 * - Notify the user and log channel that the manual database backup is starting
	 * - Perform the database backup task
	 * - Notify the user that the manual database backup has completed
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		const { guild, guildId } = interaction;

		// Check if the command is executed in the correct guild
		if (!(guild instanceof Guild)) return;
		if (guildId !== config.gardenGuildId) return;

		// Notify the user and log channel that the manual database backup is starting
		await interaction.reply({
			content: `${config.emojis.loading} Lancement __**manuel**__ de la sauvegarde de la base de données...`,
			flags: MessageFlags.Ephemeral,
		});

		// Perform the database backup task
		await sendLog(this.client, "dbBackupCron", `${config.emojis.loading} Lancement __**manuel**__ de la sauvegarde de la base de données...`);
		await weeklyDBBackup(this.client, User, LinkedUser, MessageStats);

		// Notify the user that the manual database backup has completed
		await sendLog(this.client, "dbBackupCron", `${config.emojis.check} Fin de la sauvegarde __**manuelle**__ de la base de données...`);
		await interaction.editReply({ content: `${config.emojis.check} Fin de la sauvegarde __**manuelle**__ de la base de données.` });

	}
}
