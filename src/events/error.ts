import type { TextChannel } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";

export class ErrorEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "error", {
			description: "New error sent",
			once: false,
			emitter: client,
		});
	}

	async execute(error: Error) {

		const errorText = error.stack || error.toString() || "Erreur inconnue";

		if (errorText.length < 2000) {
			await (this.client.channels.cache.get("1423712292163293336") as TextChannel)!.send({
				content: `\`\`\`js\n${error.stack}\n\`\`\``,
			});
		}
		else {
			await (this.client.channels.cache.get("1423712292163293336") as TextChannel)!.send({
				content: "Erreur trop longue, envoyée en fichier :",
				files: [{ name: "error.txt", attachment: Buffer.from(errorText, "utf-8") }],
			});
		}

		// eslint-disable-next-line no-console
		return console.warn(error);

	}
};
