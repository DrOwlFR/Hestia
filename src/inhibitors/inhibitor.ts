import type { AutocompleteInteraction, Interaction } from "discord.js";
import type { BaseStructure, ShewenyClient } from "sheweny";
import { Inhibitor } from "sheweny";

export class BlackListInhibitor extends Inhibitor {
	constructor(client: ShewenyClient) {
		super(client, "blacklist", {
			type: ["ALL"],
		});
	}

	execute(structure: BaseStructure, interaction: Exclude<Interaction, AutocompleteInteraction>) {
		// Put a guild id
		return !["<guildId>"].includes(interaction.guildId!);
	}

	async onFailure(structure: BaseStructure, interaction: Exclude<Interaction, AutocompleteInteraction>) {
		await interaction.reply("Your guild is blacklisted.");
	}
};
