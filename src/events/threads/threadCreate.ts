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

	/**
	 * Execute: handler for the `threadCreate` event.
	 * Summary: Joins newly created threads if they are not archived.
	 * Steps:
	 * - Check if the thread is archived; if so, skip
	 * - Join the thread if the bot hasn't already joined
	 * @param thread - The thread channel that was created.
	 */
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
