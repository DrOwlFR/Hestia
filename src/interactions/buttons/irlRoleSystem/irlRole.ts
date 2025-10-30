import type { ButtonInteraction, GuildMember, GuildMemberRoleManager, TextChannel } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../../structures/config";
import { type dbUser, User } from "../../../structures/database/models";

export class IRLRoleButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["irlRoleButton"]);
	}

	async execute(button: ButtonInteraction) {

		const { guildId, member, guild } = button;

		if (guildId !== config.gardenGuildId) return;

		if ((member?.roles as GuildMemberRoleManager).cache.some(role => role.id === config.irlRoleId)) {
			return await button.reply({
				content: "— Eh ! Vous avez déjà le rôle d'accès aux retraites ! Souhaitez-vous que je vous fournisse le formulaire de désinscription ?",
				components: [
					new ActionRowBuilder<ButtonBuilder>()
						.addComponents(
							new ButtonBuilder({
								custom_id: "irlRoleRemoveCancelButton",
								label: "Non ! J'ai changé d'avis",
								style: ButtonStyle.Danger,
								emoji: "✖️",
							}),
							new ButtonBuilder({
								custom_id: "irlRoleRemoveConfirmButton",
								label: "Oui, me retirer l'accès",
								style: ButtonStyle.Primary,
								emoji: "⛓️‍💥",
							}),
						),
				],
				flags: MessageFlags.Ephemeral,
			});
		}

		let memberData: dbUser | null = null;
		try {
			memberData = await User.findOneAndUpdate(
				{ discordId: member?.user.id },
				[{
					$set: {
						discordUsername: { $ifNull: ["$discordUsername", member?.user.username] },
						totalMessages: { $ifNull: ["$totalMessages", 0] },
						messagesPerDay: { $ifNull: ["$messagesPerDay", []] },
						joinedAt: { $ifNull: ["$joinedAt", (member as GuildMember).joinedAt] },
						__v: { $add: { $ifNull: ["$__v", 0] } },
						createdAt: { $ifNull: ["$createdAt", "$$NOW"] },
					},
				}],
				{ upsert: true, new: true },
			);
		}
		catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
			(this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@158205521151787009> Le document **User** de l'id discord \`${(member as GuildMember).id}\` n'a pas été créé correctement lorsqu'il a cliqué sur **le bouton du rôle IRL**. À vérifier.`);
		}

		if (memberData && ((Date.now() - memberData?.joinedAt.getTime()) / (1000 * 60 * 60 * 24)) >= 61 && (memberData.totalMessages >= 300)) {
			(member?.roles as GuildMemberRoleManager).add(config.irlRoleId).catch(err => {
				// eslint-disable-next-line no-console
				console.error(err);
				return button.reply({
					content: stripIndent(`
						> *Hestia fronce les sourcils, visiblement contrariée.*
						— Hm, où est-ce que... Je ne trouve plus les clefs de la salle des retraités...\n
						-# <:round_cross:1424312051794186260> Le rôle ${guild?.roles.cache.get(config.irlRoleId)} n'a pas pu vous être attribué. Veuillez contacter un cadratin du Discord (${config.cadratinDiscordIds.map(c => guild?.members.cache.get(c)).join(", ")}) pour le recevoir, ainsi que mon développeur (${this.client.admins.map(a => guild?.members.cache.get(a)).join(", ")}) pour en avoir le cœur net.
						`),
					flags: MessageFlags.Ephemeral,
				});
			});
			return button.reply({
				content: stripIndent(`
					> *Hestia sourit. Elle appose un tampon en forme d'Esperluette en bas du formulaire avant de le ranger.*
					Bienvenue ! Profitez-bien de votre retraite !\n
					-# <:round_check:1424065559355592884> Le rôle ${guild?.roles.cache.get(config.irlRoleId)} vous a été attribué. Vous avez à présent accès au salon ${guild?.channels.cache.get(config.irlChannelId)}. Bienvenue !
					-# **Rappel** : Le Jardin en tant qu'association n'est pas responsable des IRLs organisées par ses membres.
					`),
				flags: MessageFlags.Ephemeral,
			});
		} else {
			return button.reply({
				content: stripIndent(`
					> *Hestia haussa un sourcil en lisant le formulaire.*
					Hm, il semble que vous ne remplissiez pas les critères pour accéder à cette aile du manoir. Repassez plus tard.\n
					-# ❗ **Rappel des critères** : 2 mois d'ancienneté et 300 messages envoyés.
					`),
				flags: MessageFlags.Ephemeral,
			});
		}
	}
};
