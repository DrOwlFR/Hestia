import type { TextChannel } from "discord.js";
import type { ShewenyClient } from "sheweny";

import { rulesMessages } from "../utils/rulesMessages";

type Season = "spring" | "summer" | "autumn" | "winter";

const seasonStartDates: Record<Season, { month: number; day: number }> = {
	spring: { month: 3, day: 20 },
	summer: { month: 6, day: 21 },
	autumn: { month: 9, day: 23 },
	winter: { month: 12, day: 21 },
};

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

export function getCurrentSeason(date = new Date()): Season {
	const y = date.getFullYear();

	// Initializing seasons starting dates
	const seasons: { season: Season; date: Date }[] = [
		{ season: "spring", date: new Date(y, 2, 20) },
		{ season: "summer", date: new Date(y, 5, 21) },
		{ season: "autumn", date: new Date(y, 8, 23) },
		{ season: "winter", date: new Date(y, 12, 21) },
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

// type RulesMessageInfo = { message: ContainerBuilder; color: number | undefined };

export async function updateRulesMessages(channel: TextChannel, client: ShewenyClient): Promise<void> {

	const botMessages = (await channel.messages.fetch())
		.filter(msg => msg.author.id === client.user!.id)
		.reverse();

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
