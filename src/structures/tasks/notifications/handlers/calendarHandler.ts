import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { getCurrentSeason } from "../../seasonsSystem";
import { createNotificationEmbed } from "../utils/embedFunction";
import type { CalendarQuoteContestEntryRemovedNotification, CalendarQuoteContestSubmissionsOpenNotification, NotificationItem } from "../utils/types";
import { handleSendingError } from "./errorHandler";

/**
 * sendCalendarNotification: sends a calendar notification to the recipients.
 * Summary: This function constructs a notification embed with the provided title and description, and sends it to each recipient in the notification. If sending fails for any recipient, their ID is added to the failedRecipients array.
 * Steps:
 * - Get the current season and its corresponding icon from the configuration.
 * - Create an embed using the createNotificationEmbed function with the provided title and description.
 * - Iterate over each recipient in the notification's recipients array, attempt to send the embed and add any failed recipient IDs to the failedRecipients array (through the handleSendingError function).
 * - Return the array of failed recipient IDs.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The NotificationItem object containing details about the calendar event and recipients.
 * @param title - The title of the notification embed.
 * @param description - The description of the notification embed.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
async function sendCalendarNotification(client: ShewenyClient, notification: NotificationItem, title: string, description: string): Promise<string[]> {
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
 * handleCalendarQuoteContestEntryRemoved: handles the notification for a contest entry that has been removed.
 * Summary: This function constructs the title and description for the notification embed, informing the user that their contest entry has been removed. It then calls sendCalendarNotification to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Construct the title and description for the notification embed, informing the user that their contest entry has been removed.
 * - Call sendCalendarNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The CalendarQuoteContestEntryRemovedNotification object containing details about the contest entry removal event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleCalendarQuoteContestEntryRemoved(client: ShewenyClient, notification: CalendarQuoteContestEntryRemovedNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the notification embed, informing the user that their contest entry has been removed.
	const title = "🪶 Soumission retirée du concours de citations";
	const description = `Votre soumission dans la catégorie «\u00A0**${data.category_title}**\u00A0» du concours de citations «\u00A0**[${data.activity_name}](${config.APILink}/activities/${data.activity_slug})**\u00A0» a été retirée par la modération.`;

	// Call sendCalendarNotification with the constructed title and description to send the notification to the recipients
	return await sendCalendarNotification(client, notification, title, description);
}

/**
 * handleCalendarQuoteContestSubmissionsOpen: handles the notification for when contest submissions are open.
 * Summary: This function constructs the title and description for the notification embed, informing the user that contest submissions are now open. It then calls sendCalendarNotification to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Construct the title and description for the notification embed, informing the user that contest submissions are now open.
 * - Call sendCalendarNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The CalendarQuoteContestSubmissionsOpenNotification object containing details about the contest submissions opening event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleCalendarQuoteContestSubmissionsOpen(client: ShewenyClient, notification: CalendarQuoteContestSubmissionsOpenNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the notification embed, informing the user that contest submissions are now open.
	const title = "🪶 Ouverture des soumissions du concours de citations";
	const description = `Les soumissions pour le concours de citations «\u00A0**[${data.activity_name}](${config.APILink}/activities/${data.activity_slug})**\u00A0» sont maintenant ouvertes ! Participez dès maintenant et partagez vos meilleures citations !`;

	// Call sendCalendarNotification with the constructed title and description to send the notification to the recipients
	return await sendCalendarNotification(client, notification, title, description);
}

/**
 * handleCalendarQuoteContestSubmissionsClosing: handles the notification for when contest submissions are closing.
 * Summary: This function constructs the title and description for the notification embed, informing the user that contest submissions are now closing. It then calls sendCalendarNotification to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Construct the title and description for the notification embed, informing the user that contest submissions are now closing.
 * - Call sendCalendarNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The CalendarQuoteContestSubmissionsOpenNotification object containing details about the contest submissions closing event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleCalendarQuoteContestSubmissionsClosing(client: ShewenyClient, notification: CalendarQuoteContestSubmissionsOpenNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the notification embed, informing the user that contest submissions are now closing.
	const title = "🪶 Clôture des soumissions du concours de citations";
	const description = `Les soumissions pour le concours de citations «\u00A0**[${data.activity_name}](${config.APILink}/activities/${data.activity_slug})**\u00A0» se terminent bientôt ! Ne manquez pas votre chance de participer !`;

	// Call sendCalendarNotification with the constructed title and description to send the notification to the recipients
	return await sendCalendarNotification(client, notification, title, description);
}

/**
 * handleCalendarQuoteContestVotesOpen: handles the notification for when contest votes are open.
 * Summary: This function constructs the title and description for the notification embed, informing the user that contest votes are now open. It then calls sendCalendarNotification to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Construct the title and description for the notification embed, informing the user that contest votes are now open.
 * - Call sendCalendarNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The CalendarQuoteContestSubmissionsOpenNotification object containing details about the contest votes opening event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleCalendarQuoteContestVotesOpen(client: ShewenyClient, notification: CalendarQuoteContestSubmissionsOpenNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the notification embed, informing the user that contest votes are now open.
	const title = "🪶 Ouverture des votes du concours de citations";
	const description = `Les votes pour le concours de citations «\u00A0**[${data.activity_name}](${config.APILink}/activities/${data.activity_slug})**\u00A0» sont maintenant ouverts ! Votez pour vos citations préférées dès maintenant !`;

	// Call sendCalendarNotification with the constructed title and description to send the notification to the recipients
	return await sendCalendarNotification(client, notification, title, description);
}

/**
 * handleCalendarQuoteContestVotesClosing: handles the notification for when contest votes are closing.
 * Summary: This function constructs the title and description for the notification embed, informing the user that contest votes are now closing. It then calls sendCalendarNotification to send the notification to the recipients and returns the array of failed recipient IDs.
 * Steps:
 * - Construct the title and description for the notification embed, informing the user that contest votes are now closing.
 * - Call sendCalendarNotification with the constructed title and description to send the notification to the recipients.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @param notification - The CalendarQuoteContestSubmissionsOpenNotification object containing details about the contest votes closing event and recipients.
 * @returns - A promise that resolves to an array of user IDs for whom the notification failed to send.
 */
export async function handleCalendarQuoteContestVotesClosing(client: ShewenyClient, notification: CalendarQuoteContestSubmissionsOpenNotification): Promise<string[]> {
	const { data } = notification;

	// Construct the title and description for the notification embed, informing the user that contest votes are now closing.
	const title = "🪶 Clôture des votes du concours de citations";
	const description = `Les votes pour le concours de citations «\u00A0**[${data.activity_name}](${config.APILink}/activities/${data.activity_slug})**\u00A0» se terminent bientôt ! Ne manquez pas votre chance de voter pour vos citations préférées !`;

	// Call sendCalendarNotification with the constructed title and description to send the notification to the recipients
	return await sendCalendarNotification(client, notification, title, description);
}
