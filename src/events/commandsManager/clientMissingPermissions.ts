import type { ChatInputCommandInteraction, Permissions } from "discord.js";
import { MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";
import stripIndent from "strip-indent";

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
			content: stripIndent(`
				> *Hestia réfléchit un instant à votre demande.*
				Hm, non. Je n'ai pas le droit de faire cela, désolée.\n
				-# <:round_cross:1424312051794186260> Le bot n'a pas les permissions suffisantes pour effectuer la commande \`${interaction}\`. Permission${missing.length > 1 ? "s" : ""} manquant${missing.length > 1 ? "es" : "e"} : *\`${missing}\`*.
				`),
			flags: MessageFlags.Ephemeral,
		});

	}
};
