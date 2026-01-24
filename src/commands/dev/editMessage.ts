import { type ChatInputCommandInteraction, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

export class EditMessageCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "editmessage",
			description: "Permet d'éditer un message.",
			category: "Dev",
			adminsOnly: true,
			usage: "editmessage",
			examples: ["editmessage"],
		});
	}

	/**
	 * Execute: main handler invoked when the command is used.
	 * Steps:
	 * - Fetch the target message by ID in the current channel
	 * - Edit the message content
	 * - Reply to the command issuer with success or error (ephemeral)
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		// Identifier of the message to edit (replace)
		const messageToEditId = "";

		// Fetch the message from the channel; if fetching fails, reply with an ephemeral error
		const message = await interaction.channel?.messages.fetch(messageToEditId).catch(err => {
			interaction.reply({
				content: `<:round_cross:1424312051794186260> Le message n'a pas pu être fetch : \`${err}\``,
				flags: MessageFlags.Ephemeral,
			});
			return null;
		});

		// If the message could not be retrieved, stop execution
		if (!message) return;

		try {
			// Perform the edit on the fetched message (set new content here)
			await message!.edit({
				content: "",
			});

			// On success: send an ephemeral confirmation to the user
			return interaction.reply({
				content: "<:round_check:1424065559355592884> Message édité avec succès.",
				flags: MessageFlags.Ephemeral,
			});
		}
		catch (err) {
			// On error: send an ephemeral error reply with the error details
			return interaction.reply({
				content: `<:round_cross:1424312051794186260> Erreur lors de l'édition du message : \`${err}\``,
				flags: MessageFlags.Ephemeral,
			});
		}

	}
}
