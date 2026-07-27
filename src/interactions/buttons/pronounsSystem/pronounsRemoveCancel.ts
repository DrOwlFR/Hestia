import { type ButtonInteraction } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";

export class PronounsRemoveCancelButtons extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["pronounsHeHimRemoveCancelButton", "pronounsSheHerRemoveCancelButton", "pronounsTheyThemRemoveCancelButton"]);
	}

	/**
	 * Execute: main handler for the pronouns remove cancel button interaction.
	 * Summary: Cancels the pronouns role removal process by updating the message to confirm the user changed their mind.
	 * Steps:
	 * - Update the interaction with a cancellation message and clear components
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		await button.update({
			content: "> *Hestia vous sourit et range le formulaire.*\n— Très bien ! Pas de modification alors.",
			components: [],
		});

	};
};
