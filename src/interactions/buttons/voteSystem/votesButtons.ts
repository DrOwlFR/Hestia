import { type ButtonInteraction, GuildMember, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";

import config from "../../../structures/config";
import type { VoteButtonCustomId } from "../../../structures/voteSystem/types";
import { BUTTON_CHOICE_MAP, VOTE_TRANSLATIONS } from "../../../structures/voteSystem/types";
import { registerDirectVote } from "../../../structures/voteSystem/voteService";
import { scheduleMessageUpdate } from "../../../structures/voteSystem/voteUpdater";

export class VotesButtons extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["voteYesButton", "voteNoButton", "voteAbstainButton"]);
	}

	/**
	 * Execute: main handler for the votes buttons interaction.
	 * Summary: Handles direct voting by checking for existing votes, registering the new vote, and providing feedback to the user.
	 * Steps:
	 * - Only allow in the site's guild and ensure member is valid
	 * - Check if the vote session exists in the database
	 * - Check if the vote session is closed
	 * - Get the display name of the member, falling back to the username if not available
	 * - Get the choice based on the button's custom ID
	 * - Register the direct vote and determine if it was an update or a new vote
	 * - Prepare the message content based on whether it was an update or a new vote
	 * - Send a confirmation reply to the user
	 * - Schedule an update for the message to reflect the new vote counts
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		const { customId, guildId, member, message, user } = button;

		// Only allow in the site's guild and ensure member is valid
		if (guildId !== config.gardenGuildId) return;
		if (!member || !(member instanceof GuildMember)) return;

		// Get the display name of the member, falling back to the username if not available
		const displayName = member.displayName || user.username;

		// Get the choice based on the button's custom ID
		const vote = BUTTON_CHOICE_MAP[customId as VoteButtonCustomId];
		if (!vote) return;

		// Register the direct vote
		const result = await registerDirectVote(message.id, { id: user.id, displayName }, vote);

		// Handle the result of the vote registration
		if (!result.success) {
			switch (result.reason) {
				case "NOT_FOUND":
					return button.reply({
						content: "> *Hestia hausse un sourcil, visiblement contrariée.*\n— Je... Je ne retrouve pas la session de vote associée à ce formulaire, désolée.",
						flags: MessageFlags.Ephemeral,
					});
				case "CLOSED":
					return button.reply({
						content: "> *Hestia vous adresse un regard entendu, vous jugereriez presque l'avoir entendu soupirer.*\n— Cette session de vote est terminée. Vous ne pouvez plus voter.",
						flags: MessageFlags.Ephemeral,
					});
			}
		}

		// Prepare the message content based on whether it was an update or a new vote
		const messageContent = result.isUpdate
			? `> *Hestia regarde votre bulletin et hoche la tête.*\n— Très bien, j'ai modifié votre vote, il s'agit à présent de : **${VOTE_TRANSLATIONS[vote]}**.`
			: `> *Hestia regarde votre bulletin et hoche la tête.*\n— Très bien, j'ai comptabilisé votre vote, vous avez voté : **${VOTE_TRANSLATIONS[vote]}**.`;

		// Send a confirmation reply to the user
		await button.reply({
			content: messageContent,
			flags: MessageFlags.Ephemeral,
		});

		// Schedule an update for the message to reflect the new vote counts
		scheduleMessageUpdate(this.client, button.channelId, button.message.id);
	}
};
