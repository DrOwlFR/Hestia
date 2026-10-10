import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { getDiscordIdFromSiteId } from "../services/userService";
import { createNotificationEmbed } from "../utils/embedFunction";
import type { NewsReplyCommentNotification, NotificationItem } from "../utils/types";
import { handleSendingError } from "./errorHandler";

/**
 * sendNewsCommentNotification: sends a notification about a news comment to the recipients.
 * Summary: This function creates an embed for the news comment notification and sends it to each recipient. If sending fails for any recipient, their user ID is added to the failedRecipients array.
 * Steps:
 * - Create an embed using the createNotificationEmbed function with the provided title, description, and author information.
 * - Iterate over each recipient in the notification's recipients array, attempt to send the embed and add any failed recipient IDs to the failedRecipients array (through the handleSendingError function).
 * - Return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification object containing details about the news comment and recipients.
 * @param authorName - The name of the author of the comment for the notification.
 * @param title - The title of the notification embed.
 * @param description - The description of the notification embed, which includes details about the comment and the news article.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
async function sendNewsCommentNotification(client: ShewenyClient, notification: NotificationItem, authorName: string, title: string, description: string): Promise<string[]> {
	const failedRecipients: string[] = [];

	// Create an embed for the notification using the provided title, description, and author information
	const embed = createNotificationEmbed({
		author: {
			name: authorName,
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
 * handleNewsReplyComment: handles the notification for a reply to a comment on a news article.
 * Summary: This function constructs the title and description for the notification embed, informing the user that their comment has received a reply. It then calls sendNewsCommentNotification to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Get the Discord ID of the user who made the reply using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification about the reply comment.
 * - Call sendNewsCommentNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The NewsReplyCommentNotification object containing details about the reply comment event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleNewsReplyComment(client: ShewenyClient, notification: NewsReplyCommentNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who made the comment using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? `(<@${discordId}>)` : "data.author_name";

	// Construct the title and description for the notification about the reply comment
	const title = "💬 Nouvelle réponse à un commentaire";
	const description = `[${data.author_name}](${config.APILink}/profile/${data.author_slug})**${mention} a répondu à un commentaire sur l'actualité «\u00A0[${data.news_title}](${config.APILink}/news/${data.news_slug}?comment=${data.comment_id})**\u00A0».`;

	// Call sendNewsCommentNotification to send the notification to the recipients
	return await sendNewsCommentNotification(client, notification, data.author_name, title, description);
}
