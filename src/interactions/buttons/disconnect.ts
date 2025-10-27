import type { ButtonInteraction } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

export class DisconnectButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["disconnectButton"]);
	}

	async execute(button: ButtonInteraction) {

		const { user } = button;

		const getResponse = await this.client.functions.getUser(user.id);

		if (getResponse.status === 404) {
			return button.reply({
				content: stripIndent(`
					> *Vous observez Hestia hausser un sourcil en jouant avec ses clefs.*
					— Hm. Non. Je ne trouve pas de formulaire d'entrée à votre nom, vous faites erreur.\n
					-# <:round_cross:1424312051794186260> Aucun compte du site n'est associé à ce compte Discord, il ne peut donc pas être déconnecté. Pour connecter votre compte, voir la section « Accepter le règlement ».
					`),
				flags: MessageFlags.Ephemeral,
			});
		}

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
