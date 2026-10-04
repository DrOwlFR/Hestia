import type { ModalSubmitInteraction } from "discord.js";
import { GuildMember, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Modal } from "sheweny";

import config from "../../structures/config";
import { VOTE_TRANSLATIONS } from "../../structures/voteSystem/types";
import { registerProxyVote } from "../../structures/voteSystem/voteService";
import { scheduleMessageUpdate } from "../../structures/voteSystem/voteUpdater";

export class ProxyVoteModal extends Modal {
	constructor(client: ShewenyClient) {
		super(client, ["proxyVoteModal"]);
	}

	/**
	 * Execute: main handler for the verification code modal submission.
	 * Summary: Processes the verification code to link the Discord account to the site account, creates or updates the LinkedUser document, and assigns roles based on confirmation status.
	 * Steps:
	 * - Check if interaction is in the correct guild
	 * - Retrieve verification code and attempt to connect user
	 * - Handle errors: 404 (invalid code), 409 (already linked), 429 (rate limit)
	 * - If successful, create or update LinkedUser document in database
	 * - Handle database errors
	 * - Assign confirmed or non-confirmed role and send welcome message
	 * @param modal - The modal submit interaction triggered by the user.
	 */
	async execute(modal: ModalSubmitInteraction) {

		const { channelId, fields, guild, member, message } = modal;

		// Only allow in the site's guild and ensure member is valid
		if (guild?.id !== config.gardenGuildId) return;
		if (!message || !channelId) return;
		if (!member || !(member instanceof GuildMember)) return;

		const pseudo = fields.getTextInputValue("pseudonymInput").trim();
		const [vote] = fields.getCheckboxGroup("voteChoiceCheckboxGroup") as ("yes" | "no" | "abstain")[];
		const displayName = member.displayName || modal.user.username;

		const result = await registerProxyVote(message.id, { id: member.id, displayName }, pseudo, vote);

		if (!result.success) {
			switch (result.reason) {
				case "CLOSED":
					return modal.reply({
						content: "> *Hestia vous adresse un regard entendu, vous jugereriez presque l'avoir entendu soupirer.*\n— Cette session de vote est terminée. Vous ne pouvez plus voter.",
						flags: MessageFlags.Ephemeral,
					});

				case "NOT_FOUND":
					return modal.reply({
						content: "> *Hestia hausse un sourcil, visiblement contrariée.*\n— Je... Je ne retrouve pas la session de vote associée à ce formulaire, désolée.",
						flags: MessageFlags.Ephemeral,
					});

				case "QUOTA_EXCEEDED":
					return modal.reply({
						content: "> *Hestia vous arrête avant que vous ne lachiez votre bulletin dans l'urne.*\n— Je suis navrée, mais vous avez déjà atteint le nombre maximum de votes par procuration autorisés (3). Vous ne pouvez pas en ajouter davantage.",
						flags: MessageFlags.Ephemeral,
					});
			}
		}

		await modal.reply({
			content: `> *Hestia vous adresse un sourire chaleureux.*\n— Merci. J'ai comptabilisé votre vote par procuration pour **${pseudo}**, vous avez voté : **${VOTE_TRANSLATIONS[vote]}**.`,
			flags: MessageFlags.Ephemeral,
		});

		scheduleMessageUpdate(this.client, channelId, message.id);
	}
};
