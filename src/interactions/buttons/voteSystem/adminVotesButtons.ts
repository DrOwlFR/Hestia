import { type ButtonInteraction, GuildMember, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../../structures/config";
import { setVoteStatus } from "../../../structures/voteSystem/voteService";
import { scheduleMessageUpdate } from "../../../structures/voteSystem/voteUpdater";

export class AdminVotesButtons extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["voteCloseButton", "voteReopenButton"]);
	}

	/**
	 * Execute: main handler for the admin votes buttons interaction.
	 * Summary: Handles closing and reopening vote sessions by checking for existing votes and updating the session status.
	 * Steps:
	 * - Only allow in the site's guild and ensure member is valid
	 * - Permission check for guild administrators and bot admins
	 * - Check if the vote session exists in the database
	 * - Handle the button actions based on the custom ID (close or reopen the vote session)
	 * - Save the updated vote document to the database and send a confirmation reply
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		const { channelId, customId, guildId, member, message } = button;

		// Only allow in the site's guild and ensure member is valid
		if (guildId !== config.gardenGuildId) return;
		if (!member || !(member instanceof GuildMember)) return;

		// Permission check for guild administrators and bot admins
		const isAdmin = this.client.admins.includes(member.id) ||
			config.adminsDiscordIds.includes(member.id);
		if (!isAdmin) {
			return button.reply({
				content: stripIndent(`
							> *Alors que vous essayez désespérément de faire fonctionner ce mécanisme, vous entendez des talons approcher en claquant sur le sol. Puis… La voix de la Concierge.*
							— Hep, hep, hep ! Que croyez-vous faire là ? Vous n'avez pas le droit ! Déguerpissez !\n
							-# ${config.emojis.cross} Vous n'avez pas les permissions suffisantes pour ce bouton. Ce dernier est réservé à mon Développeur, aux Majuscules et à mon développeur.
						`),
				flags: MessageFlags.Ephemeral,
			});
		}

		const shouldClose = customId === "voteCloseButton";
		const result = await setVoteStatus(message.id, shouldClose);

		if (!result.success) {
			switch (result.reason) {
				case "NOT_FOUND":
					return button.reply({
						content: "> *Hestia hausse un sourcil, visiblement contrariée.*\n— Je... Je ne retrouve pas la session de vote associée à ce formulaire, désolée.",
						flags: MessageFlags.Ephemeral,
					});
				case "ALREADY_IN_STATE":
					return button.reply({
						content: shouldClose
							? "> *Hestia secoue la tête suite à votre demande.*\n— La session de vote est déjà fermée."
							: "> *Hestia secoue la tête suite à votre demande.*\n— La session de vote est déjà ouverte. Vous ne pouvez pas la rouvrir.",
						flags: MessageFlags.Ephemeral,
					});
			}
		}

		const messageFeedback = shouldClose
			? "> *Hestia hoche la tête et annonce à l'assemblée.*\n— La session de vote est maintenant **fermée** ! Les boutons de vote sont désactivés et les votes ne peuvent plus être enregistrés."
			: "> *Hestia hoche la tête et annonce à l'assemblée.*\n— La session de vote est à nouveau **ouverte** !";

		await button.reply({
			content: messageFeedback,
		});

		scheduleMessageUpdate(this.client, channelId, message.id);
	}
};
