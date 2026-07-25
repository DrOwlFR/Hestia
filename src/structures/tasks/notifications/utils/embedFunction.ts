import { EmbedBuilder } from "discord.js";

import { pickRandomSeasonColor } from "../../seasonsSystem";
import { sanitizeImageUrl } from "./formatters";

// Options for creating a notification embed
interface CreateNotificationEmbedOptions {
	color?: number;
	author?: {
		name?: string;
		iconURL?: string;
	};
	title?: string;
	description: string;
	timestamp: string | Date;
}

// Creates a Discord embed for a notification with the specified options
export function createNotificationEmbed(options: CreateNotificationEmbedOptions): EmbedBuilder {

	// Determine the color for the embed, using the provided color or picking a random seasonal color
	const color = options.color ?? pickRandomSeasonColor();

	// Create a new EmbedBuilder instance and set its properties based on the provided options
	const embed = new EmbedBuilder()
		.setColor(color)
		.setDescription(options.description)
		.setTimestamp(new Date(options.timestamp));

	if (options.title) {
		embed.setTitle(options.title);
	}

	// Set the author of the embed if an author name is provided and not empty and sanitize the author's icon URL if provided
	if (options.author?.name && options.author.name.trim() !== "") {
		embed.setAuthor({
			name: options.author.name,
			iconURL: sanitizeImageUrl(options.author.iconURL),
		});
	}

	return embed;
}
