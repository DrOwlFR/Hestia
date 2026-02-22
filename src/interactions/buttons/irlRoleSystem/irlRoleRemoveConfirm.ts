import { type ButtonInteraction, GuildMember } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../../structures/config";

export class IRLRoleRemoveConfirmButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["irlRoleRemoveConfirmButton"]);
	}

	/**
	 * Execute: main handler for the IRL role removal confirm button interaction.
	 * Summary: Confirms and processes the removal of the IRL role from the user by removing the role and updating the message.
	 * Steps:
	 * - Verify the member is valid
	 * - Remove the IRL role from the member
	 * - Update the interaction with a confirmation message and clear components
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		const { member } = button;

		if (!member || !(member instanceof GuildMember)) return;

		await member.roles.remove(config.irlRoleId);

		return await button.update({
			content: stripIndent(`
				> *Hestia hoche la tête et tamponne le formulaire à l'encre rouge.*
				— À votre guise ! La retraite vous ennuyait ? Je vous comprends, je pense que je travaillerai à ce bureau toute ma vie, j'aime trop mon travail !
					Cela dit, si vous changez d'avis, n'hésitez pas à repasser me voir !\n
				-# ${config.emojis.check} Le rôle d'accès aux IRLs vous a été retiré.
				`),
			components: [],
		});

	}
};
