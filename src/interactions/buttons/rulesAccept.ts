import type { ButtonInteraction } from "discord.js";
import { ActionRowBuilder, MessageFlags, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

export class RulesAcceptButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["rulesAcceptButton"]);
	}

	async execute(button: ButtonInteraction) {

		const getResponse = await this.client.functions.getUser(button.user.id);

		if (getResponse.status !== 404) {
			return button.reply({
				content: stripIndent(`
								> *Hestia fronce les sourcils en lisant votre formulaire qu'elle s'empresse de déchirer.*
								— Mais... Vous avez déjà rempli ce formulaire ! Vous me faites perdre mon temps. Oust ! Nom d'une Esperluette !\n
								-# <:round_cross:1424312051794186260> Votre compte Discord est déjà associé à un compte sur le site, ou bien un autre compte Discord est déjà associé au compte sur le site. **Si vous pensez que c'est une erreur, veuillez contacter un·e membre de l'équipe**.
								`),
				flags: MessageFlags.Ephemeral,
			});
		}

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
