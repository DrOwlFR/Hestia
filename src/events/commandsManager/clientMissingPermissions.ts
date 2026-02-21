import type { ChatInputCommandInteraction, Permissions } from "discord.js";
import { MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../structures/config";

export class ClientMissingPermissionsEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "clientMissingPermissions", {
			description: "Permission(s) manquante(s) pour l'utilisateur.",
			once: false,
			emitter: client.managers.commands,
		});
	}

	/**
	 * Execute: handler for the `clientMissingPermissions` event.
	 * Summary: Triggered when the bot lacks required permissions to execute a command.
	 * Behavior:
	 * - Receives the interaction and the list of missing permissions
	 * - Replies with an ephemeral message informing the user of the missing permissions
	 * @param interaction - The command interaction.
	 * @param missing - The permissions the bot is missing.
	 */
	async execute(interaction: ChatInputCommandInteraction, missing: Permissions) {

		// Reply with an ephemeral message explaining that the bot lacks the necessary permissions
		return interaction.reply({
			content: stripIndent(`
				> *Hestia réfléchit un instant à votre demande.*
				— Hm, non. Je n'ai pas le droit de faire cela, désolée.\n
				-# ${config.emojis.cross} Le bot n'a pas les permissions suffisantes pour effectuer la commande \`${interaction}\`. Permission${missing.length > 1 ? "s" : ""} manquant${missing.length > 1 ? "es" : "e"} : *\`${missing}\`*.
				`),
			flags: MessageFlags.Ephemeral,
		});

	}
};
