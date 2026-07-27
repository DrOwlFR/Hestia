import type { ButtonInteraction } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../structures/config";

export class DisconnectButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["disconnectButton"]);
	}

	/**
	 * Execute: main handler for the disconnect button interaction.
	 * Summary: Initiates the process to disconnect the user's Discord account from the site, checking for a linked account and offering confirmation options if found.
	 * Steps:
	 * - Fetch user data from the site using getUser function
	 * - Handle 404 error (no linked account) or 429 error (rate limit)
	 * - If account exists, reply with confirmation message and buttons for cancel/confirm
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		const { user } = button;

		// Fetch user data from the site
		const getResponse = await this.client.functions.getUser(user.id);

		// Handle case where no linked account exists
		if (getResponse.status === 404) {
			return button.reply({
				content: stripIndent(`
					> *Vous observez Hestia hausser un sourcil en jouant avec ses clefs.*
					— Hm. Non. Je ne trouve pas de formulaire d'entrée à votre nom, vous faites erreur.\n
					-# ${config.emojis.cross} Aucun compte du site n'est associé à ce compte Discord, il ne peut donc pas être déconnecté. Pour connecter votre compte, voir la section « Accepter le règlement ».
					`),
				flags: MessageFlags.Ephemeral,
			});
		}
		// Handle rate limit error
		else if (getResponse.status === 429) {
			return button.update({
				content: stripIndent(`
					— Oulah doucement, pas si vite ! Du calme. Reprenez calmement.\n
					-# ${config.emojis.cross} Limite d'interaction avec le site atteinte. Réessayez dans 60 secondes.
					`),
				components: [],
			});
		}

		// Account exists, offer confirmation
		await button.reply({
			content: "Oh... Vous souhaitez nous quitter ? En êtes-vous sûr·e ? Si vous déconnectez votre compte Discord du site, vous perdez l'accès à tous les salons du Manoir.",
			components: [
				new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder({
							custom_id: "disconnectCancelButton",
							label: "Non ! J'ai changé d'avis",
							style: ButtonStyle.Danger,
							emoji: `${config.emojis.crossWhite}`,
						}),
						new ButtonBuilder({
							custom_id: "disconnectConfirmButton",
							label: "Oui, me déconnecter",
							style: ButtonStyle.Primary,
							emoji: `${config.emojis.brokenChain}`,
						}),
					),
			],
			flags: MessageFlags.Ephemeral,
		});

	}
};
