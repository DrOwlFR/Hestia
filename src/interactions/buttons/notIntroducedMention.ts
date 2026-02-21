import type { ButtonInteraction } from "discord.js";
import { MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../structures/config";
import { User } from "../../structures/database/models";

export class NotIntroducedMentionButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["notIntroducedMentionButton"]);
	}

	/**
	 * Execute: main handler for the not introduced mention button interaction.
	 * Summary: Handles mentioning not introduced members.
	 * Steps:
	 * - Check if the user has the required permissions (guild administrators/moderators and bot admins)
	 * - Re-fetch users from the database who are not introduced
	 * - If there are not introduced members, mention them in the presentation channel
	 * - If there are no not introduced members, reply to the user indicating that all members seem to be in order
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		const { user } = button;

		// Permission check for guild administrators and bot admins
		const isAdmin = this.client.admins.includes(user.id) ||
				config.adminsDiscordIds.includes(user.id) ||
				config.siteModsIds.includes(user.id) ||
				config.discordModsIds.includes(user.id);
		if (!isAdmin) {
			return button.reply({
				content: `${config.emojis.cross} Vous n'avez pas les permissions requises pour utiliser ce bouton. Ce dernier est réservé à mon Développeur, aux Majuscules et aux Cadratins.`,
				flags: MessageFlags.Ephemeral,
			});
		}

		// Re-fetch users who are not introduced
		const members = await User.find({ introduced: false }).select("discordId").lean();

		// If there are not introduced members, mention them in the presentation channel
		if (members.length !== 0) {
			const notIntroducedMembers = members.map(member => `<@${member.discordId}>`).join(", ");

			// Get the presentation channel to mention the not introduced members
			const presentationChannel = button.guild?.channels.cache.get(config.portraitGaleryChannelId);
			if (!presentationChannel || !presentationChannel.isTextBased()) {
				return button.reply({
					content: `${config.emojis.cross} Impossible de trouver le salon de présentation. Veuillez contacter le développeur en lui montrant/expliquant précisément l'erreur.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			// Mention the not introduced members in the presentation channel
			presentationChannel?.send({
				content: stripIndent(`
				> *Hestia apparaît soudainement au coin du couloir, un grand registre à la main, qu'elle consulte avec attention. Elle s'éclaircit la voix.*
				— Bonjour mes chères Esperluettes, et mes chères Graines ! En fouillant dans mon registre, je constate que les membres suivants ne se sont pas encore présentés : ${notIntroducedMembers}. Vous êtes priés de le faire au plus vite !\n
				-# ❗ Si vous avez été mentionné par erreur (i.e., que vous vous êtes déjà présenté), veuillez contacter un membre de l'équipe pour que l'on puisse régulariser votre statut.`),
			});

			return button.reply({ content: `${config.emojis.check} Les membres non présentés ont été mentionnés dans le salon <#${config.portraitGaleryChannelId}>.`, flags: MessageFlags.Ephemeral });
		}
		// If there are no not introduced members, reply to the user indicating that all members seem to be in order
		else {
			return button.reply({
				content: stripIndent(`
					> *Hestia fouille dans son registre, l'air concentrée, avant de lever les yeux vers vous avec un sourire satisfait.*
					— Eh bien, il semblerait que tout le monde se soit présenté !\n
					-# ❗Remarque : **cette liste n'est pas forcément exhaustive**.
					-# - Il est possible que certains membres soient présents dans cette liste alors qu'ils se sont présentés (pour ceux arrivés avant la mise en place de ce système).
					-# - De même, il est possible que certains membres ne soient pas présents dans cette liste alors qu'ils ne se sont pas présentés (c'est le cas s'ils ont envoyé un message dans le salon <#${config.portraitGaleryChannelId}>, même si ledit message n'est pas une présentation).`),
				flags: MessageFlags.Ephemeral,
			});
		}
	}
};
