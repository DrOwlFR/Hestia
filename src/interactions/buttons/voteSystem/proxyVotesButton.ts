import { type ButtonInteraction, CheckboxGroupBuilder, CheckboxGroupOptionBuilder, GuildMember, LabelBuilder, MessageFlags, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";

import config from "../../../structures/config";
import { voteSchema } from "../../../structures/database/models";

export class ProxyVotesButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["voteProxyButton"]);
	}

	/**
	 * Execute: main handler for the proxy vote button interaction.
	 * Summary: Handles proxy voting by checking for existing proxy votes and showing a modal for entering the pseudonym of the person to vote on behalf of and selecting the vote choice.
	 * Steps:
	 * - Only allow in the site's guild and ensure member is valid
	 * - Check if the vote session exists in the database
	 * - Check if the user has already reached the maximum number of proxy votes allowed (3)
	 * - If not, show a modal for entering the pseudonym of the person to vote on behalf of and selecting the vote choice
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		const { guildId, member } = button;

		// Only allow in the site's guild and ensure member is valid
		if (guildId !== config.gardenGuildId) return;
		if (!member || !(member instanceof GuildMember)) return;

		// Check if the vote session exists in the database
		const voteDocument = await voteSchema.findOne(({ messageId: button.message.id }));
		if (!voteDocument) {
			return button.reply({
				content: "> *Hestia hausse un sourcil, visiblement contrariée.*\n— Je... Je ne retrouve pas la session de vote associée à ce formulaire, désolée.",
				flags: MessageFlags.Ephemeral,
			});
		}

		// Check if the vote session is closed
		if (voteDocument.isClosed) {
			return button.reply({
				content: "> *Hestia vous regarde avec un air désolé.*\n— Je suis navrée, mais cette session de vote est terminée. Vous ne pouvez plus voter.",
				flags: MessageFlags.Ephemeral,
			});
		}

		// Check if the user has already reached the maximum number of proxy votes allowed (3)
		const userProxies = voteDocument.proxyVotes.filter(proxyVote => proxyVote.holderId === member.id);
		if (userProxies.length >= 3) {
			return button.reply({
				content: "> *Hestia vous arrête avant que vous ne lachiez votre bulletin dans l'urne.*\n— Je suis navrée, mais vous avez déjà atteint le nombre maximum de votes par procuration autorisés (3). Vous ne pouvez pas en ajouter davantage.",
				flags: MessageFlags.Ephemeral,
			});
		}

		// Show modal for entering the pseudonym of the person to vote on behalf of and selecting the vote choice
		await button.showModal(
			new ModalBuilder()
				.setCustomId("proxyVoteModal")
				.setTitle("Vote par procuration")
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(`Veuillez entrer le **pseudonyme** de la personne pour laquelle vous souhaitez voter par procuration.\n\n${config.emojis.warn} **Attention** : Vous ne pourrez pas modifier le vote une fois qu'il sera soumis.`),
				)
				.addLabelComponents(
					new LabelBuilder()
						.setLabel("Pseudonyme")
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId("pseudonymInput")
								.setStyle(TextInputStyle.Short)
								.setRequired(true),
						),
					new LabelBuilder()
						.setLabel("Vote")
						.setCheckboxGroupComponent(
							new CheckboxGroupBuilder()
								.setCustomId("voteChoiceCheckboxGroup")
								.setOptions(
									new CheckboxGroupOptionBuilder()
										.setValue("yes")
										.setLabel("Pour")
										.setDefault(false),
									new CheckboxGroupOptionBuilder()
										.setValue("no")
										.setLabel("Contre")
										.setDefault(false),
									new CheckboxGroupOptionBuilder()
										.setValue("abstain")
										.setLabel("Abstention")
										.setDefault(false),
								)
								.setMinValues(1)
								.setMaxValues(1)
								.setRequired(true),
						),
				),
		);
	}
};
