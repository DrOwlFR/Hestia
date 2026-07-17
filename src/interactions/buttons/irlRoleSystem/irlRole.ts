import type { ButtonInteraction } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../../structures/config";
import { type dbUser, User } from "../../../structures/database/models";

export class IRLRoleButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["irlRoleButton"]);
	}

	/**
	 * Execute: main handler for the IRL role button interaction.
	 * Summary: Checks if the user already has the IRL role; if not, verifies eligibility criteria (confirmed user status, 61+ days joined, 300+ messages) and assigns the role if met. Uses the User model to fetch or create user data for message count and join date checks.
	 * Steps:
	 * - Check if interaction is in the correct guild
	 * - Check if user already has the IRL role; if yes, offer removal option
	 * - Fetch or create user data in database
	 * - Check if user is confirmed
	 * - Check eligibility criteria (join date and message count)
	 * - Assign role if eligible, or deny access
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		const { guild, guildId, member } = button;

		// Only allow in the site's guild and ensure member is valid
		if (guildId !== config.gardenGuildId) return;
		if (!member || !(member instanceof GuildMember)) return;

		// Check if user already has the IRL role and propose him removal if so
		if (member.roles.cache.some(role => role.id === config.irlRoleId)) {
			return await button.reply({
				content: "— Eh ! Vous avez déjà le rôle d'accès aux retraites ! Souhaitez-vous que je vous fournisse le formulaire de désinscription ?",
				components: [
					new ActionRowBuilder<ButtonBuilder>()
						.addComponents(
							new ButtonBuilder({
								custom_id: "irlRoleRemoveCancelButton",
								label: "Non ! J'ai changé d'avis",
								style: ButtonStyle.Danger,
								emoji: `${config.emojis.crossWhite}`,
							}),
							new ButtonBuilder({
								custom_id: "irlRoleRemoveConfirmButton",
								label: "Oui, me retirer l'accès",
								style: ButtonStyle.Primary,
								emoji: `${config.emojis.brokenChain}`,
							}),
						),
				],
				flags: MessageFlags.Ephemeral,
			});
		}

		// Fetch or create user data in the database
		let memberData: dbUser | null = null;
		try {
			memberData = await User.findOneAndUpdate(
				{ discordId: member?.user.id },
				[{
					$set: {
						discordUsername: { $ifNull: ["$discordUsername", member?.user.username] },
						totalMessages: { $ifNull: ["$totalMessages", 0] },
						messagesPerDay: { $ifNull: ["$messagesPerDay", []] },
						accessoryRoles: { $ifNull: ["$accessoryRoles", []] },
						introduced: { $ifNull: ["$introduced", false] },
						joinedAt: { $ifNull: ["$joinedAt", member.joinedAt] },
						__v: { $add: { $ifNull: ["$__v", 0] } },
						createdAt: { $ifNull: ["$createdAt", "$$NOW"] },
					},
				}],
				{ upsert: true, new: true, updatePipeline: true },
			);
		}
		catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
			await this.client.functions.log("dbError", `<@${config.botAdminsIds[0]}> Le document **User** de l'id discord \`${member.id}\` n'a pas été créé correctement lorsqu'il a cliqué sur **le bouton du rôle IRL**. À vérifier.\n\`\`\`${err}\`\`\``);
			return button.reply({
				content: stripIndent(`
						> *Hestia fronce les sourcils, visiblement contrariée.*
						— Hm, non, ça ne fonctionne pas. Nom d'une Esperluette, pourquoi ça ne fonctionne pas ?\n
						-# ${config.emojis.cross} Il semble qu'un problème soit survenu lors de la vérification. Veuillez réessayez. Si le problème persiste, contactez un·e membre de l'équipe.
						`),
				flags: MessageFlags.Ephemeral,
			});
		}

		// Check if user has confirmed status
		const isConfirmed = member.roles.cache.has(config.confirmedUserRoleId);
		if (!isConfirmed) {
			return button.reply({
				content: stripIndent(`
					> *Hestia haussa un sourcil en lisant le formulaire.*
					Hm, il semble que vous ne remplissiez pas les critères pour accéder à cette aile du manoir. Vous devez être une Esperluette confirmée pour cela. Repassez plus tard.\n
					`),
				flags: MessageFlags.Ephemeral,
			});
		}

		// Check eligibility: 61+ days joined and 300+ messages
		if (memberData && ((Date.now() - memberData?.joinedAt.getTime()) / (1000 * 60 * 60 * 24)) >= 61 && (memberData.totalMessages >= 300)) {
			// Assign the IRL role
			try {
				await member.roles.add(config.irlRoleId);
				return button.reply({
					content: stripIndent(`
						> *Hestia sourit. Elle appose un tampon en forme d'Esperluette en bas du formulaire avant de le ranger.*
						Bienvenue ! Profitez-bien de votre retraite !\n
						-# ${config.emojis.check} Le rôle ${guild?.roles.cache.get(config.irlRoleId)} vous a été attribué. Vous avez à présent accès au salon ${guild?.channels.cache.get(config.irlChannelId)}. Bienvenue !
						-# **Rappel** : Le Jardin en tant qu'association n'est pas responsable des IRLs organisées par ses membres.
						`),
					flags: MessageFlags.Ephemeral,
				});
			} catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
				return button.reply({
					content: stripIndent(`
						> *Hestia fronce les sourcils, visiblement contrariée.*
						— Hm, où est-ce que... Je ne trouve plus les clefs de la salle des retraités...\n
						-# ${config.emojis.cross} Le rôle n'a pas pu vous être attribué. Veuillez contacter un cadratin du Discord (${config.discordModsIds.map(c => guild?.members.cache.get(c)).join(", ")}) pour le recevoir, ainsi que mon développeur (${guild?.members.cache.get(config.botAdminsIds[0])}) pour en avoir le cœur net.
						`),
					flags: MessageFlags.Ephemeral,
				});
			}
		} else {
			// Deny access if criteria not met
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
