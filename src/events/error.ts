import type { TextChannel } from "discord.js";
import { Event } from "sheweny";
import type { ShewenyClient } from "sheweny";

export class ErrorEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "error", {
			description: "New error sent",
			once: false,
			emitter: client,
		});
	}

	async execute(error: Error) {

		(this.client.channels.cache.get("1423712292163293336") as TextChannel)!.send({
			content: `${error}`,
		});

		// eslint-disable-next-line no-console
		return console.warn(error);

	}
};
