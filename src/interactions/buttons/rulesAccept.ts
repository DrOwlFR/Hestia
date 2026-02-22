import type { ButtonInteraction } from "discord.js";
import { ActionRowBuilder, MessageFlags, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../structures/config";

export class RulesAcceptButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["rulesAcceptButton"]);
	}

	/**
	 * Execute: main handler for the rules accept button interaction.
	 * Summary: Handles accepting rules by checking for an existing linked account and showing a verification modal if the user is eligible to link.
	 * Steps:
	 * - Fetch user data from the site
	 * - If already linked (status not 404 or 429), reply with denial message
	 * - If rate limited (429), update with error message
	 * - Otherwise, show modal for entering verification code
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		const getResponse = await this.client.functions.getUser(button.user.id);

		// Check if user already has a linked account
		if (![404, 429].includes(getResponse.status)) {
			return button.reply({
				content: stripIndent(`
								> *Hestia fronce les sourcils en lisant votre formulaire qu'elle s'empresse de déchirer.*
								— Mais... Vous avez déjà rempli ce formulaire ! Vous me faites perdre mon temps. Oust ! Nom d'une Esperluette !\n
								-# ${config.emojis.cross} Votre compte Discord est déjà associé à un compte sur le site, ou bien un autre compte Discord est déjà associé au compte sur le site. **Si vous pensez que c'est une erreur, veuillez contacter un·e membre de l'équipe**.
								`),
				flags: MessageFlags.Ephemeral,
			});
		}
		// Handle rate limit
		else if (getResponse.status === 429) {
			return button.update({
				content: stripIndent(`
					— Oulah doucement, pas si vite ! Du calme. Reprenez calmement.\n
					-# ${config.emojis.cross} Limite d'interaction avec le site atteinte. Réessayez dans 60 secondes.
					`),
				components: [],
			});
		}

		// Show verification code modal
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
