import type { ButtonInteraction } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";

export class DisconnectButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["disconnectButton"]);
	}

	async execute(button: ButtonInteraction) {

		await button.reply({
			content: "Oh... Vous souhaitez nous quitter ? En êtes-vous sûr·e ? Si vous déconnectez votre compte Discord du site, vous perdez l'accès à tous les salons du Manoir.",
			components: [
				new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder({
							custom_id: "disconnectCancelButton",
							label: "Non ! J'ai changé d'avis",
							style: ButtonStyle.Danger,
							emoji: "✖️",
						}),
						new ButtonBuilder({
							custom_id: "disconnectConfirmButton",
							label: "Oui, me déconnecter",
							style: ButtonStyle.Primary,
							emoji: "⛓️‍💥",
						}),
					),
			],
			flags: MessageFlags.Ephemeral,
		});

	}
};
