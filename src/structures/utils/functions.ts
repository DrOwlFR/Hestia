import { ChannelType, EmbedBuilder } from "discord.js";
import type { ShewenyClient } from "sheweny";

import config from "../config";

/**
 * embed: creates a standardized Discord embed with bot branding.
 * Summary: Returns an EmbedBuilder with the bot's color, footer with logo, and current timestamp.
 * @returns A configured EmbedBuilder instance.
 */
function embed() {
	return new EmbedBuilder()
		.setColor("#26c4ec")
		.setFooter({ text: "© Midriass", iconURL: "https://cdn.discordapp.com/attachments/906273410924040253/906273850168328262/Logo_Hibou_discord.png" })
		.setTimestamp();
}

/**
 * delay: creates a promise that resolves after a specified number of milliseconds.
 * Summary: Utility for delaying execution, useful for rate limiting or sequencing operations.
 * @param ms - The number of milliseconds to delay.
 * @returns A promise that resolves after the delay.
 */
function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * connectUser: authenticates and links a Discord user to a site account.
 * Summary: Sends a POST request to the site API with verification code, Discord ID, and username to establish account link.
 * @param code - The verification code from the user's site profile.
 * @param userId - The Discord user ID.
 * @param username - The Discord username.
 * @returns The API response (success, conflict, or error).
 */
async function connectUser(code: string, userId: string, username: string): Promise<Response> {
	return await fetch(`${config.APILink}/api/discord/users`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${config.API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			"code": code,
			"discordId": userId,
			"discordUsername": username,
		}),
	});
}

/**
 * getUser: retrieves user data from the site API.
 * Summary: Sends a GET request to fetch user information by Discord ID.
 * @param userId - The Discord user ID to fetch.
 * @returns The API response containing user data or error status (404 if not found).
 */
async function getUser(userId: string): Promise<Response> {
	return await fetch(`${config.APILink}/api/discord/users/${userId}`, {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${config.API_KEY}`,
			"Content-Type": "application/json",
		},
	});
}

/**
 * deleteUser: deletes a Discord user link from the site API.
 * Summary: Sends a DELETE request to remove the user's link from the site by Discord ID.
 * @param userId - The Discord user ID to delete.
 * @returns The API response (204 on success, 404 if not found, or error).
 */
async function deleteUser(userId: string): Promise<Response> {
	return await fetch(`${config.APILink}/api/discord/users/${userId}`, {
		method: "DELETE",
		headers: {
			"Authorization": `Bearer ${config.API_KEY}`,
			"Content-Type": "application/json",
		},
	});
}

// Log channels types
export type LogChannel = "generalError" |"dbError" | "dbCleaningCron" | "seriousRoleCron" | "saveDbCron" | "seasonsCron";

// Mapping of log channel types to their Discord channel IDs
const LOG_CHANNELS: Record<LogChannel, string> = {
	generalError: config.errorChannelId,
	dbError: config.dbErrorChannelId,
	dbCleaningCron: config.dbCleaningCronChannelId,
	seriousRoleCron: config.seriousRoleCronChannelId,
	saveDbCron: config.saveDbCronChannelId,
	seasonsCron: config.seasonsCronChannelId,
};

/**
 * log: sends a log message to a specified Discord channel.
 * Summary: Utility to log messages to designated channels for different log types.
 * @param this - The ShewenyClient instance.
 * @param type - The type of log channel to send the message to.
 * @param message - The log message content.
 * @returns A promise that resolves when the message is sent or an error is thrown if the channel is not found.
 */
async function log(this: ShewenyClient, type: LogChannel, message: string): Promise<void> {
	const channelId = LOG_CHANNELS[type];
	const channel = this.channels.cache.get(channelId);

	if (!channel || channel.type !== ChannelType.GuildText) {
		throw new Error(`Channel de log "${type}" introuvable`);
	}

	await channel.send(message);
}

export { connectUser, delay, deleteUser, embed, getUser, log };
