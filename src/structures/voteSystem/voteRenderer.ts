import { ActionRowBuilder, SeparatorBuilder } from "@discordjs/builders";
import { ButtonBuilder, ButtonStyle, ContainerBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";

import type { voteDocument } from "../database/models";

export function buildVoteContainer(voteDocument: voteDocument): ContainerBuilder {
	const formatList = (choice: "yes" | "no" | "abstain") => {
		const directVotes = voteDocument.votes
			.filter(vote => vote.choice === choice)
			.map(vote => `<@${vote.userId}>`);

		const proxyVotes = voteDocument.proxyVotes
			.filter(proxy => proxy.choice === choice)
			.map(proxy => `${proxy.targetPseudo} (proc. <@${proxy.holderId}>)`);

		const allVotes = [...directVotes, ...proxyVotes];
		if (allVotes.length === 0) return "  - *(aucun vote)*";
		return allVotes.map(name => `  - ${name}`).join("\n");
	};

	const countFor = (choice: "yes" | "no" | "abstain") => {
		return voteDocument.votes.filter(v => v.choice === choice).length + voteDocument.proxyVotes.filter(p => p.choice === choice).length;
	};

	const yesCount = countFor("yes");
	const noCount = countFor("no");
	const abstainCount = countFor("abstain");
	const proxyCount = voteDocument.proxyVotes.length;

	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder()
				.setContent(`# ${voteDocument.question}\n${voteDocument.isClosed ? "🔒 Le vote est **clos**." : "Place aux votes ! Veuillez voter en utilisant les boutons ci-dessous."}`),
		)
		.addActionRowComponents(
			new ActionRowBuilder<ButtonBuilder>()
				.addComponents(
					new ButtonBuilder()
						.setCustomId("voteYesButton")
						.setStyle(ButtonStyle.Secondary)
						.setLabel("Pour")
						.setEmoji("🤚🏻")
						.setDisabled(voteDocument.isClosed),
					new ButtonBuilder()
						.setCustomId("voteNoButton")
						.setStyle(ButtonStyle.Secondary)
						.setLabel("Contre")
						.setEmoji("👎")
						.setDisabled(voteDocument.isClosed),
					new ButtonBuilder()
						.setCustomId("voteAbstainButton")
						.setStyle(ButtonStyle.Secondary)
						.setLabel("Abstention")
						.setEmoji("😶")
						.setDisabled(voteDocument.isClosed),
					new ButtonBuilder()
						.setCustomId("voteProxyButton")
						.setStyle(ButtonStyle.Secondary)
						.setLabel("Procuration")
						.setEmoji("🤚")
						.setDisabled(voteDocument.isClosed),
				),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setDivider(true)
				.setSpacing(SeparatorSpacingSize.Large),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder()
				.setContent("Section réservée à l'Administration de séance :"),
		)
		.addActionRowComponents(
			new ActionRowBuilder<ButtonBuilder>()
				.addComponents(
					new ButtonBuilder()
						.setCustomId("voteCloseButton")
						.setStyle(ButtonStyle.Danger)
						.setLabel("Fermer le vote")
						.setEmoji("🛑")
						.setDisabled(voteDocument.isClosed),
					new ButtonBuilder()
						.setCustomId("voteReopenButton")
						.setStyle(ButtonStyle.Success)
						.setLabel("Rouvrir le vote")
						.setEmoji("✅")
						.setDisabled(!voteDocument.isClosed),
				),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setDivider(true)
				.setSpacing(SeparatorSpacingSize.Large),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder()
				.setContent([
					"## Résultats",
					`- **Total des votes** : ${yesCount + noCount + abstainCount} (dont ${proxyCount} par procuration)`,
					"### Détail :",
					`- **Pour** : ${yesCount} vote${yesCount >= 2 ? "s" : ""}`,
					formatList("yes"),
					`- **Contre** : ${noCount} vote${noCount >= 2 ? "s" : ""}`,
					formatList("no"),
					`- **Abstention** : ${abstainCount} vote${abstainCount >= 2 ? "s" : ""}`,
					formatList("abstain"),
					`- **Procuration** : ${proxyCount} vote${proxyCount >= 2 ? "s" : ""}`,
				].join("\n")),
		);
}
