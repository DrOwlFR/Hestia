import type { ChatInputCommandInteraction, PermissionsBitField, TextChannel } from "discord.js";
import { MessageFlags, PermissionFlagsBits } from "discord.js";
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
		if (!this.client.admins.find(id => id === interaction.user.id) && !(interaction.member?.permissions as PermissionsBitField).has(PermissionFlagsBits.Administrator)) {
			return interaction.reply({
				content: "<:round_cross:1424312051794186260> Vous n'avez pas les permissions requises pour utiliser cette commande.",
				flags: MessageFlags.Ephemeral,
			});
		}

		// Reply with a loading message while sending the rules
		await interaction.reply({ content: "<a:load:1424326891778867332> Envoie des règles en cours...", flags: MessageFlags.Ephemeral });

		// Sending the rules messages one by one
		await (interaction.channel as TextChannel).send({
			components: [
				rulesMessages.intro,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				rulesMessages.rules1,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				rulesMessages.rules2,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				rulesMessages.serverAccess,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				rulesMessages.vocabulary,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				rulesMessages.triggerWarnings,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				rulesMessages.restrictedChannels,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				rulesMessages.separator,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				rulesMessages.form,
			],
			flags: MessageFlags.IsComponentsV2,
		});

		// Follow up with a success message
		return interaction.followUp({ content: "<:round_check:1424065559355592884> Les règles ont été envoyées correctement.", flags: MessageFlags.Ephemeral });
	}
}
