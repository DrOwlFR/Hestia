import { ChannelType } from "discord.js";
import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { getDiscordIdFromSiteId } from "../services/userService";
import { createNotificationEmbed } from "../utils/embedFunction";
import type { FanartAcceptedNotification, FanartDeclinedNotification, FanartDeletedNotification, FanartSubmittedNotification, NotificationItem } from "../utils/types";
import { handleSendingError } from "./errorHandler";

/**
 * sendFanartNotification: sends a notification to the recipients of a fanart-related event (e.g., submission, acceptance, decline, deletion, etc.).
 * Summary: This function creates an embed for the notification using the provided title and description, along with the user's name and avatar URL. It then iterates over each recipient in the notification's recipients array, attempts to send the embed, and adds any failed recipient IDs to the failedRecipients array (through the handleSendingError function). Finally, it returns the array of failed recipient IDs.
 * Steps:
 * - Create an empty array called failedRecipients to store the IDs of recipients who failed to receive the notification.
 * - Create an embed for the notification using the provided title and description, along with the user's name and avatar URL.
 * - Iterate over each recipient in the notification's recipients array, attempt to send the embed, and add any failed recipient IDs to the failedRecipients array (through the handleSendingError function).
 * - Return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing information about the fanart event, including the recipients and avatar URL.
 * @param userName - The name of the user associated with the fanart event, which will be displayed in the notification embed.
 * @param title - The title of the notification embed.
 * @param description - The description of the notification embed, which includes details about the collaboration event.
 * @returns - A Promise that resolves to an array of failed recipient IDs, indicating which recipients did not receive the notification successfully.
 */
async function sendFanartNotification(client: ShewenyClient, notification: NotificationItem, userName: string, title: string, description: string): Promise<string[]> {
	const failedRecipients: string[] = [];

	// Create an embed for the notification using the provided title and description, along with the user's name and avatar URL.
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
			// const user = await client.users.fetch(userId);
			const user = await client.channels.fetch("1426615318079344660");
			if (!user || user.type !== ChannelType.GuildText) return ["erreur"];
			await user.send({ embeds: [embed] });
		} catch (error) {
			await handleSendingError(client, error, userId, failedRecipients);
		}
	}

	// Return the array of failed recipient IDs
	return failedRecipients;
}

/**
 * handleFanartSubmitted: handles notifications for new fanart submissions
 * Summary: This function constructs the title and description for the fanart submission notification, including the actor's name, chapter title, story title, and links to the relevant pages on the site. It then calls sendFanartNotification to send the notification to the recipients.
 * Steps:
 * - Fetch the Discord ID of the user who submitted the fanart using their site ID from the notification data.
 * - Construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification embed, including the actor's name, chapter title, story title, and links to the relevant pages on the site.
 * - Call sendFanartNotification to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the fanart submission details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleFanartSubmitted(client: ShewenyClient, notification: FanartSubmittedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who submitted the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification embed, including the actor's name, chapter title, story title, and links to the relevant pages on the site.
	const title = "🖼️ Nouveau fanart";
	const description = `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a soumis un nouveau fanart «\u00A0**${data.fanart_title}**\u00A0» pour le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

/**
 * handleFanartAccepted: handles notifications for accepted fanart submissions
 * Summary: This function constructs the title and description for the fanart acceptance notification, including the actor's name, chapter title, story title, and links to the relevant pages on the site. It then calls sendFanartNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who accepted the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification of the accepted fanart
 * - Call sendFanartNotification to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the fanart acceptance details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleFanartAccepted(client: ShewenyClient, notification: FanartAcceptedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who accepted the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification of the accepted fanart
	const title = "🖼️ Fanart accepté";
	const description = `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a accepté votre fanart «\u00A0**${data.fanart_title}**\u00A0» pour le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

/**
 * handleFanartDeclined: handles notifications for declined fanart submissions
 * Summary: This function constructs the title and description for the fanart decline notification, including the actor's name, chapter title, story title, and links to the relevant pages on the site. It then calls sendFanartNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who declined the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification of the declined fanart
 * - Call sendFanartNotification to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the fanart decline details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleFanartDeclined(client: ShewenyClient, notification: FanartDeclinedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who declined the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification of the declined fanart
	const title = "🖼️ Fanart refusé";
	const description = `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a refusé votre fanart «\u00A0**${data.fanart_title}**\u00A0» pour le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

export async function handleFanartDeleted(client: ShewenyClient, notification: FanartDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who deleted the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification of the deleted fanart
	const title = "🖼️ Fanart supprimé";
	const description = `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a supprimé votre fanart «\u00A0**${data.fanart_title}**\u00A0» pour le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

export async function handleFanartDeletedByModeration(client: ShewenyClient, notification: FanartDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the notification of the deleted fanart
	const title = "🖼️ Fanart supprimé par la modération";
	const description = `Votre fanart «\u00A0**${data.fanart_title}**\u00A0» pour le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0» a été supprimé par la modération.`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

export async function handleFanartAudioReplaced(client: ShewenyClient, notification: FanartDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who deleted the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification of the deleted fanart
	const title = "🖼️ Fanart audio remplacé";
	const description = `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a remplacé votre fanart audio «\u00A0**${data.fanart_title}**\u00A0» pour le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

export async function handleFanartRemovedWithContent(client: ShewenyClient, notification: FanartDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who deleted the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification of the deleted fanart
	const title = "🖼️ Fanart supprimé avec l'histoire/le chapitre";
	const description = `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a supprimé le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0», votre fanart «\u00A0**${data.fanart_title}**\u00A0» a été supprimé en conséquence.`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

export async function handleFanartRoleRequested(client: ShewenyClient, notification: FanartDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who requested the fanart role using their site ID from the notification data and construct a mention string if the Discord ID is found.
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification of the requested fanart role
	const title = "🖼️ Demande de rôle de fanartiste";
	const description = `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a demandé le rôle de **fanartiste** sur l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

export async function handleFanartRoleGiven(client: ShewenyClient, notification: FanartDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who gave the fanart role using their site ID from the notification data and construct a mention string if the Discord ID is found.
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification of the given fanart role
	const title = "🖼️ Nouveau rôle de fanartiste attribué";
	const description = `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} vous a attribué le rôle de **fanartiste** sur l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

export async function handleFanartRoleDeclined(client: ShewenyClient, notification: FanartDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who declined the fanart role using their site ID from the notification data and construct a mention string if the Discord ID is found.
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification of the declined fanart role
	const title = "🖼️ Rôle de fanartiste refusé";
	const description = `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a refusé votre demande de rôle de **fanartiste** sur l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}
