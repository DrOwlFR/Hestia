import { ChannelType } from "discord.js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ShewenyClient } from "sheweny";

import config from "../config";
import { getGardenGuild, sendLog } from "../utils/functions";
import { getRulesMessages } from "../utils/rulesMessages";

export type Season = "spring" | "summer" | "autumn" | "winter";

const seasonStartDates: Record<Season, { month: number; day: number }> = {
	spring: { month: 3, day: 20 },
	summer: { month: 6, day: 21 },
	autumn: { month: 9, day: 23 },
	winter: { month: 12, day: 21 },
};

/**
 * getSeasonStartingToday: checks if the given date is the start of a new season.
 * Summary: Compares the date with season start dates to see if a season begins today.
 * @param date - The date to check, defaults to current date.
 * @returns The season starting today, or null if none.
 */
export function getSeasonStartingToday(date = new Date()): Season | null {
	const month = date.getMonth() + 1;
	const day = date.getDate();

	for (const [season, start] of Object.entries(seasonStartDates)) {
		if (start.month === month && start.day === day) {
			return season as Season;
		}
	}

	return null;
}

/**
 * getCurrentSeason: determines the current season based on the date.
 * Summary: Calculates which season is active for the given date by comparing with start dates.
 * @param date - The date to check, defaults to current date.
 * @returns The current season.
 */
export function getCurrentSeason(date = new Date()): Season {
	const y = date.getFullYear();

	// Initializing seasons starting dates
	const seasons: { season: Season; date: Date }[] = [
		{ season: "spring", date: new Date(y, 2, 20) },
		{ season: "summer", date: new Date(y, 5, 21) },
		{ season: "autumn", date: new Date(y, 8, 23) },
		{ season: "winter", date: new Date(y, 11, 21) },
	];

	// If before the 20th of march → winter of last year
	if (date < seasons[0].date) return "winter";

	for (let i = seasons.length - 1; i >= 0; i--) {
		if (date >= seasons[i].date) {
			return seasons[i].season;
		}
	}

	// fallback in case it doesn't find any season (impossible, but still)
	return "winter";

}

/**
 * updateRulesMessages: updates the rules messages with seasonal components.
 * Summary: Fetches bot messages in the rules channel and edits them with updated seasonal rule components.
 * Steps:
 * - Fetch bot messages in the channel, ordered from oldest to newest
 * - Get the current season (or use provided season)
 * - Retrieve the rules messages for the current season
 * - Create a list of rule components to update
 * - Edit each message with corresponding rule component from rulesMessagesList
 * @param client - The Sheweny client.
 * @param channel - The text channel containing the rules messages.
 * @param season - The season to use for the rules messages, defaults to current season.
 */
export async function updateRulesMessages(client: ShewenyClient, season?: Season): Promise<void> {

	const rulesChannel = client.channels.cache.get(config.rulesChannelId);
	if (!rulesChannel || rulesChannel.type !== ChannelType.GuildText) {
		await sendLog(client, "seasonsCron", `${config.emojis.cross} <@${config.botAdminsIds[0]}> Impossible de mettre à jour les messages des règles, le salon des règles est introuvable.`);
		return;
	}

	// Fetch bot messages in the rules channel, ordered from oldest to newest
	const botMessages = (await rulesChannel.messages.fetch())
		.filter(msg => msg.author.id === client.user!.id)
		.reverse();

	// Get the current season (or use provided season) and retrieve the rules messages
	const currentSeason = season ?? getCurrentSeason();
	const rulesMessages = getRulesMessages(currentSeason);

	// Create a list of rule components to update
	const rulesMessagesList = [
		rulesMessages.intro,
		rulesMessages.rules1,
		rulesMessages.rules2,
		rulesMessages.serverAccess,
		rulesMessages.vocabulary,
		rulesMessages.triggerWarnings,
		rulesMessages.restrictedChannels,
		rulesMessages.separator,
		rulesMessages.form,
	];

	// Edit each message with corresponding rule component from rulesMessagesList
	for (let i = 0; i < botMessages.size; i++) {
		const message = botMessages.at(i);
		if (!message) continue;
		await message.edit({
			components: [
				rulesMessagesList[i],
			],
		});
	}
}

/**
 * updateGuildIcon: updates the guild icon based on the current season.
 * Summary: Reads the seasonal icon file and updates the guild's icon accordingly.
 * Steps:
 * - Get the garden guild
 * - Read the seasonal icon file from disk
 * - Update the guild's icon with the new image
 * @param client - The Sheweny client.
 * @param season - The season to update the guild icon for.
 */
export async function updateGuildIcon(client: ShewenyClient, season: Season): Promise<void> {
	// Get the garden guild
	const gardenGuild = await getGardenGuild(client);
	if (!gardenGuild) return;

	// Read the seasonal icon file
	const iconPath = resolve(process.cwd(), "src/structures/utils/guildIcons", `${season}.png`);
	const icon = await readFile(iconPath);

	// Update the guild's icon
	await gardenGuild.edit({
		icon,
	});
}

/**
 * updateSeasonalTheme: updates the guild icon and rules messages for a new season.
 * Summary: When a new season starts, this function updates the guild's icon and edits the rules messages to reflect the seasonal theme.
 * Steps:
 * - Update the guild icon based on the new season
 * - Get the rules channel and verify it exists
 * - Update the rules messages in the rules channel with seasonal components
 * @param client - The Sheweny client.
 * @param season - The new season to update the theme for.
 */
export async function updateSeasonalTheme(client: ShewenyClient, season: Season): Promise<void> {

	console.log("⌚ Changement de saison en cours...");
	await sendLog(client, "seasonsCron", `${config.emojis.loading} Changement de saison en cours...`);

	// Update the guild icon and rules messages for the new season
	await updateGuildIcon(client, season);
	await updateRulesMessages(client, season);

	const seasonTranslate = {
		"spring": "au printemps 🌸",
		"summer": "en été ☀️",
		"autumn": "en automne 🍂",
		"winter": "en hiver ❄️",
	};

	await sendLog(client, "seasonsCron", `${config.emojis.check} Nous sommes passés ${seasonTranslate[season]} !`);
}
