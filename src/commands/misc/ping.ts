import { type ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { connection } from "mongoose";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

export class PingCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "ping",
			description: "Ping Pong",
			category: "Divers",
			usage: "ping",
			examples: ["ping"],
		});
	}

	/**
	 * Execute: main handler for the `ping` command.
	 * Summary: Measure and display the bot's response latency, Discord API latency, and database latency.
	 * Steps:
	 * - Send an initial reply indicating calculation in progress
	 * - Calculate bot latency by fetching the reply timestamp
	 * - Retrieve API latency from the WebSocket ping
	 * - Ping the database to measure DB latency
	 * - Build an embed with the latency values and edit the reply
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		// Send an initial reply to indicate that latency calculation is in progress
		// in order to avoid being blocked by Discord on the following actions are long
		await interaction.reply({ content: "Calcul... <a:load:1424326891778867332>", flags: MessageFlags.Ephemeral });

		// Fetch the reply to calculate bot latency (time between command and response)
		const tryPong = await interaction.fetchReply();
		const botLatency = `${"```"}\n ${tryPong.createdTimestamp - interaction.createdTimestamp}ms  ${"```"}`;

		// Get the Discord API latency from the WebSocket ping
		const APILatency = `${"```"}\n ${this.client.ws.ping}ms  ${"```"}`;

		// Measure database latency by pinging the MongoDB connection
		const start = Date.now();
		await connection.db?.admin().command({ ping: 1 });
		const dBLatency = `${"```"}\n ${Date.now() - start}ms  ${"```"}`;

		// Build an embed displaying the three latency values
		const embed = this.client.functions.embed()
			.setTitle("🏓  Pong !  🏓")
			.addFields([
				{ name: "🤖  Latence du bot", value: botLatency, inline: true },
				{ name: "💻  Latence de l'API", value: APILatency, inline: true },
				{ name: "🦉 Latence de la BDD", value: dBLatency, inline: true },
			]);

		// Edit the initial reply to replace the loading message with the latency embed
		interaction.editReply({
			content: null,
			embeds: [embed],
		});

	}
}
