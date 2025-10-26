import type { ButtonInteraction } from "discord.js";
import { ActionRowBuilder, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";

export class RulesAcceptButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["rulesAcceptButton"]);
	}

	async execute(button: ButtonInteraction) {

		await button.showModal(
			new ModalBuilder()
				.setCustomId("verificationCodeModal")
				.setTitle("Entrez votre code de vérification")
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent("**Rappel** : Pour obtenir votre code de vérification. Rendez-vous sur votre page de profil du site, et cliquez sur le bouton « Lier »."),
				)
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>()
						.addComponents(
							new TextInputBuilder({
								custom_id: "verificationCode",
								style: TextInputStyle.Short,
								label: "Code de vérification",
								required: true,
							}),
						),
				),
		);

	}
};
