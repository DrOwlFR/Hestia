import { ChannelType, type ChatInputCommandInteraction, Guild, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

import config from "../../structures/config";
import { dailySeriousRolesUpdate } from "../../structures/tasks/seriousRole";

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
	 * - Access the log channel for serious roles update
	 * - Notify the user and log channel that the manual serious roles update is starting
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		const { guild, guildId } = interaction;

		// Check if the command is executed in the correct guild
		if (!(guild instanceof Guild)) return;
		if (guildId !== config.gardenGuildId) return;

		// Access the log channel for serious roles update
		const seriousRoleCronLogChannel = this.client.channels.cache.get("1426975372716806316");
		if (!seriousRoleCronLogChannel || seriousRoleCronLogChannel.type !== ChannelType.GuildText) return;

		// Notify the user and log channel that the manual addition/removal of the 'serious' role is starting
		await interaction.reply({
			content: `${config.emojis.loading} Lancement **manuel** de l'ajouts/suppressions du rôle d'accès au fumoir...`,
			flags: MessageFlags.Ephemeral,
		});

		// Perform the daily serious roles update task
		seriousRoleCronLogChannel.send(`${config.emojis.loading} Lancement **manuel** de l'ajouts/suppressions du rôle d'accès au fumoir...`);
		await dailySeriousRolesUpdate(guild, this.client, seriousRoleCronLogChannel);

		// Notify the user that the manual addition/removal of the 'serious' role has completed
		await interaction.editReply({ content: `${config.emojis.check} Fin de l'ajouts/suppressions **manuel** du rôle d'accès au fumoir.` });
	}
}
