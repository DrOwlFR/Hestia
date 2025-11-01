import type { ChatInputCommandInteraction, Permissions } from "discord.js";
import { MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";

export class UserMissingPermissionsEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "userMissingPermissions", {
			description: "Permission(s) manquante(s) pour l'utilisateur.",
			once: false,
			emitter: client.managers.commands,
		});
	}

	async execute(interaction: ChatInputCommandInteraction, missing: Permissions) {

		return interaction.reply({
			content: `<:round_cross:1424312051794186260> Vous n'avez pas la permission suffisante pour la commande \`${interaction}\`. Permission${missing.length > 1 ? "s" : ""} manquant${missing.length > 1 ? "es" : "e"} : *\`${missing}\`*.`,
			flags: MessageFlags.Ephemeral,
		});

	}
};
