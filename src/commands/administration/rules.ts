import type { ChatInputCommandInteraction } from "discord.js";
import { ChannelType, GuildMember, MessageFlags, PermissionFlagsBits } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

import { rulesMessages } from "../../structures/utils/rulesMessages";

export class RulesCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "rules",
			description: "Envoie les règles du Jardin.",
			category: "Administration",
			usage: "rules",
			examples: ["rules"],
		});
	}

	/**
	 * Execute: main handler for the `rules` command.
	 * Summary: Send a series of rule messages with interactive components to the current text channel.
	 * Steps:
	 * - Check if the user has admin permissions (bot admin/dev or server admin)
	 * - Reply with a loading message
	 * - Send each rule message component sequentially
	 * - Follow up with a success message
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		// Permission check for administrators and bot admins
		const isAdmin = this.client.admins.includes(interaction.user.id) || interaction.member instanceof GuildMember && interaction.member.permissions.has(PermissionFlagsBits.Administrator);
		if (!isAdmin) {
			return interaction.reply({
				content: "<:round_cross:1424312051794186260> Vous n'avez pas les permissions requises pour utiliser cette commande.",
				flags: MessageFlags.Ephemeral,
			});
		}

		// Reply with a loading message while sending the rules
		await interaction.reply({ content: "<a:load:1424326891778867332> Envoie des règles en cours...", flags: MessageFlags.Ephemeral });

		// Get the current channel and verify it's a text channel
		const { channel } = interaction;
		if (!channel || channel.type !== ChannelType.GuildText) {
			return interaction.followUp({ content: "<:round_cross:1424312051794186260> Cette commande doit être utilisée dans un salon texte.", flags: MessageFlags.Ephemeral });
		}

		// Sending the rules messages one by one
		await channel.send({
			components: [
				rulesMessages.intro,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await channel.send({
			components: [
				rulesMessages.rules1,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await channel.send({
			components: [
				rulesMessages.rules2,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await channel.send({
			components: [
				rulesMessages.serverAccess,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await channel.send({
			components: [
				rulesMessages.vocabulary,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await channel.send({
			components: [
				rulesMessages.triggerWarnings,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await channel.send({
			components: [
				rulesMessages.restrictedChannels,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await channel.send({
			components: [
				rulesMessages.separator,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await channel.send({
			components: [
				rulesMessages.form,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		// Follow up with a success message
		return interaction.followUp({ content: "<:round_check:1424065559355592884> Les règles ont été envoyées correctement.", flags: MessageFlags.Ephemeral });
	}
}
