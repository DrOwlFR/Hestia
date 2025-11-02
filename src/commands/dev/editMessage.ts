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

	async execute(interaction: ChatInputCommandInteraction) {

		const messageToEditId = "";
		const message = await interaction.channel?.messages.fetch(messageToEditId).catch(err => {
			interaction.reply({
				content: `<:round_cross:1424312051794186260> Le message n'a pas pu être fetch : \`${err}\``,
				flags: MessageFlags.Ephemeral,
			});
			return null;
		});

		if (!message) return;

		try {
			await message!.edit({
				content: "",
			});

			return interaction.reply({
				content: "<:round_check:1424065559355592884> Message édité avec succès.",
				flags: MessageFlags.Ephemeral,
			});
		}
		catch (err) {
			return interaction.reply({
				content: `<:round_cross:1424312051794186260> Erreur lors de l'édition du message : \`${err}\``,
				flags: MessageFlags.Ephemeral,
			});
		}

	}
}
