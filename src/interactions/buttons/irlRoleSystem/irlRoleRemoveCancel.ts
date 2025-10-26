import type { ButtonInteraction } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";

export class IRLRoleRemoveCancelButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["irlRoleRemoveCancelButton"]);
	}

	async execute(button: ButtonInteraction) {

		await button.update({
			content: "> *Hestia vous sourit et range le formulaire.*\nTrès bien ! Profitez de votre retraite, vous avez bien raison.",
			components: [],
		});

	}
};
