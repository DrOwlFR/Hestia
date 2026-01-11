import type { ThreadChannel } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";

export class ThreadUpdateEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "threadCreate", {
			description: "New thread created",
			once: false,
			emitter: client,
		});
	}

	async execute(thread: ThreadChannel) {

		if (thread.archived) return;

		// Join new threads
		if (!thread.joined) {
			try {
				await thread.join();
			} catch {}
		}

	}
};
