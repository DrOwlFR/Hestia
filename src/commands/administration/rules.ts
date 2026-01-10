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

	async execute(interaction: ChatInputCommandInteraction) {

		if (!this.client.admins.find(id => id === interaction.user.id) && !(interaction.member?.permissions as PermissionsBitField).has(PermissionFlagsBits.Administrator)) {
			return interaction.reply({
				content: "<:round_cross:1424312051794186260> Vous n'avez pas les permissions requises pour utiliser cette commande.",
				flags: MessageFlags.Ephemeral,
			});
		}

		await interaction.reply({ content: "<a:load:1424326891778867332> Envoie des règles en cours...", flags: MessageFlags.Ephemeral });

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

		return interaction.followUp({ content: "<:round_check:1424065559355592884> Les règles ont été envoyées correctement.", flags: MessageFlags.Ephemeral });
	}
}
