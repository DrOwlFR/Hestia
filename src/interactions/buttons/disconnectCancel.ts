import type { ButtonInteraction } from "discord.js";
import { MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";

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
