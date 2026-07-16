import { type ButtonInteraction, GuildMember } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../../structures/config";

export class PronounsRemoveConfirmButtons extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["pronounsHeHimRemoveConfirmButton", "pronounsSheHerRemoveConfirmButton", "pronounsTheyThemRemoveConfirmButton"]);
	}

	/**
	 * Execute: main handler for the pronouns remove confirm button interaction.
	 * Summary: Confirms and processes the removal of the pronouns role from the user by removing the role and updating the message.
	 * Steps:
	 * - Check if the interaction is in the correct guild and if the member is valid
	 * - Determine which pronouns role corresponds to the button clicked
	 * - Remove the pronouns role from the member and confirm the removal
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		const { customId, guild, guildId, member } = button;

		// Only allow in the site's guild and ensure member is valid
		if (guildId !== config.gardenGuildId) return;
		if (!member || !(member instanceof GuildMember)) return;

		// Define the pronouns and their corresponding role IDs and button IDs
		const pronouns = [
			{ buttonId: "pronounsHeHimRemoveConfirmButton", roleId: config.pronounsHeHimRoleId },
			{ buttonId: "pronounsSheHerRemoveConfirmButton", roleId: config.pronounsSheHerRoleId },
			{ buttonId: "pronounsTheyThemRemoveConfirmButton", roleId: config.pronounsTheyThemRoleId },
		];

		// Find the pronoun entry corresponding to the button that was clicked
		const entry = pronouns.find(p => p.buttonId === customId);
		if (!entry) return;

		// Remove the pronouns role from the member and confirm the removal
		await member.roles.remove(entry.roleId);

		return await button.update({
			content: stripIndent(`
				> *Hestia hoche la tête et tamponne le formulaire à l'encre rouge.*
				— À votre guise ! Si vous changez d'avis, n'hésitez pas à repasser me voir !\n
				-# ${config.emojis.check} Le rôle ${guild?.roles.cache.get(entry.roleId)} vous a été retiré.
				`),
			components: [],
		});

	};
};
