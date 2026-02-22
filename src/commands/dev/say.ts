import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType, ChannelType, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

import config from "../../structures/config";

export class SayCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "say",
			description: "Fait parler le bot.",
			category: "Dev",
			adminsOnly: true,
			usage: "say [message]",
			examples: ["say Hello there!"],
			options: [{
				name: "message",
				description: "Message à faire dire au bot.",
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	/**
	 * Execute: main handler for the `say` command.
	 * Summary: Make the bot send a specified message in the current text channel.
	 * Steps:
	 * - Extract the message content from command options
	 * - Reply to the command issuer with an ephemeral confirmation
	 * - Send the provided message in the channel as the bot
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		// Extract options and channel from the interaction
		const { options, channel } = interaction;

		// Get the message content provided by the user (required option)
		const sayMessage = options.getString("message", true);

		// Verify the command is used in a text channel
		if (!channel || channel.type !== ChannelType.GuildText) {
			return interaction.reply({ content: `${config.emojis.cross} Cette commande doit être utilisée dans un salon texte.`, flags: MessageFlags.Ephemeral });
		}

		// Reply to the command issuer with an ephemeral confirmation message
		await interaction.reply({ content: "Ainsi ai-je parlé.", flags: MessageFlags.Ephemeral });

		// Send the specified message in the current text channel as the bot
		await channel.send({
			content: sayMessage,
		});

	}
}
