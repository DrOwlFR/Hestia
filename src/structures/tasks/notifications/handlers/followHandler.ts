import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { createNotificationEmbed } from "../utils/embedFunction";
import type { FollowNewFollowerNotification, FollowNewStoryNotification, NotificationItem } from "../utils/types";
import { handleSendingError } from "./errorHandler";

/**
 * sendFollowNotification: sends a follow notification to the recipients.
 * Summary: This function constructs a notification embed with the provided title and description, and sends it to each recipient in the notification. If sending fails for any recipient, their ID is added to the failedRecipients array.
 * Steps:
 * - Create an embed using the createNotificationEmbed function with the provided title and description.
 * - Iterate over each recipient in the notification's recipients array, attempt to send the embed and add any failed recipient IDs to the failedRecipients array (through the handleSendingError function).
 * - Return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The NotificationItem object containing details about the follow event and recipients.
 * @param userName - The name of the user who initiated the follow action, used as the author name in the notification embed.
 * @param title - The title of the notification embed.
 * @param description - The description of the notification embed.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
async function sendFollowNotification(client: ShewenyClient, notification: NotificationItem, userName: string, title: string, description: string): Promise<string[]> {
	const failedRecipients: string[] = [];

	// Create the notification embed using the provided title and description
	const embed = createNotificationEmbed({
		author: {
			name: userName,
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
 * handleFollowNewFollower: handles the notification for a user who has gained a new follower.
 * Summary: This function constructs the title and description for the notification embed, informing the user that they have a new follower. It then calls sendFollowNotification to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Construct the title and description for the notification about the new follower.
 * - Call sendFollowNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The FollowNewFollowerNotification object containing details about the new follower event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleFollowNewFollower(client: ShewenyClient, notification: FollowNewFollowerNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the notification about the new co-author chapter
	const title = "👤 Nouveau follower";
	const description = `**[${data.follower_name}](${config.APILink}/profile/${data.follower_slug})** vous suit.`;

	// Call sendFollowNotification with the constructed title and description to send the notification to the recipients
	return await sendFollowNotification(client, notification, data.follower_name, title, description);
}

/**
 * handleFollowNewStory: handles the notification for a user who has published a new story.
 * Summary: This function constructs the title and description for the notification embed, informing the user that a new story has been published. It then calls sendFollowNotification to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Construct the title and description for the notification about the new story.
 * - Call sendFollowNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The FollowNewStoryNotification object containing details about the new story event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleFollowNewStory(client: ShewenyClient, notification: FollowNewStoryNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the notification about the new co-author chapter
	const title = "📚 Nouvelle histoire publiée";
	const description = `**[${data.author_name}](${config.APILink}/profile/${data.author_slug})** a publié une nouvelle histoire : «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendFollowNotification with the constructed title and description to send the notification to the recipients
	return await sendFollowNotification(client, notification, data.author_name, title, description);
}
