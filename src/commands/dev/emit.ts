import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType, GuildMember, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

import config from "../../structures/config";

export class EmitCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "emit",
			description: "Émet un évènement au choix.",
			category: "Dev",
			adminsOnly: true,
			usage: "emit [événement]",
			examples: ["emit guildMemberAdd"],
			clientPermissions: ["Administrator"],
			options: [{
				name: "événement",
				description: "Choisir un événement à émettre.",
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: [
					{
						name: "guildMemberAdd",
						value: "guildMemberAdd",
					},
					{
						name: "guildMemberRemove",
						value: "guildMemberRemove",
					},
				],
			}],
		});
	}

	/**
	 * Execute: main handler for the `emit` command.
	 * Summary: Reads the user's chosen event option and emits the corresponding client event.
	 * Steps:
	 * - Extract options and member from the interaction
	 * - Determine which event to emit
	 * - Emit the event and reply with an ephemeral confirmation
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		// Extract options and invoking member from the interaction
		const { options, member } = interaction;

		// Ensure the member is a GuildMember instance
		if (!member || !(member instanceof GuildMember)) {
			return interaction.reply({ content: `${config.emojis.cross} Impossible de récupérer les informations du membre.`, flags: MessageFlags.Ephemeral });
		}

		// Read the event choice provided by the user (command option)
		const choice = options.getString("événement");

		// Dispatch the requested event and send an ephemeral confirmation to the user
		switch (choice) {
			// Emit a simulated guild member join event using the current member
			case "guildMemberAdd":
				this.client.emit("guildMemberAdd", member);
				interaction.reply({ content: `${config.emojis.check} L'événement \`guildMemberAdd\` a été émis avec succès.`, flags: MessageFlags.Ephemeral });
				break;

			// Emit a simulated guild member leave event using the current member
			case "guildMemberRemove":
				this.client.emit("guildMemberRemove", member);
				interaction.reply({ content: `${config.emojis.check} L'événement \`guildMemberRemove\` a été émis avec succès.`, flags: MessageFlags.Ephemeral });
				break;
		}

	}
}
