import type { ButtonInteraction, GuildMemberRoleManager } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../../structures/config";

export class IRLRoleRemoveConfirmButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["irlRoleRemoveConfirmButton"]);
	}

	async execute(button: ButtonInteraction) {

		const { member } = button;

		await (member?.roles as GuildMemberRoleManager).remove(config.irlRoleId);

		return await button.update({
			content: stripIndent(`
				> *Hestia hoche la tête et tamponne le formulaire à l'encre rouge.*
				À votre guise ! La retraite vous ennuyait ? Je vous comprends, je pense que je travaillerai à ce bureau toute ma vie, j'aime trop mon travail !
				Cela dit, si vous changez d'avis, n'hésitez pas à repasser me voir !\n
				-# <:round_check:1424065559355592884> Le rôle d'accès aux IRLs vous a été retiré.
				`),
			components: [],
		});

	}
};
