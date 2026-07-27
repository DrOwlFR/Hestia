import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { getDiscordIdFromSiteId } from "../services/userService";
import { createNotificationEmbed } from "../utils/embedFunction";
import type { NotificationItem, QuoteChapterQuotedNotification } from "../utils/types";
import { handleSendingError } from "./errorHandler";

/**
 * sendQuoteNotification: sends a quote notification to the recipients.
 * Summary: This function constructs a notification embed with the provided title and description, and sends it to each recipient in the notification. If sending fails for any recipient, their ID is added to the failedRecipients array.
 * Steps:
 * - Create an embed using the createNotificationEmbed function with the provided title and description.
 * - Iterate over each recipient in the notification's recipients array, attempt to send the embed and add any failed recipient IDs to the failedRecipients array (through the handleSendingError function).
 * - Return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The NotificationItem object containing details about the quote event and recipients.
 * @param quoterName - The name of the user who initiated the quote action, used as the author name in the notification embed.
 * @param title - The title of the notification embed.
 * @param description - The description of the notification embed.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
async function sendQuoteNotification(client: ShewenyClient, notification: NotificationItem, quoterName: string, title: string, description: string): Promise<string[]> {
	const failedRecipients: string[] = [];

	// Create an embed for the notification using the provided title, description, and author information

	const embed = createNotificationEmbed({
		author: {
			name: quoterName,
			iconURL: notification.avatarUrl ?? undefined,
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
 * handleQuoteChapterQuoted: handles the notification for a chapter that has been quoted.
 * Summary: This function constructs the title and description for the notification embed, informing the user that their chapter has been quoted. It then calls sendQuoteNotification to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Get the Discord ID of the quoter using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification about the quoted chapter.
 * - Call sendQuoteNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The QuoteChapterQuotedNotification object containing details about the quoted chapter event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleQuoteChapterQuoted(client: ShewenyClient, notification: QuoteChapterQuotedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the quoter using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification about the quoted chapter
	const title = "🪶 Nouvelle citation";
	const description = `**[${data.quoter_name}](${config.APILink}/profile/${data.quoter_slug})**${mention} a cité votre chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» dans l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendFollowNotification with the constructed title and description to send the notification to the recipients
	return sendQuoteNotification(client, notification, data.quoter_name, title, description);
}
