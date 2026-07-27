import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { getDiscordIdFromSiteId } from "../services/userService";
import { createNotificationEmbed } from "../utils/embedFunction";
import type { NotificationItem, StoryCoAuthorChapterCreatedNotification, StoryCoAuthorChapterDeletedNotification, StoryCoAuthorChapterUpdatedNotification, StoryCollaboratorLeftNotification, StoryCollaboratorRemovedNotification, StoryCollaboratorRoleGivenNotification } from "../utils/types";
import { handleSendingError } from "./errorHandler";

/**
 * sendCollaborationNotification: sends a notification about a collaboration event to the recipients.
 * Summary: This function creates an embed for the collaboration notification and sends it to each recipient. If sending fails for any recipient, their user ID is added to the failedRecipients array.
 * Steps:
 * - Create an embed using the createNotificationEmbed function with the provided title, description, and author information.
 * - Iterate over each recipient in the notification's recipients array, attempt to send the embed and add any failed recipient IDs to the failedRecipients array (through the handleSendingError function).
 * - Return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification object containing details about the collaboration event and recipients.
 * @param data - The data object containing the user's name for the notification.
 * @param title - The title of the notification embed.
 * @param description - The description of the notification embed, which includes details about the collaboration event.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
async function sendCollaborationNotification(client: ShewenyClient, notification: NotificationItem, userName: string, title: string, description: string): Promise<string[]> {
	const failedRecipients: string[] = [];

	// Create an embed for the notification using the provided title, description, and author information
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
 * handleStoryCoAuthorChapterCreated: handles notifications for new co-author chapters
 * Summary: This function constructs the appropriate title and description for the notification about a new co-author chapter and calls sendCollaborationNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who created the co-author chapter using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification about the new co-author chapter.
 * - Call sendCollaborationNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the co-author chapter details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleStoryCoAuthorChapterCreated(client: ShewenyClient, notification: StoryCoAuthorChapterCreatedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who created the co-author chapter using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification about the new co-author chapter
	const title = "🤝 Nouveau chapitre co-écrit publié";
	const description = `**[${data.user_name}](${config.APILink}/profile/${data.user_slug})**${mention} a publié un nouveau chapitre co-écrit à «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendCollaborationNotification with the constructed title and description to send the notification to the recipients
	return await sendCollaborationNotification(client, notification, data.user_name, title, description);
}

/**
 * handleStoryCoAuthorChapterUpdated: handles notifications for updated co-author chapters
 * Summary: This function constructs the appropriate title and description for the notification about an updated co-author chapter and calls sendCollaborationNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who updated the co-author chapter using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification about the updated co-author chapter.
 * - Call sendCollaborationNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the co-author chapter details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleStoryCoAuthorChapterUpdated(client: ShewenyClient, notification: StoryCoAuthorChapterUpdatedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who updated the co-author chapter using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification about the updated co-author chapter
	const title = "🤝 Chapitre co-écrit mis à jour";
	const description = `**[${data.user_name}](${config.APILink}/profile/${data.user_slug})**${mention} a mis à jour le chapitre co-écrit «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendCollaborationNotification with the constructed title and description to send the notification to the recipients
	return await sendCollaborationNotification(client, notification, data.user_name, title, description);
}

/**
 * handleStoryCoAuthorChapterDeleted: handles notifications for deleted co-author chapters
 * Summary: This function constructs the appropriate title and description for the notification about a deleted co-author chapter and calls sendCollaborationNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who deleted the co-author chapter using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification about the deleted co-author chapter.
 * - Call sendCollaborationNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the co-author chapter details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleStoryCoAuthorChapterDeleted(client: ShewenyClient, notification: StoryCoAuthorChapterDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who deleted the co-author chapter using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification about the deleted co-author chapter
	const title = "🤝 Chapitre co-écrit supprimé";
	const description = `**[${data.user_name}](${config.APILink}/profile/${data.user_slug})**${mention} a supprimé le chapitre co-écrit «\u00A0**${data.chapter_title}**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendCollaborationNotification with the constructed title and description to send the notification to the recipients
	return await sendCollaborationNotification(client, notification, data.user_name, title, description);
}

/**
 * handleStoryCollaboratorRoleGiven: handles notifications for when a collaborator role is given
 * Summary: This function constructs the appropriate title and description for the notification about a collaborator role being given and calls sendCollaborationNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who gave the collaborator role using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification about the collaborator role being given.
 * - Call sendCollaborationNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the collaborator role details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleStoryCollaboratorRoleGiven(client: ShewenyClient, notification: StoryCollaboratorRoleGivenNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who gave the collaborator role using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification about the collaborator role being given
	const role = data.role === "author" ? "coauteurice" : "bêta-lecteurice";
	const title = `🤝 Nouveau rôle de **${role}** attribué`;
	const description = `**[${data.user_name}](${config.APILink}/profile/${data.user_slug})**${mention} vous a attribué le rôle de **${role}** sur l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendCollaborationNotification with the constructed title and description to send the notification to the recipients
	return await sendCollaborationNotification(client, notification, data.user_name, title, description);
}

/**
 * handleStoryCollaboratorRoleRemoved: handles notifications for when a collaborator role is removed
 * Summary: This function constructs the appropriate title and description for the notification about a collaborator role being removed and calls sendCollaborationNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who removed the collaborator role using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification about the collaborator role being removed.
 * - Call sendCollaborationNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the collaborator role details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleStoryCollaboratorRoleRemoved(client: ShewenyClient, notification: StoryCollaboratorRemovedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who removed the collaborator role using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification about the collaborator role being removed
	const title = "🤝 Rôle de bêta-lecteurice supprimé";
	const description = `**[${data.user_name}](${config.APILink}/profile/${data.user_slug})**${mention} vous a retiré le rôle de **bêta-lecteurice** sur l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendCollaborationNotification with the constructed title and description to send the notification to the recipients
	return await sendCollaborationNotification(client, notification, data.user_name, title, description);
}

/**
 * handleStoryCollaboratorLeft: handles notifications for when a collaborator leaves
 * Summary: This function constructs the appropriate title and description for the notification about a collaborator leaving and calls sendCollaborationNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who left the collaboration using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification about the collaborator leaving.
 * - Call sendCollaborationNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the collaborator details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleStoryCollaboratorLeft(client: ShewenyClient, notification: StoryCollaboratorLeftNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who left the collaboration using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification about the collaborator leaving
	const title = "🤝 Départ d'un(e) collaborateurice";
	const description = `**[${data.user_name}](${config.APILink}/profile/${data.user_slug})**${mention} ne collabore plus sur l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendCollaborationNotification with the constructed title and description to send the notification to the recipients
	return await sendCollaborationNotification(client, notification, data.user_name, title, description);
}
