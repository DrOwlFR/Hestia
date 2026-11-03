import { AttachmentBuilder, ChannelType } from "discord.js";
import type { ShewenyClient } from "sheweny";

import config from "../../config";
import { sendLog } from "../../utils/functions";
import { createFanartEmbed } from "./embedFunction";

// Interface for fanart data returned by the API
interface FanartData {
	id: number;
	kind: string;
	title: string;
	artistName: string;
	artist: {
		id: number;
		slug: string;
		avatarUrl: string;
	},
	authors: {
		id: number;
		name: string;
		slug: string;
	}[];
	storyTitle: string;
	storySlug: string;
	storyUrl: string;
	approvedAt: string;
	chapterTitle?: string;
	chapterSlug?: string;
	description?: string;
	imageUrl?: string;
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

/**
 * sendFanarts: retrieves pending fanarts from the site API, processes them, and sends them to a specified Discord channel.
 * Summary: This function fetches pending fanarts, downloads the images, creates embeds for each fanart, and sends them to a designated Discord channel. It also logs any errors encountered during the process.
 * Steps:
 * - Retrieve pending fanarts from the site API and check if the response is successful. If not, log an error message and return early.
 * - Parse the response as JSON and check if there are any fanarts to process. If there are no fanarts, return early.
 * - Fetch the specified Discord channel where fanarts will be sent. If the channel is not found or is not a text channel, log an error message and return early.
 * - Process each fanart, download the image if available, create an embed, and send it to the channel.
 * @param client - The ShewenyClient instance used to fetch users and send messages.
 * @returns - A promise that resolves when all fanarts have been processed.
 */
export async function sendFanarts(client: ShewenyClient): Promise<void> {
	// Retrieve pending fanarts from the site API and check if the response is successful. If not, log an error message and return early.
	const fanartsResponse = await getFanarts();
	if (!fanartsResponse.ok) {
		await sendLog(client, "fanartsCron", `<@${config.botAdminsIds[0]}> ${config.emojis.cross} Impossible de récupérer les fanarts : ${fanartsResponse.status} ${fanartsResponse.statusText}`);
		return;
	}

	// Parse the response as JSON and check if there are any fanarts to process. If there are no fanarts, return early.
	const fanartsJson = (await fanartsResponse.json() as FanartsJson);
	if (!fanartsJson.data.length) return;

	// Fetch the specified Discord channel where fanarts will be sent. If the channel is not found or is not a text channel, log an error message and return early.
	const channel = await client.channels.fetch(config.privateCollectionChannelId);
	if (!channel || channel.type !== ChannelType.GuildText) {
		await sendLog(client, "fanartsCron", `<@${config.botAdminsIds[0]}> ${config.emojis.cross} Impossible de récupérer le channel des fanarts : ${config.fanartsCronChannelId}`);
		return;
	}

	// Initialize an array to hold the IDs of successfully sent fanarts
	const successfulIds = [];

	// Process each fanart in the retrieved data, download the image if available, create an embed, and send it to the specified channel. Log any errors encountered during the process.
	for (const fanart of fanartsJson.data) {
		try {
			let attachment = null;
			let fileName = null;

			// If the fanart has an image URL (so is not an audio fanart), download the image and create an attachment for it
			if (fanart.imageUrl) {
				// Download the fanart image from the provided URL
				const imageReponse = await fetch(fanart.imageUrl);
				if (!imageReponse.ok) {
					await sendLog(client, "fanartsCron", `${config.emojis.cross} Echec du téléchargement de l'image du fanart \`${fanart.id}\` : ${imageReponse.status} ${imageReponse.statusText}`);
					continue;
				}

				// Convert the downloaded image to a buffer for attachment
				const arrayBuffer = await imageReponse.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);

				// Create an attachment for the fanart image with a unique filename
				fileName = `fanart-${fanart.id}.png`;
				attachment = new AttachmentBuilder(buffer, { name: fileName });
			}

			// Determine the type of fanart based on its kind.
			const fanartType = fanart.kind === "audio" ? "son" : "image";

			// Format the authors' names and links for the embed description, handling multiple authors with proper conjunctions.
			const formatter = new Intl.ListFormat("fr", { style: "long", type: "conjunction" });
			const formattedAuthors = formatter.format(fanart.authors.map(author => `**[${author.name}](${config.APILink}/profile/${author.slug})**`));

			const prefix = fanart.authors.length > 1 ? "co-écrite par" : "écrite par";
			const authorsText = `${prefix} ${formattedAuthors}`;

			// Construct the description for the embed based on whether the fanart is an audio or image type, and whether it is associated with a chapter or just a story. Include the fanart's title, description, chapter title, story title, and authors in the description.
			const description = fanartType === "son" ?
				`### 🔊 Nouveau fanart audio\n\n${fanart.description ? `${fanart.description}\n\n` : ""}-# Son illustrant le chapitre «\u00A0**[${fanart.chapterTitle}](${config.APILink}/stories/${fanart.storySlug}/chapters/${fanart.chapterSlug})**\u00A0» de l'histoire «\u00A0**[${fanart.storyTitle}](${config.APILink}/stories/${fanart.storySlug})**\u00A0», ${authorsText}.`
				: fanart.chapterTitle ?
					`## «\u00A0${fanart.title}\u00A0»\n\n${fanart.description ? `${fanart.description}\n\n` : ""}-# Image illustrant le chapitre «\u00A0**[${fanart.chapterTitle}](${config.APILink}/stories/${fanart.storySlug}/chapters/${fanart.chapterSlug})**\u00A0» de l'histoire «\u00A0**[${fanart.storyTitle}](${config.APILink}/stories/${fanart.storySlug})**\u00A0», ${authorsText}.`
					: `## «\u00A0${fanart.title}\u00A0»\n\n${fanart.description ? `${fanart.description}\n\n` : ""}-# Image illustrant l'histoire «\u00A0**[${fanart.storyTitle}](${config.APILink}/stories/${fanart.storySlug})**\u00A0», ${authorsText}.`;

			// Create an embed for the fanart using the specified options, including author information, description, filename, and timestamp
			const embed = createFanartEmbed({
				author: {
					name: fanart.artistName,
					iconURL: fanart.artist.avatarUrl,
				},
				description,
				fileName,
				timestamp: fanart.approvedAt,
			});

			// Construct the message payload to be sent to the channel, including the embed and any attachment if available
			const messagePayload = {
				embeds: [embed],
				files: attachment ? [attachment] : undefined,
			};

			// Send the embed and attachment to the specified channel
			await channel.send(messagePayload);

			// Add the fanart ID to the list of successfully sent fanarts
			successfulIds.push(fanart.id);
		} catch (error) {
			await sendLog(client, "fanartsCron", `${config.emojis.cross} Echec de l'envoi du fanart \`${fanart.id}\` :\n\`\`\`js\n${error}\n\`\`\``);
		}
	}

	// Mark the successfully sent fanarts as sent in the site API
	await postFanarts(successfulIds);
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

/**
 * postFanarts: marks fanarts as sent in the site API.
 * Summary: Sends a POST request to mark the specified fanarts as sent in the site API.
 * @param fanarts - An array of fanart post objects to mark as sent.
 * @returns - The API response indicating success or failure of the operation.
 */
async function postFanarts(fanarts: number[]): Promise<Response> {
	return await fetch(`${config.APILink}/api/discord/fanarts/mark-sent`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${config.API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			"ids": fanarts,
		}),
	});
}
