import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { createNotificationEmbed } from "../utils/embedFunction";
import type { NotificationItem, StoryChapterCommentNotification, StoryChapterReplyCommentNotification, StoryChapterRootCommentNotification } from "../utils/types";
import { handleSendingError } from "./errorHandler";

/**
 * sendCommentNotification: sends a notification about a comment to the recipients.
 * Summary: This function creates an embed for the comment notification and sends it to each recipient. If sending fails for any recipient, their user ID is added to the failedRecipients array.
 * Steps:
 * - Create an embed using the createNotificationEmbed function with the provided title, description, and author information.
 * - Iterate over each recipient in the notification's recipients array, attempt to send the embed and add any failed recipient IDs to the failedRecipients array (through the handleSendingError function).
 * - Return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification object containing details about the comment and recipients.
 * @param data - The data object containing the author's name for the notification.
 * @param title - The title of the notification embed.
 * @param description - The description of the notification embed, which includes details about the comment and the story/chapter.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
async function sendCommentNotification(client: ShewenyClient, notification: NotificationItem, authorName: string, title: string, description: string): Promise<string[]> {
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
 * handleChapterComment: handles notifications for new comments on story chapters
 * Summary: This function determines whether the comment is a reply or a root comment and constructs the appropriate title and description for the notification. It then calls sendCommentNotification to send the notification to the recipients.
 * Steps:
 * - Determine the title and description based on whether the comment is a reply or a root comment
 * - Call sendCommentNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the comment details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleChapterComment(client: ShewenyClient, notification: StoryChapterCommentNotification): Promise<string[]> {
	const { data } = notification;

	// Determine the title and description based on whether the comment is a reply or a root comment
	const title = data.is_reply ? "💬 Nouvelle réponse à un commentaire" : "💬 Nouveau commentaire";
	const action = data.is_reply ? "répondu à un commentaire sur" : "commenté";
	const description = `**[${data.author_name}](${config.APILink}/profile/${data.author_slug})** a ${action} le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_name}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendCommentNotification to send the notification to the recipients
	return await sendCommentNotification(client, notification, data.author_name, title, description);
}

/**
 * handleChapterRootComment: handles notifications for root comments on story chapters
 * Summary: This function constructs the title and description for a root comment notification and calls sendCommentNotification to send the notification to the recipients.
 * Steps:
 * - Construct the title and description for the root comment notification
 * - Call sendCommentNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the root comment details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleChapterRootComment(client: ShewenyClient, notification: StoryChapterRootCommentNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the root comment notification
	const title = "💬 Nouveau commentaire";
	const description = `**[${data.author_name}](${config.APILink}/profile/${data.author_slug})** a commenté le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_name}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendCommentNotification to send the notification to the recipients
	return await sendCommentNotification(client, notification, data.author_name, title, description);
}

/**
 * handleChapterReplyComment: handles notifications for reply comments on story chapters
 * Summary: This function constructs the title and description for a reply comment notification and calls sendCommentNotification to send the notification to the recipients.
 * Steps:
 * - Construct the title and description for the reply comment notification
 * - Call sendCommentNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the reply comment details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleChapterReplyComment(client: ShewenyClient, notification: StoryChapterReplyCommentNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the reply comment notification
	const title = "💬 Nouvelle réponse à un commentaire";
	const description = `**[${data.author_name}](${config.APILink}/profile/${data.author_slug})** a répondu à un commentaire sur le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_name}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendCommentNotification to send the notification to the recipients
	return await sendCommentNotification(client, notification, data.author_name, title, description);
}
