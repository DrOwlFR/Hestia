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

	/**
	 * Execute: handler for the `threadUpdate` event.
	 * Summary: Joins threads that were unarchived (transitioned from archived to active).
	 * Steps:
	 * - Check if thread was archived and is now unarchived
	 * - Join the thread if the bot hasn't already joined
	 * @param oldThread - The thread channel state before the update.
	 * @param newThread - The thread channel state after the update.
	 */
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
