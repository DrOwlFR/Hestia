import { ActionRowBuilder, ButtonBuilder, type ButtonInteraction, ButtonStyle, GuildMember, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../../structures/config";

export class PronounsButtons extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["pronounsHeHimButton", "pronounsSheHerButton", "pronounsTheyThemButton"]);
	}

	/**
	 * Execute: main handler for the pronouns add button interaction.
	 * Summary: Adds the corresponding pronouns role to the user when they click the button.
	 * Steps:
	 * - Check if the interaction is in the correct guild and if the member is valid
	 * - Determine which pronouns role corresponds to the button clicked
	 * - If the member already has the role, prompt for confirmation to remove it
	 * - If the member does not have the role, add it and confirm the addition
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		const { customId, guild, guildId, member } = button;

		// Only allow in the site's guild and ensure member is valid
		if (guildId !== config.gardenGuildId) return;
		if (!member || !(member instanceof GuildMember)) return;

		// Define the pronouns and their corresponding role IDs and button IDs
		const pronouns = [
			{ buttonId: "pronounsHeHimButton", roleId: config.pronounsHeHimRoleId, removeCancelId: "pronounsHeHimRemoveCancelButton", removeConfirmId: "pronounsHeHimRemoveConfirmButton" },
			{ buttonId: "pronounsSheHerButton", roleId: config.pronounsSheHerRoleId, removeCancelId: "pronounsSheHerRemoveCancelButton", removeConfirmId: "pronounsSheHerRemoveConfirmButton" },
			{ buttonId: "pronounsTheyThemButton", roleId: config.pronounsTheyThemRoleId, removeCancelId: "pronounsTheyThemRemoveCancelButton", removeConfirmId: "pronounsTheyThemRemoveConfirmButton" },
		];

		// Find the pronoun entry corresponding to the button that was clicked
		const entry = pronouns.find(p => p.buttonId === customId);
		if (!entry) return;

		// Check if the member already has the role; if so, prompt for confirmation to remove it
		if (member.roles.cache.has(entry.roleId)) {
			return await button.reply({
				content: `— Dans mon formulaire vous avez déjà demandé à ce que l'on utilise le pronom ${guild?.roles.cache.get(entry.roleId)} à votre sujet. Souhaitez-vous que je le retire ?`,
				components: [
					new ActionRowBuilder<ButtonBuilder>()
						.addComponents(
							new ButtonBuilder()
								.setCustomId(entry.removeCancelId)
								.setLabel("Non ! J'ai changé d'avis")
								.setStyle(ButtonStyle.Danger)
								.setEmoji("✖️"),
							new ButtonBuilder()
								.setCustomId(entry.removeConfirmId)
								.setLabel("Oui, me retirer ce pronom")
								.setStyle(ButtonStyle.Primary)
								.setEmoji("⛓️‍💥"),
						),
				],
				flags: MessageFlags.Ephemeral,
			});
		}

		// If the member does not have the role, add it and confirm the addition
		try {
			await member.roles.add(entry.roleId);
			return button.reply({
				content: `— Très bien ! Vous avez choisi le pronom ${guild?.roles.cache.get(entry.roleId)} pour vous désigner. Je l'ai ajouté à votre fiche !`,
				flags: MessageFlags.Ephemeral,
			});
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
			return button.reply({
				content: stripIndent(`
					> *Hestia fronce les sourcils, visiblement contrariée.*
					— Hm, où est-ce que... Je ne trouve plus mon stylo-plume...\\n
					-# ${config.emojis.cross} Le rôle n'a pas pu vous être attribué. Veuillez contacter un cadratin du Discord (${config.discordModsIds.map(c => guild?.members.cache.get(c)).join(", ")}) pour le recevoir, ainsi que mon développeur (${guild?.members.cache.get(config.botAdminsIds[0])}) pour en avoir le cœur net.
					`),
				flags: MessageFlags.Ephemeral,
			});
		}

	};
};
