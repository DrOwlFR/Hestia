import { Command } from "sheweny";
import type { ShewenyClient } from "sheweny";
import type { ChatInputCommandInteraction } from "discord.js";

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

		const tryPong = await interaction.reply({ content: "Calcul... <a:load:1424326891778867332>", fetchReply: true });
		const botLatency = `${"```"}\n ${tryPong.createdTimestamp - interaction.createdTimestamp}ms  ${"```"}`;
		const APILatency = `${"```"}\n ${this.client.ws.ping}ms  ${"```"}`;

		const embed = this.client.functions.embed()
			.setTitle("🏓  Pong !  🏓")
			.addFields([
				{ name: "🤖  Latence du bot", value: botLatency, inline: true },
				{ name: "💻  Latence de l'API", value: APILatency, inline: true },
			]);

		interaction.editReply({
			content: null,
			embeds: [embed],
		});

	}
}
