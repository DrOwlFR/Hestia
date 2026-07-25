import type { ShewenyClient } from "sheweny";

import { createNotificationEmbed } from "../utils/embedFunction";
import type { NotificationItem } from "../utils/types";
import { handleSendingError } from "./errorHandler";

// Handler for default notifications, used when no specific handler is defined for a notification type
export async function handleDefaultNotification(client: ShewenyClient, notification: NotificationItem): Promise<string[]> {
	const failedRecipients: string[] = [];

	const embed = createNotificationEmbed({
		description: `${notification.defaultText}.`,
		timestamp: notification.createdAt,
	});

	for (const userId of notification.recipients) {
		try {
			const user = await client.users.fetch(userId);
			// Send the default notification message to the user
			await user.send({ embeds: [embed] });
		} catch (error) {
			await handleSendingError(client, error, userId, failedRecipients);
		}
	}

	return failedRecipients;
}
