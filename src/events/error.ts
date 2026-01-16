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

	/**
	 * Execute: handler for the `error` event.
	 * Summary: Log errors to a designated error channel, either as a message or file attachment.
	 * Behavior:
	 * - Formats the error stack or string
	 * - If under 2000 characters, sends as a code block message
	 * - If over, sends as a file attachment
	 * - Also logs to console
	 * @param error - The Error object to handle and log.
	 */
	async execute(error: Error) {

		// Format the error text (stack trace or string representation)
		const errorText = error.stack || error.toString() || "Erreur inconnue";

		// If the error text is short enough, send it as a code block in the error channel
		if (errorText.length < 2000) {
			await (this.client.channels.cache.get("1423712292163293336") as TextChannel)!.send({
				content: `\`\`\`js\n${error.stack}\n\`\`\``,
			});
		}
		else {
			// If too long, send as a file attachment
			await (this.client.channels.cache.get("1423712292163293336") as TextChannel)!.send({
				content: "Erreur trop longue, envoyée en fichier :",
				files: [{ name: "error.txt", attachment: Buffer.from(errorText, "utf-8") }],
			});
		}

		// Log the error to the console as well
		// eslint-disable-next-line no-console
		return console.warn(error);

	}
};
