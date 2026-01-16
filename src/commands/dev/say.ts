import type { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

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
		const sayMessage = options.getString("message");

		// Reply to the command issuer with an ephemeral confirmation message
		await interaction.reply({ content: "Ainsi ai-je parlé.", flags: MessageFlags.Ephemeral });

		// Send the specified message in the current text channel as the bot
		await (channel as TextChannel).send({
			content: sayMessage!,
		});

	}
}
