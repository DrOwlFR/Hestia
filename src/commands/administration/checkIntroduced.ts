import type { ChatInputCommandInteraction } from "discord.js";
import { ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../structures/config";
import { User } from "../../structures/database/models";

export class CheckIntroducedCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "checkintroduced",
			description: "Liste les membres qui ne sont pas présentés.",
			category: "Administration",
			usage: "checkintroduced",
			examples: ["checkintroduced"],
		});
	}

	/**
	 * Execute: main handler for the `checkintroduced` command.
	 * Summary: List members who are not introduced.
	 * Steps:
	 * - Check if the user has the required permissions (guild administrators/moderators and bot admins)
	 * - Reply with a loading message
	 * - Fetch users from the database who are not introduced
	 * - Edit the reply to display the list of not introduced members and a button to mention them
	 * - If there are no not introduced members, edit the reply to indicate that all members seem to be in order
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		const { user } = interaction;

		// Permission check for guild administrators and bot admins
		const isAdmin = this.client.admins.includes(user.id) ||
		config.adminsDiscordIds.includes(user.id) ||
		config.siteModsIds.includes(user.id) ||
		config.discordModsIds.includes(user.id);
		if (!isAdmin) {
			return interaction.reply({
				content: stripIndent(`
					> *Alors que vous essayez désespérément de faire fonctionner ce mécanisme, vous entendez des talons approcher en claquant sur le sol. Puis… La voix de la Concierge.*
					— Hep, hep, hep ! Que croyez-vous faire là ? Vous n'avez pas le droit ! Déguerpissez !\n
					-# ${config.emojis.cross} Vous n'avez pas les permissions suffisantes pour la commande \`${interaction}\`. Cette dernière est réservée à mon Développeur, aux Majuscules et aux Cadratins.
				`),
				flags: MessageFlags.Ephemeral,
			});
		}

		// Reply with a loading message while checking for not introduced members
		await interaction.reply({ content: `${config.emojis.loading} Recherche des membres non présentés...`, flags: MessageFlags.Ephemeral });

		// Fetch members who are not introduced
		const members = await User.find({ introduced: false }).select("discordId").lean();

		// If there are not introduced members, list them and provide a button to mention them
		if (members.length !== 0) {
			const notIntroducedMembers = members.map(member => `- <@${member.discordId}>`).join("\n") || "Aucun membre non présenté trouvé.";
			await interaction.editReply({
				content: "",
				components: [
					new ContainerBuilder()
						.setAccentColor(0x26c4ec)
						.addTextDisplayComponents(
							new TextDisplayBuilder()
								.setContent("## Liste des membres qui ne sont pas présentés :"),
						)
						.addSeparatorComponents(
							new SeparatorBuilder()
								.setDivider(true)
								.setSpacing(SeparatorSpacingSize.Small),
						)
						.addSectionComponents(
							new SectionBuilder()
								.addTextDisplayComponents(
									new TextDisplayBuilder()
										.setContent(`${notIntroducedMembers}`),
								)
								.setButtonAccessory(
									new ButtonBuilder()
										.setCustomId("notIntroducedMentionButton")
										.setStyle(ButtonStyle.Primary)
										.setLabel("Mentionner ces membres")
										.setEmoji({ name: "🛎️" }),
								),
						)
						.addSeparatorComponents(
							new SeparatorBuilder()
								.setDivider(true)
								.setSpacing(SeparatorSpacingSize.Large),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder()
								.setContent(`
-# ❗Remarque : **cette liste n'est pas forcément exhaustive**.
-# - Il est possible que certains membres soient présents dans cette liste alors qu'ils se sont présentés (pour ceux arrivés avant la mise en place de ce système).
-# - De même, il est possible que certains membres ne soient pas présents dans cette liste alors qu'ils ne se sont pas présentés (c'est le cas s'ils ont envoyé un message dans le salon <#${config.portraitGaleryChannelId}>, même si ledit message n'est pas une présentation).
							`),
						),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		}
		// If there are no not introduced members, edit the reply to indicate that
		else {
			await interaction.editReply({
				content: stripIndent(`
					> *Hestia fouille dans son registre, l'air concentrée, avant de lever les yeux vers vous avec un sourire satisfait.*
					— Eh bien, il semblerait que tout le monde se soit présenté !\n
					-# ❗Remarque : **cette liste n'est pas forcément exhaustive**.
					-# - Il est possible que certains membres soient présents dans cette liste alors qu'ils se sont présentés (pour ceux arrivés avant la mise en place de ce système).
					-# - De même, il est possible que certains membres ne soient pas présents dans cette liste alors qu'ils ne se sont pas présentés (c'est le cas s'ils ont envoyé un message dans le salon <#${config.portraitGaleryChannelId}>, même si ledit message n'est pas une présentation).`),
			});
		}

	}
}
