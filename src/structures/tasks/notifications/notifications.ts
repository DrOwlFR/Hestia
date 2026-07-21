import type { ShewenyClient } from "sheweny";

import config from "../../config";

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

// // Interface for notification objects
// interface Notification {
// 	id: number,
// 	failedRecipients?: string[],
// }

// /**
//  * postNotifications: marks notifications as sent in the site API.
//  * Summary: Sends a POST request to update the status of notifications to "sent" in the site database.
//  * @param notifications - An array of notification objects to mark as sent.
//  * @returns - The API response indicating success or failure of the operation.
//  */
// async function postNotifications(notifications: [Notification]): Promise<Response> {
// 	return await fetch(`${config.APILink}/api/discord/notifications/mark-sent`, {
// 		method: "POST",
// 		headers: {
// 			"Authorization": `Bearer ${config.API_KEY}`,
// 			"Content-Type": "application/json",
// 		},
// 		body: JSON.stringify({
// 			"notifications": [notifications],
// 		}),
// 	});
// }

// Interface for notification objects
interface NotificationItem {
	id: number,
	type: string,
	data: Record<string, unknown>,
	avatarUrl?: string | null,
	defaultText: string,
	recipients: string[],
	createdAt: string,
}

// Interface for pagination metadata
interface Pagination {
	currentPage: number;
	perPage: number;
	total: number;
	lastPage: number;
	hasMore: boolean;
}

// Interface for the API response containing notifications and pagination
interface GetNotificationsJson {
	data: NotificationItem[],
	pagination: Pagination,
}

export async function sendNotifications(client: ShewenyClient): Promise<void> {
	const notificationsResponse = await getNotifications();
	if (!notificationsResponse.ok) {
		await client.functions.log("notificationsCron", `<@${config.botAdminsIds[0]}> ${config.emojis.cross} Impossible de récupérer les notifications : ${notificationsResponse.status} ${notificationsResponse.statusText}`);
		return;
	}

	const notificationsJson = (await notificationsResponse.json() as GetNotificationsJson);
	if (!notificationsJson.data) return;
	console.log(notificationsJson);

	// for (const notification of notificationsJson.data) {

	// }
}
