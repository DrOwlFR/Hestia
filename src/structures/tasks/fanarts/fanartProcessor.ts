import { ChannelType } from "discord.js";
import type { ShewenyClient } from "sheweny";

import config from "../../config";
import { sendLog } from "../../utils/functions";
import { createFanartEmbed } from "./embedFunction";

// Interface for fanart data returned by the API
interface FanartData {
	id: number;
	title: string;
	artistName: string;
	storyTitle: string;
	storyUrl: string;
	chapterTitle: string | null;
	imageUrl: string;
}

// Interface for pagination information returned by the API
interface Pagination {
	currentPage: number;
	perPage: number;
	total: number;
	lastPage: number;
	hasMore: boolean;
}

// Interface for the API response containing fanart data and pagination information
interface FanartsJson {
	data: FanartData[],
	pagination: Pagination,
}

export async function sendFanarts(client: ShewenyClient): Promise<void> {
	const fanartsResponse = await getFanarts();
	if (!fanartsResponse.ok) {
		await sendLog(client, "fanartsCron", `<@${config.botAdminsIds[0]}> ${config.emojis.cross} Impossible de récupérer les fanarts : ${fanartsResponse.status} ${fanartsResponse.statusText}`);
		return;
	}

	const fanartsJson = (await fanartsResponse.json() as FanartsJson);
	if (!fanartsJson.data.length) return;

	const channel = await client.channels.fetch(config.privateCollectionChannelId);
	if (!channel || channel.type !== ChannelType.GuildText) {
		await sendLog(client, "fanartsCron", `<@${config.botAdminsIds[0]}> ${config.emojis.cross} Impossible de récupérer le channel des fanarts : ${config.fanartsCronChannelId}`);
		return;
	}

	const successfulIds = [];

	for (const fanart of fanartsJson.data) {
		console.log(fanart);
		try {
			const description = fanart.chapterTitle ?
				`## «\u00A0${fanart.title}\u00A0»\n\nFanart illustrant le chapitre «\u00A0${fanart.chapterTitle}\u00A0» de l'histoire «\u00A0[${fanart.storyTitle}](${fanart.storyUrl})\u00A0».` :
				`## «\u00A0${fanart.title}\u00A0»\n\nFanart illustrant l'histoire «\u00A0[${fanart.storyTitle}](${fanart.storyUrl})\u00A0».`;
			const embed = createFanartEmbed({
				author: {
					name: fanart.artistName,
					iconURL: client.user?.displayAvatarURL(),
				},
				description,
				imageUrl: fanart.imageUrl,
				timestamp: new Date(),
			});
			await channel.send({ embeds: [embed] });

			successfulIds.push({
				id: fanart.id,
			});
		} catch (error) {
			await sendLog(client, "fanartsCron", `${config.emojis.cross} Echec de l'envoi du fanart \`${fanart.id}\` :\n\`\`\`js\n${error}\n\`\`\``);
		}
	}

	// await postFanarts(successfulIds);
}

/**
 * getFanarts: retrieves pending fanarts from the site API.
 * Summary: Sends a GET request to fetch pending fanarts with pagination support.
 * @param page - The page number to retrieve (default is 1).
 * @param perPage - The number of fanarts per page (default is 100).
 * @returns - The API response containing fanarts or error status.
 */
async function getFanarts(page: number = 1, perPage: number = 100): Promise<Response> {
	return await fetch(`${config.APILink}/api/discord/fanarts/pending?page=${page}&perPage=${perPage}`, {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${config.API_KEY}`,
			"Content-Type": "application/json",
		},
	});
}

// // Interface for fanart post data to mark as sent
// interface FanartPost {
// 	id: number,
// }

// /**
//  * postFanarts: marks fanarts as sent in the site API.
//  * Summary: Sends a POST request to mark the specified fanarts as sent in the site API.
//  * @param fanarts - An array of fanart post objects to mark as sent.
//  * @returns - The API response indicating success or failure of the operation.
//  */
// async function postFanarts(fanarts: FanartPost[]): Promise<Response> {
// 	return await fetch(`${config.APILink}/api/discord/fanarts/mark-sent`, {
// 		method: "POST",
// 		headers: {
// 			"Authorization": `Bearer ${config.API_KEY}`,
// 			"Content-Type": "application/json",
// 		},
// 		body: JSON.stringify({
// 			"ids": fanarts,
// 		}),
// 	});
// }
