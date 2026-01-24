import type { ButtonInteraction } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";

export class IRLRoleRemoveCancelButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["irlRoleRemoveCancelButton"]);
	}

	/**
	 * Execute: main handler for the IRL role removal cancel button interaction.
	 * Summary: Cancels the IRL role removal process by updating the message to confirm the user changed their mind.
	 * Steps:
	 * - Update the interaction with a cancellation message and clear components
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		await button.update({
			content: "> *Hestia vous sourit et range le formulaire.*\n— Très bien ! Profitez de votre retraite, vous avez bien raison.",
			components: [],
		});

	}
};
