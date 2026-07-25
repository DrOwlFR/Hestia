import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { getCurrentSeason } from "../../seasonsSystem";
import { createNotificationEmbed } from "../utils/embedFunction";
import type { AuthPromotionAcceptedNotification, AuthPromotionRejectedNotification, NotificationItem } from "../utils/types";
import { handleSendingError } from "./errorHandler";

/**
 * sendModerationNotification: sends a moderation notification to the recipients.
 * Summary: This function constructs a notification embed with the provided title and description, and sends it to each recipient in the notification. If sending fails for any recipient, their ID is added to the failedRecipients array.
 * Steps:
 * - Get the current season and its corresponding icon from the configuration.
 * - Create an embed using the createNotificationEmbed function with the provided title and description.
 * - Iterate over each recipient in the notification's recipients array, attempt to send the embed and add any failed recipient IDs to the failedRecipients array (through the handleSendingError function).
 * - Return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The NotificationItem object containing details about the moderation event and recipients.
 * @param title - The title of the notification embed.
 * @param description - The description of the notification embed.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
async function sendModerationNotification(client: ShewenyClient, notification: NotificationItem, title: string, description: string): Promise<string[]> {
	const failedRecipients: string[] = [];

	// Get the current season and its corresponding icon from the configuration
	const currentSeason = getCurrentSeason();
	const icon = config[currentSeason].logo;

	// Create the notification embed using the provided title and description
	const embed = createNotificationEmbed({
		author: {
			name: "Jardin des Esperluettes",
			iconURL: icon,
		},
		title,
		description,
		timestamp: notification.createdAt,
	});

	// Iterate over each recipient in the notification's recipients array, attempt to send the embed and add any failed recipient IDs to the failedRecipients array (through the handleSendingError function)
	for (const usedId of notification.recipients) {
		try {
			const user = await client.users.fetch(usedId);
			await user.send({ embeds: [embed] });
		} catch (error) {
			await handleSendingError(client, error, usedId, failedRecipients);
		}
	}
	// Return the array of failed recipient IDs
	return failedRecipients;
}

/**
 * handleAuthPromotionAccepted: handles the notification for a user whose promotion request has been accepted.
 * Summary: This function constructs the title and description for the notification embed, congratulating the user on their promotion acceptance. It then calls sendModerationNotification to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Construct the title and description for the notification embed, congratulating the user on their promotion acceptance.
 * - Call sendModerationNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The AuthPromotionAcceptedNotification object containing details about the promotion acceptance event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleAuthPromotionAccepted(client: ShewenyClient, notification: AuthPromotionAcceptedNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the notification embed, congratulating the user on their promotion acceptance
	const title = "🌱 Promotion *acceptée*";
	const description = `Félicitations, ${data.user_name} ! 🎉 Votre demande de promotion a été acceptée par l'équipe du Jardin. Vous êtes maintenant une **Esperluette confirmée** !`;

	// Call sendModerationNotification with the constructed title and description to send the notification to the recipients
	return sendModerationNotification(client, notification, title, description);
}

/**
 * handleAuthPromotionRejected: handles the notification for a user whose promotion request has been rejected.
 * Summary: This function constructs the title and description for the notification embed, informing the user of their promotion rejection. It then calls sendModerationNotification to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Construct the title and description for the notification embed, informing the user of their promotion rejection.
 * - Call sendModerationNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The AuthPromotionRejectedNotification object containing details about the promotion rejection event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleAuthPromotionRejected(client: ShewenyClient, notification: AuthPromotionRejectedNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the notification embed, informing the user of their promotion rejection
	const title = "🌱 Promotion *refusée*";
	const description = `**${data.user_name}**, votre demande de promotion a été refusée par l'équipe du Jardin.`;

	// Call sendModerationNotification with the constructed title and description to send the notification to the recipients
	return sendModerationNotification(client, notification, title, description);
}
