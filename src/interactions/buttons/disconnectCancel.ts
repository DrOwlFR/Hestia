import type { ButtonInteraction } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";

export class DisconnectCancelButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["disconnectCancelButton"]);
	}

	/**
	 * Execute: main handler for the disconnect cancel button interaction.
	 * Summary: Cancels the disconnect process by updating the message to confirm the user changed their mind.
	 * Steps:
	 * - Update the interaction with a cancellation message and clear components
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		await button.update({
			content: "> *Hestia vous adresse un sourire radieux.*\nTrès bon choix ! Vous m'en voyez ravie !",
			components: [],
		});

	}
};
