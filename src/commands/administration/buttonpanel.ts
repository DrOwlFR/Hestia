import { Command } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ChatInputCommandInteraction, MessageFlags, TextChannel } from "discord.js";

export class ButtonPanelCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "buttonpanel",
			description: "Envoie le panneau du bouton des IRLs.",
			category: "Administration",
			userPermissions: ["Administrator"],
			usage: "buttonpanel",
			examples: ["buttonpanel"],
		});
	}

	async execute(interaction: ChatInputCommandInteraction) {

		(interaction.channel as TextChannel).send({
			embeds: [
				this.client.functions.embed()
					.setTitle("Accès aux IRLs")
					.setDescription("Cliquez sur le bouton pour obtenir l'accès au salon des IRLs.\n\n**Rappel des critères** : 2 mois d'ancienneté et 300 messages envoyés."),
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder()
							.setCustomId("irlRoleButton")
							.setStyle(ButtonStyle.Primary)
							.setLabel("Obtenir l'accès aux IRLs")
							.setEmoji("🤝"),
					),
			],
		}).catch(err => {
			interaction.reply({
				content: "<:round_cross:1424312051794186260> Le panel ne s'est pas envoyé suite à une erreur. Veuillez contacter le développeur.",
				flags: MessageFlags.Ephemeral,
			});
			return console.error(err);
		});

		return interaction.reply({ content: "<:round_check:1424065559355592884> Panel du button des IRLs envoyé avec succès.", flags: MessageFlags.Ephemeral });
	}
}
