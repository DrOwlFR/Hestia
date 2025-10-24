import { Command } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { ApplicationCommandOptionType, MessageFlags, type ChatInputCommandInteraction, TextChannel } from "discord.js";

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

	async execute(interaction: ChatInputCommandInteraction) {

		const { options, channel } = interaction;
		const sayMessage = options.getString("message");

		await interaction.reply({ content: "Ainsi ai-je parlé.", flags: MessageFlags.Ephemeral });

		await (channel as TextChannel).send({
			content: sayMessage!,
		});

	}
}
