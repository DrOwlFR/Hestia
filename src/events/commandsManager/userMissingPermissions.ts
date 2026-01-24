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

	/**
	 * Execute: handler for the `userMissingPermissions` event.
	 * Summary: Triggered when the user lacks required permissions to execute a command.
	 * Behavior:
	 * - Receives the interaction and the list of missing permissions
	 * - Replies with an ephemeral message informing the user of the missing permissions
	 * @param interaction - The command interaction.
	 * @param missing - The permissions the user is missing.
	 */
	async execute(interaction: ChatInputCommandInteraction, missing: Permissions) {

		// Reply with an ephemeral message explaining that the user lacks the necessary permissions
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
