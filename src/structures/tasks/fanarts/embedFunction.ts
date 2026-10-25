import { EmbedBuilder } from "discord.js";

import { sanitizeImageUrl } from "../notifications/utils/formatters";
import { pickRandomSeasonColor } from "../seasonsSystem";

// Options for creating a fanart embed
interface CreateFanartEmbedOptions {
	color?: number;
	author?: {
		name?: string;
		iconURL?: string;
	};
	description: string;
	imageUrl: string;
	timestamp: string | Date;
}

// Creates a Discord embed for a fanart with the specified options
export function createFanartEmbed(options: CreateFanartEmbedOptions): EmbedBuilder {

	// Determine the color for the embed, using the provided color or picking a random seasonal color
	const color = options.color ?? pickRandomSeasonColor();

	// Create a new EmbedBuilder instance and set its properties based on the provided options
	const embed = new EmbedBuilder()
		.setColor(color)
		.setDescription(options.description)
		.setImage(options.imageUrl)
		.setTimestamp(new Date(options.timestamp));

	// Set the author of the embed if an author name is provided and not empty and sanitize the author's icon URL if provided
	if (options.author?.name && options.author.name.trim() !== "") {
		embed.setAuthor({
			name: options.author.name,
			iconURL: sanitizeImageUrl(options.author.iconURL),
		});
	}

	return embed;
}
