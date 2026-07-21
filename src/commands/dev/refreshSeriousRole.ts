import { type ChatInputCommandInteraction, Guild, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

import config from "../../structures/config";
import { dailySeriousRolesUpdate } from "../../structures/tasks/seriousRole";
import { sendLog } from "../../structures/utils/functions";

export class RefreshSeriousRoleCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "refreshseriousrole",
			description: "Actualise le rôle du fumoir.",
			category: "Dev",
			adminsOnly: true,
			usage: "refreshseriousrole",
			examples: ["refreshseriousrole"],
		});
	}

	/**
	 * Execute: main handler for the `refreshseriousrole` command.
	 * Summary: Manually triggers the daily serious roles update task, which adds or removes the 'serious' role for users based on their activity.
	 * Steps:
	 * - Check if the command is executed in the correct guild
	 * - Notify the user and log channel that the manual serious roles update is starting
	 * - Perform the daily serious roles update task
	 * - Notify the user that the manual serious roles update has completed
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		const { guild, guildId } = interaction;

		// Check if the command is executed in the correct guild
		if (!(guild instanceof Guild)) return;
		if (guildId !== config.gardenGuildId) return;

		// Notify the user and log channel that the manual addition/removal of the 'serious' role is starting
		await interaction.reply({
			content: `${config.emojis.loading} Lancement __**manuel**__ de l'ajouts/suppressions du rôle d'accès au fumoir...`,
			flags: MessageFlags.Ephemeral,
		});

		// Perform the daily serious roles update task
		await sendLog(this.client, "seriousRoleCron", `${config.emojis.loading} Lancement __**manuel**__ de l'ajouts/suppressions du rôle d'accès au fumoir...`);
		await dailySeriousRolesUpdate(this.client);

		// Notify the user that the manual addition/removal of the 'serious' role has completed
		await sendLog(this.client, "seriousRoleCron", `${config.emojis.check} Fin de l'ajouts/suppressions __**manuel**__ du rôle d'accès au fumoir...`);
		await interaction.editReply({ content: `${config.emojis.check} Fin de l'ajouts/suppressions __**manuel**__ du rôle d'accès au fumoir.` });
	}
}
