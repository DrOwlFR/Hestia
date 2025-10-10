import { MessageFlags, Permissions, type ChatInputCommandInteraction } from "discord.js";
import { Event } from "sheweny";
import type { ShewenyClient } from "sheweny";

export class ClientMissingPermissionsEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "clientMissingPermissions", {
			description: "Permission(s) manquante(s) pour l'utilisateur.",
			once: false,
			emitter: client.managers.commands,
		});
	}

	async execute(interaction: ChatInputCommandInteraction, missing: Permissions) {

		return interaction.reply({
			content: `<:shield_cross:1270727167428395151> Vous n'avez pas la permission suffisante pour la commande \`${interaction}\`. Permission${missing.length > 1 ? "s" : ""} manquant${missing.length > 1 ? "es" : "e"} : *\`${missing}\`*.`,
			flags: MessageFlags.Ephemeral,
		});

	}
};
