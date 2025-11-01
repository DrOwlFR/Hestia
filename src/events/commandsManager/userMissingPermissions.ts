import type { ChatInputCommandInteraction, Permissions } from "discord.js";
import { MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";
import stripIndent from "strip-indent";

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
			content: stripIndent(`
				> *Alors que vous essayez désespérément de faire fonctionner ce mécanisme, vous entendez des talons approcher en claquant sur le sol. Puis… La voix de la Concierge.*
				Hep, hep, hep ! Que croyez-vous faire là ? Vous n'avez pas le droit ! Déguerpissez !\n
				<:round_cross:1424312051794186260> Vous n'avez pas la permission suffisante pour la commande \`${interaction}\`. Permission${missing.length > 1 ? "s" : ""} manquant${missing.length > 1 ? "es" : "e"} : *\`${missing}\`*.
				`),
			flags: MessageFlags.Ephemeral,
		});

	}
};
