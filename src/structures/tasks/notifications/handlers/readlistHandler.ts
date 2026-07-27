import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { getDiscordIdFromSiteId } from "../services/userService";
import { createNotificationEmbed } from "../utils/embedFunction";
import type { NotificationItem, ReadlistChapterPublishedNotification, ReadlistChapterUnpublishedNotification, ReadlistStoryAddedNotification, ReadlistStoryCompletedNotification, ReadlistStoryDeletedNotification, ReadlistStoryRepublishedNotification, ReadlistStoryUnpublishedNotification } from "../utils/types";

/**
 * sentReadlistNotification: sends a notification about a readlist event to the recipients.
 * Summary: This function creates an embed for the readlist notification and sends it to each recipient. If sending fails for any recipient, their user ID is added to the failedRecipients array.
 * Steps:
 * - Create an embed using the createNotificationEmbed function with the provided title, description, and author information.
 * - Iterate over each recipient in the notification's recipients array, attempt to send the embed and add any failed recipient IDs to the failedRecipients array.
 * - Return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification object containing details about the readlist event and recipients.
 * @param data - The data object containing the author's name for the notification.
 * @param title - The title of the notification embed.
 * @param description - The description of the notification embed, which includes details about the readlist event.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
async function sentReadlistNotification(client: ShewenyClient, notification: NotificationItem, authorName: string, title: string, description: string): Promise<string[]> {
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
			failedRecipients.push(userId);
		}
	}
	// Return the array of failed recipient IDs
	return failedRecipients;
}

/**
 * handleReadlistChapterPublished: handles the notification for a new chapter published in a readlist.
 * Summary: This function constructs the title and description for the notification embed, including links to the author's profile, chapter, and story. It then calls the sentReadlistNotification function to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Get the Discord ID of the author using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification embed, including links to the author's profile, chapter, and story.
 * - Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The ReadlistChapterPublishedNotification object containing details about the new chapter published event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleReadlistChapterPublished(client: ShewenyClient, notification: ReadlistChapterPublishedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the author using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification embed, including links to the author's profile, chapter, and story
	const title = "📖 Nouveau chapitre publié";
	const description = `**[${data.author_name}](${config.APILink}/profile/${data.author_slug})**${mention} a publié un nouveau chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» à l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs
	return sentReadlistNotification(client, notification, data.author_name, title, description);
}

/**
 * handleReadlistChapterUnpublished: handles the notification for a chapter unpublished in a readlist.
 * Summary: This function constructs the title and description for the notification embed, including links to the author's profile, chapter, and story. It then calls the sentReadlistNotification function to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Get the Discord ID of the author using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification embed, including links to the author's profile, chapter, and story.
 * - Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The ReadlistChapterUnpublishedNotification object containing details about the chapter unpublished event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleReadlistChapterUnpublished(client: ShewenyClient, notification: ReadlistChapterUnpublishedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the author using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification embed, including links to the author's profile, chapter, and story
	const title = "📖 Chapitre dépublié";
	const description = `**[${data.author_name}](${config.APILink}/profile/${data.author_slug})**${mention} a dépublié le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs
	return sentReadlistNotification(client, notification, data.author_name, title, description);
}

/**
 * handleReadlistStoryAdded: handles the notification for a story added to a readlist.
 * Summary: This function constructs the title and description for the notification embed, including links to the reader's profile and the story. It then calls the sentReadlistNotification function to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Get the Discord ID of the reader using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification embed, including links to the reader's profile and the story.
 * - Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The ReadlistStoryAddedNotification object containing details about the story added event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleReadlistStoryAdded(client: ShewenyClient, notification: ReadlistStoryAddedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the reader using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification embed, including links to the reader's profile and the story
	const title = "📚 Nouvel ajout à la Pile à Lire";
	const description = `**[${data.reader_name}](${config.APILink}/profile/${data.reader_slug})**${mention} a ajouté «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0» à sa Pile à Lire.`;

	// Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs
	return sentReadlistNotification(client, notification, data.reader_name, title, description);
}

/**
 * handleReadlistStoryDeleted: handles the notification for a story in reader ReadList that was deleted.
 * Summary: This function constructs the title and description for the notification embed, including links to the author's profile and the story. It then calls the sentReadlistNotification function to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Get the Discord ID of the author using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification embed, including links to the author's profile and the story.
 * - Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The ReadlistStoryDeletedNotification object containing details about the story deleted event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleReadlistStoryDeleted(client: ShewenyClient, notification: ReadlistStoryDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the author using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification embed, including links to the author's profile, chapter, and story
	const title = "📚 Histoire supprimée";
	const description = `**[${data.author_name}](${config.APILink}/profile/${data.author_slug})**${mention} a retiré l'histoire «\u00A0**${data.story_title}**\u00A0».`;

	// Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs
	return sentReadlistNotification(client, notification, data.author_name, title, description);
}

/**
 * handleReadlistStoryUnpublished: handles the notification for a story in reader ReadList that was unpublished.
 * Summary: This function constructs the title and description for the notification embed, including links to the author's profile and the story. It then calls the sentReadlistNotification function to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Get the Discord ID of the author using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification embed, including links to the author's profile and the story.
 * - Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The ReadlistStoryUnpublishedNotification object containing details about the story unpublished event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleReadlistStoryUnpublished(client: ShewenyClient, notification: ReadlistStoryUnpublishedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the author using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification embed, including links to the author's profile, chapter, and story
	const title = "📚 Histoire dépubliée";
	const description = `**[${data.author_name}](${config.APILink}/profile/${data.author_slug})**${mention} a retiré l'histoire «\u00A0**${data.story_title}**\u00A0».`;

	// Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs
	return sentReadlistNotification(client, notification, data.author_name, title, description);
}

/**
 * handleReadlistStoryRepublished: handles the notification for a story in reader ReadList that was republished.
 * Summary: This function constructs the title and description for the notification embed, including links to the author's profile and the story. It then calls the sentReadlistNotification function to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Get the Discord ID of the author using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification embed, including links to the author's profile and the story.
 * - Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The ReadlistStoryRepublishedNotification object containing details about the story republished event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleReadlistStoryRepublished(client: ShewenyClient, notification: ReadlistStoryRepublishedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the author using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification embed, including links to the author's profile, chapter, and story
	const title = "📚 Histoire republiée";
	const description = `**[${data.author_name}](${config.APILink}/profile/${data.author_slug})**${mention} a republié l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs
	return sentReadlistNotification(client, notification, data.author_name, title, description);
}

/**
 * handleReadlistStoryCompleted: handles the notification for a story in reader ReadList that was marked as completed.
 * Summary: This function constructs the title and description for the notification embed, including links to the author's profile and the story. It then calls the sentReadlistNotification function to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Get the Discord ID of the author using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification embed, including links to the author's profile and the story.
 * - Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The ReadlistStoryCompletedNotification object containing details about the story completed event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleReadlistStoryCompleted(client: ShewenyClient, notification: ReadlistStoryCompletedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the author using their site ID from the notification data and construct a mention string if the Discord ID is found
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification embed, including links to the author's profile, chapter, and story
	const title = "📚 Histoire terminée";
	const description = `**[${data.author_name}](${config.APILink}/profile/${data.author_slug})**${mention} a terminé l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call the sentReadlistNotification function to send the notification to the recipients and return the array of failed recipient IDs
	return sentReadlistNotification(client, notification, data.author_name, title, description);
}
