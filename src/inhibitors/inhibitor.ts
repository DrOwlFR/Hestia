import type { AutocompleteInteraction, Interaction } from "discord.js";
import type { BaseStructure, ShewenyClient } from "sheweny";
import { Inhibitor } from "sheweny";

// ! UNUSED FILE, FRAMEWORK TEMPLATE ONLY

export class BlackListInhibitor extends Inhibitor {
	constructor(client: ShewenyClient) {
		super(client, "blacklist", {
			type: ["ALL"],
		});
	}

	/**
	 * Execute: main handler for the blacklist inhibitor.
	 * Summary: Checks if the interaction's guild is blacklisted and inhibits execution if so.
	 * Steps:
	 * - Return true if guildId is not in the blacklist array
	 * @param structure - The structure (command, button, etc.) being executed.
	 * @param interaction - The interaction being checked.
	 */
	execute(structure: BaseStructure, interaction: Exclude<Interaction, AutocompleteInteraction>) {
		// Put a guild id
		return !["<guildId>"].includes(interaction.guildId!);
	}

	/**
	 * onFailure: handler for when the inhibitor fails (guild blacklisted).
	 * Summary: Replies with a blacklist message when the inhibitor prevents execution.
	 * @param structure - The structure that was inhibited.
	 * @param interaction - The interaction that triggered the failure.
	 */
	async onFailure(structure: BaseStructure, interaction: Exclude<Interaction, AutocompleteInteraction>) {
		await interaction.reply("Your guild is blacklisted.");
	}
};
