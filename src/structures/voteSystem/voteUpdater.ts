import type { TextChannel } from "discord.js";
import type { ShewenyClient } from "sheweny";

import { voteSchema } from "../database/models";
import { sendLog } from "../utils/functions";
import { buildVoteContainer } from "./voteRenderer";

const pendingUpdates = new Map<string, NodeJS.Timeout>();

export function scheduleMessageUpdate(client: ShewenyClient, channelId: string, messageId: string) {
	if (pendingUpdates.has(messageId)) {
		clearTimeout(pendingUpdates.get(messageId)!);
	}

	const timeout = setTimeout(async () => {
		pendingUpdates.delete(messageId);

		try {
			const latestVoteDocument = await voteSchema.findOne({ messageId: messageId });
			if (!latestVoteDocument) return;

			const channel = await client.channels.fetch(channelId) as TextChannel | null;
			if (!channel) return;
			const message = await channel.messages.fetch(messageId).catch(() => null);
			if (!message) return;

			const container = buildVoteContainer(latestVoteDocument);
			await message.edit({ components: [container] });
		} catch (err) {
			await sendLog(client, "generalError", `Impossible de mettre à jour le message ${messageId}: ${err}`);
		}
	}, 1500);

	pendingUpdates.set(messageId, timeout);
}
