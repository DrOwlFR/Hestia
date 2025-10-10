import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { Event } from "sheweny";
import type { ShewenyClient } from "sheweny";

export class CooldownLimitEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "cooldownLimit", {
			description: "Cooldown",
			once: false,
			emitter: client.managers.commands,
		});
	}

	async execute(interaction: ChatInputCommandInteraction, time: number) {

		const remaining = Math.round(time / 1000);
		return interaction.reply({
			content: `<:warn:1426241617613815949> Du calme. Il te reste **\`${remaining} seconde${remaining > 1 ? "s" : ""}\`** de cooldown sur la commande \`${interaction}\`.`,
			flags: MessageFlags.Ephemeral,
		});

	}
};
