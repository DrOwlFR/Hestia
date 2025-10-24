import { Command } from "sheweny";
import type { ShewenyClient } from "sheweny";
import type { ChatInputCommandInteraction } from "discord.js";
import { connection } from "mongoose";

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

	async execute(interaction: ChatInputCommandInteraction) {

		await interaction.reply({ content: "Calcul... <a:load:1424326891778867332>" });
		const tryPong = await interaction.fetchReply();
		const botLatency = `${"```"}\n ${tryPong.createdTimestamp - interaction.createdTimestamp}ms  ${"```"}`;
		const APILatency = `${"```"}\n ${this.client.ws.ping}ms  ${"```"}`;

		const start = Date.now();
		await connection.db?.admin().command({ ping: 1 });
		const dBLatency = `${"```"}\n ${Date.now() - start}ms  ${"```"}`;

		const embed = this.client.functions.embed()
			.setTitle("🏓  Pong !  🏓")
			.addFields([
				{ name: "🤖  Latence du bot", value: botLatency, inline: true },
				{ name: "💻  Latence de l'API", value: APILatency, inline: true },
				{ name: "🦉 Latence de la BDD", value: dBLatency, inline: true },
			]);

		interaction.editReply({
			content: null,
			embeds: [embed],
		});

	}
}
