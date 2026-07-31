import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { getCurrentSeason } from "../../seasonsSystem";
import { createNotificationEmbed } from "../utils/embedFunction";
import type { NotificationItem, StoryChapterScheduledPublishedNotification } from "../utils/types";
import { handleSendingError } from "./errorHandler";

/**
 * sendPublicationNotification: sends a publication notification to the recipients.
 * Summary: This function constructs a notification embed with the provided title and description, and sends it to each recipient in the notification. If sending fails for any recipient, their ID is added to the failedRecipients array.
 * Steps:
 * - Get the current season and its corresponding icon from the configuration.
 * - Create an embed using the createNotificationEmbed function with the provided title and description.
 * - Iterate over each recipient in the notification's recipients array, attempt to send the embed and add any failed recipient IDs to the failedRecipients array (through the handleSendingError function).
 * - Return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The NotificationItem object containing details about the publication event and recipients.
 * @param title - The title of the notification embed.
 * @param description - The description of the notification embed.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
async function sendPublicationNotification(client: ShewenyClient, notification: NotificationItem, title: string, description: string): Promise<string[]> {
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
 * handleStoryChapterScheduledPublished: handles the notification for a scheduled chapter publication event.
 * Summary: This function constructs a title and description for the publication notification based on the data provided in the notification. It then calls the sendPublicationNotification function to send the notification to the recipients and returns the result.
 * Steps:
 * - Construct the title and description for the publication notification using the chapter and story details from the data.
 * - Call the sendPublicationNotification function to send the notification to the recipients and return the result.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The StoryChapterScheduledPublishedNotification object containing details about the scheduled chapter publication event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleStoryChapterScheduledPublished(client: ShewenyClient, notification: StoryChapterScheduledPublishedNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the publication notification
	const title = "📖 Chapitre publié automatiquement";
	const description = `Le chapitre programmé «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_title}/chapters/${data.chapter_slug})**\u00A0» de l’histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0» a été publié automatiquement.`;

	// Call the sendPublicationNotification function to send the notification to the recipients and return the result
	return sendPublicationNotification(client, notification, title, description);
}
