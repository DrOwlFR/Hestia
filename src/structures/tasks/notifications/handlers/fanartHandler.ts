import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { getCurrentSeason } from "../../seasonsSystem";
import { getDiscordIdFromSiteId } from "../services/userService";
import { createNotificationEmbed } from "../utils/embedFunction";
import type { FanartAcceptedNotification, FanartDeclinedNotification, FanartDeletedNotification, FanartRemovedWithContentNotification, FanartSubmittedNotification, NotificationItem } from "../utils/types";
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
 * @param components - Optional action row containing buttons to include in the notification.
 * @returns - A Promise that resolves to an array of failed recipient IDs, indicating which recipients did not receive the notification successfully.
 */
async function sendFanartNotification(client: ShewenyClient, notification: NotificationItem, userName: string, title: string, description: string, components?: ActionRowBuilder<ButtonBuilder>): Promise<string[]> {
	const failedRecipients: string[] = [];

	// Get the current season and its corresponding icon from the configuration
	const currentSeason = getCurrentSeason();
	const icon = config[currentSeason].favicon;

	// Create an embed for the notification using the provided title and description, along with the user's name and avatar URL.
	const embed = createNotificationEmbed({
		author: {
			name: userName === "mod" ? "Jardin des Esperluettes" : userName,
			iconURL: userName === "mod" ? icon : notification.avatarUrl ?? undefined,
		},
		title,
		description,
		timestamp: notification.createdAt,
	});

	// Iterate over each recipient in the notification's recipients array, attempt to send the embed and add any failed recipient IDs to the failedRecipients array (through the handleSendingError function)
	for (const userId of notification.recipients) {
		try {
			const user = await client.users.fetch(userId);
			await user.send({ embeds: [embed], components: components ? [components] : undefined });
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
 * - Determine the type of fanart based on its kind.
 * - Construct the title and description for the notification embed, including the actor's name, chapter title, story title, and links to the relevant pages on the site.
 * - Create a button that links to the collaborators page of the story for the user to review the request.
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

	// Determine the type of fanart based on its kind.
	const fanartType = data.kind === "audio" ? "son" : "image";

	// Construct the title and description for the notification embed, including the actor's name, chapter title, story title, and links to the relevant pages on the site.
	const title = fanartType === "son" ? "🔊 Nouveau son" : "🖼️ Nouveau fanart";
	const description = data.chapter_title ?
		`**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a soumis ${fanartType === "son" ? "un son" : "une image"} «\u00A0**${data.fanart_title}**\u00A0» pour le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».
		${data.comment ? `\nMessage de l'artiste : «\u00A0${data.comment}\u00A0»` : ""}`
		: `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a soumis ${fanartType === "son" ? "un son" : "une image"} «\u00A0**${data.fanart_title}**\u00A0» pour l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».
		${data.comment ? `\nMessage de l'artiste : «\u00A0${data.comment}\u00A0»` : ""}`;

	// Create a button that links to the collaborators page of the story for the user to review the request
	const fanartPageButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setLabel("Accéder à l'onglet des fanarts")
			.setStyle(ButtonStyle.Link)
			.setURL(`${config.APILink}/stories/${data.story_slug}?tab=fanarts`)
			.setEmoji(fanartType === "son" ? "🔊" : "🖼️"),
	);

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description, fanartPageButton);
}

/**
 * handleFanartAccepted: handles notifications for accepted fanart submissions
 * Summary: This function constructs the title and description for the fanart acceptance notification, including the actor's name, chapter title, story title, and links to the relevant pages on the site. It then calls sendFanartNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who accepted the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Determine the type of fanart based on its kind.
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

	// Determine the type of fanart based on its kind.
	const fanartType = data.kind === "audio" ? "son" : "image";

	// Construct the title and description for the notification of the accepted fanart
	const title = fanartType === "son" ? "🔊 Son accepté" : "🖼️ Image acceptée";
	const description = data.chapter_title ?
		`**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a accepté votre ${fanartType} «\u00A0**${data.fanart_title}**\u00A0» pour le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».
		${data.comment ? `\nMessage de l'auteurice : «\u00A0${data.comment}\u00A0»` : ""}`
		: `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a accepté votre ${fanartType} «\u00A0**${data.fanart_title}**\u00A0» pour l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».
		${data.comment ? `\nMessage de l'auteurice : «\u00A0${data.comment}\u00A0»` : ""}`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

/**
 * handleFanartDeclined: handles notifications for declined fanart submissions
 * Summary: This function constructs the title and description for the fanart decline notification, including the actor's name, chapter title, story title, and links to the relevant pages on the site. It then calls sendFanartNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who declined the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Determine the type of fanart based on its kind.
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

	// Determine the type of fanart based on its kind.
	const fanartType = data.kind === "audio" ? "son" : "image";

	// Construct the title and description for the notification of the declined fanart
	const title = fanartType === "son" ? "🔊 Son refusé" : "🖼️ Image refusée";
	const description = data.chapter_title ?
		`**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a refusé votre ${fanartType} «\u00A0**${data.fanart_title}**\u00A0» pour le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».
		${data.comment ? `\nMessage de l'auteurice : «\u00A0${data.comment}\u00A0»` : ""}`
		: `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a refusé votre ${fanartType} «\u00A0**${data.fanart_title}**\u00A0» pour l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».
		${data.comment ? `\nMessage de l'auteurice : «\u00A0${data.comment}\u00A0»` : ""}`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

/**
 * handleFanartDeleted: handles notifications for deleted fanarts
 * Summary: This function constructs the title and description for the fanart deletion notification, including the actor's name, chapter title, story title, and links to the relevant pages on the site. It then calls sendFanartNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who deleted the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification of the deleted fanart.
 * - Call sendFanartNotification to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the fanart deletion details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
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

/**
 * handleFanartDeletedByModeration: handles notifications for fanarts deleted by moderation
 * Summary: This function constructs the title and description for the fanart deletion notification, indicating that the fanart was deleted by moderation. It then calls sendFanartNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who deleted the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Replace the actor_name with "mod" to indicate that the fanart was deleted by moderation.
 * - Determine the type of fanart based on its kind.
 * - Construct the title and description for the notification of the deleted fanart.
 * - Call sendFanartNotification to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the fanart deletion details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleFanartDeletedByModeration(client: ShewenyClient, notification: FanartDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Replace the actor_name with "mod" to indicate that the fanart was deleted by moderation
	data.actor_name = "mod";

	// Determine the type of fanart based on its kind.
	const fanartType = data.kind === "audio" ? "son" : "image";

	// Construct the title and description for the notification of the deleted fanart
	const title = fanartType === "son" ? "🔊 Son supprimé par la modération" : "🖼️ Image supprimée par la modération";
	const description = data.chapter_title ?
		`Votre ${fanartType} «\u00A0**${data.fanart_title}**\u00A0» pour le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0» a été supprimé${fanartType === "son" ? "" : "e"} par la modération.`
		: `Votre ${fanartType} «\u00A0**${data.fanart_title}**\u00A0» pour l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0» a été supprimé${fanartType === "son" ? "" : "e"} par la modération.`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

/**
 * handleFanartAudioReplaced: handles notifications for audio fanarts that have been replaced.
 * Summary: This function constructs the title and description for the fanart replacement notification, indicating that the fanart has been replaced with audio. It then calls sendFanartNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who replaced the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification of the replaced fanart.
 * - Call sendFanartNotification to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the fanart replacement details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleFanartAudioReplaced(client: ShewenyClient, notification: FanartDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who deleted the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification of the deleted fanart
	const title = "🔊 Son remplacé";
	const description = `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a remplacé votre son «\u00A0**${data.fanart_title}**\u00A0» pour le chapitre «\u00A0**[${data.chapter_title}](${config.APILink}/stories/${data.story_slug}/chapters/${data.chapter_slug})**\u00A0» de l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

/**
 * handleFanartRemovedWithContent: handles notifications for fanarts that have been removed with their content.
 * Summary: This function constructs the title and description for the fanart removal notification, indicating that the fanart has been removed with its content. It then calls sendFanartNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who removed the fanart using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Determine the type of fanart based on its kind.
 * - Construct the title and description for the notification of the removed fanart.
 * - Call sendFanartNotification to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the fanart removal details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleFanartRemovedWithContent(client: ShewenyClient, notification: FanartRemovedWithContentNotification): Promise<string[]> {
	const { data } = notification;

	// Determine the type of fanart based on its kind.
	const fanartType = data.kind === "audio" ? "son" : "image";

	// Construct the title and description for the notification of the deleted fanart
	const title = fanartType === "son" ? "🔊 Son supprimé avec l'histoire/le chapitre" : "🖼️ Image supprimée avec l'histoire/le chapitre";
	const description = `Votre ${fanartType} «\u00A0**${data.fanart_title}**\u00A0» a été supprimé${fanartType === "son" ? "" : "e"} avec son chapitre ou son histoire.`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

/**
 * handleFanartRoleRequested: handles notifications for requests to obtain a fanart role.
 * Summary: This function constructs the title and description for the fanart role request notification, indicating that a user has requested the role. It then calls sendFanartNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who requested the fanart role using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification of the requested fanart role.
 * - Create a button that links to the collaborators page of the story for the user to review the request.
 * - Call sendFanartNotification to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the fanart role request details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleFanartRoleRequested(client: ShewenyClient, notification: FanartDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who requested the fanart role using their site ID from the notification data and construct a mention string if the Discord ID is found.
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification of the requested fanart role
	const title = "🖼️ Demande de rôle de fanartiste";
	const description = `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} a demandé le rôle de **fanartiste** sur l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Create a button that links to the collaborators page of the story for the user to review the request
	const collaborationButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setLabel("Accéder à la page des collaborateurs")
			.setStyle(ButtonStyle.Link)
			.setURL(`${config.APILink}/stories/${data.story_slug}/collaborators`)
			.setEmoji("🤝"),
	);

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description, collaborationButton);
}

/**
 * handleFanartRoleGiven: handles notifications for fanarts where the role has been given.
 * Summary: This function constructs the title and description for the fanart role given notification, indicating that a user has been given the role. It then calls sendFanartNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who gave the fanart role using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification of the given fanart role.
 * - Call sendFanartNotification to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the fanart role given details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
export async function handleFanartRoleGiven(client: ShewenyClient, notification: FanartDeletedNotification): Promise<string[]> {
	const { data } = notification;

	// Get the Discord ID of the user who gave the fanart role using their site ID from the notification data and construct a mention string if the Discord ID is found.
	const discordId = await getDiscordIdFromSiteId(notification.sourceUserId);
	const mention = discordId ? ` (<@${discordId}>)` : "";

	// Construct the title and description for the notification of the given fanart role
	const title = "🖼️ Rôle de fanartiste attribué";
	const description = `**[${data.actor_name}](${config.APILink}/profile/${data.actor_slug})**${mention} vous a attribué le rôle de **fanartiste** sur l'histoire «\u00A0**[${data.story_title}](${config.APILink}/stories/${data.story_slug})**\u00A0».`;

	// Call sendFanartNotification to send the notification to the recipients
	return await sendFanartNotification(client, notification, data.actor_name, title, description);
}

/**
 * handleFanartRoleDeclined: handles notifications for fanarts where the role has been declined.
 * Summary: This function constructs the title and description for the fanart role declined notification, indicating that a user's request for the role has been declined. It then calls sendFanartNotification to send the notification to the recipients.
 * Steps:
 * - Get the Discord ID of the user who declined the fanart role using their site ID from the notification data and construct a mention string if the Discord ID is found.
 * - Construct the title and description for the notification of the declined fanart role.
 * - Call sendFanartNotification to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The notification item containing the fanart role declined details.
 * @returns - A promise resolving to an array of failed recipient IDs.
 */
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
