import type { ChatInputCommandInteraction } from "discord.js";
import { MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";
import stripIndent from "strip-indent";

export class CooldownLimitEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "cooldownLimit", {
			description: "Cooldown",
			once: false,
			emitter: client.managers.commands,
		});
	}

	/**
	 * Execute: handler for the `cooldownLimit` event.
	 * Summary: Triggered when a user attempts to use a command while on cooldown.
	 * Behavior:
	 * - Receives the interaction and the remaining cooldown time in milliseconds
	 * - Calculates the remaining time in seconds and replies with an ephemeral message
	 * @param interaction - The command interaction on cooldown.
	 * @param time - The remaining cooldown time in milliseconds.
	 */
	async execute(interaction: ChatInputCommandInteraction, time: number) {

		// Calculate the remaining cooldown time in seconds
		const remaining = Math.round(time / 1000);

		// Reply with an ephemeral message informing the user of the cooldown
		return interaction.reply({
			content: stripIndent(`
				— Oulah doucement, pas si vite ! Je n'ai rien compris. Reprenez calmement.\n
				-# <:warn:1426241617613815949> Vous devez attendre quelques secondes entre chaque commande. Il vous reste **\`${remaining} seconde${remaining > 1 ? "s" : ""}\`** de cooldown sur la commande \`${interaction}\`.
				`),
			flags: MessageFlags.Ephemeral,
		});

	}
};
