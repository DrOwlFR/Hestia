import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { getCurrentSeason } from "../../seasonsSystem";
import { createNotificationEmbed } from "../utils/embedFunction";
import type { NewsPublishedNotification, NotificationItem } from "../utils/types";
import { handleSendingError } from "./errorHandler";

/**
 * sendNewsNotification: sends a news notification to the recipients.
 * Summary: This function constructs a notification embed with the provided title and description, and sends it to each recipient in the notification. If sending fails for any recipient, their ID is added to the failedRecipients array.
 * Steps:
 * - Get the current season and its corresponding icon from the configuration.
 * - Create an embed using the createNotificationEmbed function with the provided title and description.
 * - Iterate over each recipient in the notification's recipients array, attempt to send the embed and add any failed recipient IDs to the failedRecipients array (through the handleSendingError function).
 * - Return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The NotificationItem object containing details about the news event and recipients.
 * @param title - The title of the notification embed.
 * @param description - The description of the notification embed.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
async function sendNewsNotification(client: ShewenyClient, notification: NotificationItem, title: string, description: string): Promise<string[]> {
	const failedRecipients: string[] = [];

	// Get the current season and its corresponding icon from the configuration
	const currentSeason = getCurrentSeason();
	const icon = config[currentSeason].favicon;

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
	for (const userId of notification.recipients) {
		try {
			const user = await client.users.fetch(userId);
			await user.send({ embeds: [embed] });
		} catch (error) {
			await handleSendingError(client, error, userId, failedRecipients);
		}
	}
	// Return the array of failed recipient IDs
	return failedRecipients;
}

/**
 * handleNewsPublished: handles the notification for a news article that was published.
 * Summary: This function constructs the title and description for the notification embed, including links to the news article. It then calls sendNewsNotification to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Construct the title and description for the notification embed, including links to the news article.
 * - Call sendNewsNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The NewsPublishedNotification object containing details about the news published event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleNewsPublished(client: ShewenyClient, notification: NewsPublishedNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the notification embed, including links to the news article
	const title = "📰 Nouvelle actualité";
	const description = `Une **nouvelle actualité a été publiée** sur le Jardin : «\u00A0**[${data.news_title}](${config.APILink}/news/${data.news_slug})**\u00A0».`;

	// Call sendNewsNotification with the constructed title and description to send the notification to the recipients
	return await sendNewsNotification(client, notification, title, description);
}
