import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChannelType, type ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../structures/config";
import { voteSchema } from "../../structures/database/models";

export class VoteCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "vote",
			description: "Lance un vote",
			category: "Administration",
			usage: "vote [question]",
			examples: ["vote Voulez-vous que je vous fasse un câlin ?"],
			options: [
				{
					name: "question",
					description: "La question soumise au vote",
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		});
	}

	/**
	 * Execute: main handler for the `ping` command.
	 * Summary: Measure and display the bot's response latency, Discord API latency, and database latency.
	 * Steps:
	 * - Send an initial reply indicating calculation in progress
	 * - Calculate bot latency by fetching the reply timestamp
	 * - Retrieve API latency from the WebSocket ping
	 * - Ping the database to measure DB latency
	 * - Build an embed with the latency values and edit the reply
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		const { channel, options, user } = interaction;

		// Permission check for guild administrators and bot admins
		const isAdmin = this.client.admins.includes(user.id) ||
		config.adminsDiscordIds.includes(user.id);
		if (!isAdmin) {
			return interaction.reply({
				content: stripIndent(`
					> *Alors que vous essayez désespérément de faire fonctionner ce mécanisme, vous entendez des talons approcher en claquant sur le sol. Puis… La voix de la Concierge.*
					— Hep, hep, hep ! Que croyez-vous faire là ? Vous n'avez pas le droit ! Déguerpissez !\n
					-# ${config.emojis.cross} Vous n'avez pas les permissions suffisantes pour la commande \`${interaction}\`. Cette dernière est réservée à mon Développeur et aux Majuscules.
				`),
				flags: MessageFlags.Ephemeral,
			});
		}

		// Get the current channel and verify it's a text channel
		if (!channel || channel.type !== ChannelType.GuildText) {
			return interaction.followUp({ content: `${config.emojis.cross} Cette commande doit être utilisée dans un salon textuel.`, flags: MessageFlags.Ephemeral });
		}

		// Extract the question option provided by the user
		const question = options.getString("question", true);

		const embed = new ContainerBuilder()
			// .setAccentColor(colors.colorTertiary)
			.addTextDisplayComponents(
				new TextDisplayBuilder()
					.setContent(`# ${question}\nPlace aux votes ! Veuillez voter en utilisant les boutons ci-dessous.`),
			)
			.addActionRowComponents(
				new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder()
							.setCustomId("voteYesButton")
							.setStyle(ButtonStyle.Secondary)
							.setLabel("Pour")
							.setEmoji("🤚🏻"),
						new ButtonBuilder()
							.setCustomId("voteNoButton")
							.setStyle(ButtonStyle.Secondary)
							.setLabel("Contre")
							.setEmoji("👎"),
						new ButtonBuilder()
							.setCustomId("voteAbstainButton")
							.setStyle(ButtonStyle.Secondary)
							.setLabel("Abstention")
							.setEmoji("😶"),
						new ButtonBuilder()
							.setCustomId("voteProxyButton")
							.setStyle(ButtonStyle.Secondary)
							.setLabel("Procuration")
							.setEmoji("🤚"),
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
							.setEmoji("🛑"),
						new ButtonBuilder()
							.setCustomId("voteReopenButton")
							.setStyle(ButtonStyle.Success)
							.setLabel("Rouvrir le vote")
							.setEmoji("✅")
							.setDisabled(true),
					),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setDivider(true)
					.setSpacing(SeparatorSpacingSize.Large),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder()
					.setContent(stripIndent(`
						## Résultats
						- **Pour** : 0 vote
						  - *(aucun vote)*
						- **Contre** : 0 vote
						  - *(aucun vote)*
						- **Abstention** : 0 vote
						  - *(aucun vote)*
						- **Procuration** : 0
						`)),
			);

		// Sending the rules messages one by one
		const voteMessage = await interaction.reply({
			components: [
				embed,
			],
			flags: MessageFlags.IsComponentsV2,
			withResponse: true,
		});

		await voteSchema.create({
			messageId: voteMessage.resource?.message?.id,
			channelId: channel.id,
			question,
			isClosed: false,
			votes: [],
			proxyVotes: [],
		});

	}
}
