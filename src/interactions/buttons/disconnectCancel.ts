import { Button } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { ButtonInteraction, MessageFlags } from "discord.js";

export class DisconnectCancelButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["disconnectCancelButton"]);
	}

	async execute(button: ButtonInteraction) {

		await button.reply({
			content: "> *Hestia vous adresse un sourire radieux.*\nTrès bon choix ! Vous m'en voyez ravie !",
			flags: MessageFlags.Ephemeral,
		});

	}
};
