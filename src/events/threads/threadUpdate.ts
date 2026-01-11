import type { ThreadChannel } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";

export class ThreadUpdateEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "threadUpdate", {
			description: "Thread updated",
			once: false,
			emitter: client,
		});
	}

	async execute(oldThread: ThreadChannel, newThread:ThreadChannel) {

		// Join unarchived thread (only if not already joined)
		if (oldThread.archived && !newThread.archived) {
			if (!newThread.joined) {
				try {
					await newThread.join();
				} catch {}
			}
		}

	}
};
