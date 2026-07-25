import type { ShewenyClient } from "sheweny";

import config from "../../config";
import { sendLog } from "../../utils/functions";
import { dispatchNotifications } from "./notificationDispatch";
import type { NotificationsJson } from "./utils/types";

/**
 * sendNotifications: retrieves pending notifications from the site API, dispatches them to the appropriate handlers, and marks them as sent.
 * Summary: This function fetches pending notifications, processes each notification by dispatching it to the appropriate handler, and then marks the notifications as sent in the site API. If fetching notifications fails, it logs an error message.
 * Steps:
 * - Retrieve pending notifications from the site API and check if the response is successful. If not, log an error message and return early.
 * - Parse the response as JSON and check if there are any notifications to process. If there are no notifications, return early.
 * - Initialize an array to hold the results of processing each notification, including any failed recipients.
 * - Iterate over each notification in the retrieved notifications, dispatch it to the appropriate handler, and collect any failed recipients.
 * - After processing all notifications, mark them as sent in the site API by calling postNotifications with the results.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @returns - A promise that resolves when all notifications have been processed.
 */
export async function sendNotifications(client: ShewenyClient): Promise<void> {
	// Retrieve pending notifications from the site API and check if the response is successful. If not, log an error message and return early.
	const notificationsResponse = await getNotifications();
	if (!notificationsResponse.ok) {
		await sendLog(client, "notificationsCron", `<@${config.botAdminsIds[0]}> ${config.emojis.cross} Impossible de récupérer les notifications : ${notificationsResponse.status} ${notificationsResponse.statusText}`);
		return;
	}

	// Parse the response as JSON and check if there are any notifications to process. If there are no notifications, return early.
	const notificationsJson = (await notificationsResponse.json() as NotificationsJson);
	if (!notificationsJson.data.length) return;

	// Initialize an array to hold the results of processing each notification, including any failed recipients.
	const results = [];

	// Iterate over each notification in the retrieved notifications, dispatch it to the appropriate handler, and collect any failed recipients.
	for (const notification of notificationsJson.data) {
		const failedRecipients = await dispatchNotifications(client, notification);

		results.push({
			id: notification.id,
			...(failedRecipients.length > 0 && { failedRecipients }),
		});
	}

	// After processing all notifications, mark them as sent in the site API by calling postNotifications with the results.
	await postNotifications(results);
}

/**
 * getNotifications: retrieves pending notifications from the site API.
 * Summary: Sends a GET request to fetch pending notifications with pagination support.
 * @param page - The page number to retrieve (default is 1).
 * @param perPage - The number of notifications per page (default is 100).
 * @returns - The API response containing notifications or error status.
 */
async function getNotifications(page: number = 1, perPage: number = 100): Promise<Response> {
	return await fetch(`${config.APILink}/api/discord/notifications/pending?page=${page}&perPage=${perPage}`, {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${config.API_KEY}`,
			"Content-Type": "application/json",
		},
	});
}

// Interface for notification objects
interface NotificationPost {
	id: number,
	failedRecipients?: string[],
}

/**
 * postNotifications: marks notifications as sent in the site API.
 * Summary: Sends a POST request to update the status of notifications to "sent" in the site database.
 * @param notifications - An array of notification objects to mark as sent.
 * @returns - The API response indicating success or failure of the operation.
 */
async function postNotifications(notifications: NotificationPost[]): Promise<Response> {
	return await fetch(`${config.APILink}/api/discord/notifications/mark-sent`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${config.API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			"notifications": notifications,
		}),
	});
}
