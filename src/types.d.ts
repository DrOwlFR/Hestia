import type { EmbedBuilder } from "discord.js";

import type { LogChannel } from "./structures/utils/functions";

/**
 * Augmentation of Sheweny's ShewenyClient interface.
 * Adds custom utility functions available on the client instance throughout the bot.
 */
declare module "sheweny" {
	/**
	 * Extended ShewenyClient with custom utility functions.
	 * Functions include: embed builder, delay and log utility, and site API interactions (connect, get, delete user).
	 */
	export interface ShewenyClient {
		functions: {
			// embed: () => EmbedBuilder,
			embed: Function,
			// eslint-disable-next-line no-unused-vars
			delay: (ms: number) => Promise<void>,
			// eslint-disable-next-line no-unused-vars
			log: (type: LogChannel, message: string) => Promise<void>,
			// eslint-disable-next-line no-unused-vars
			connectUser: (code: string, discordId: string, username: string) => Promise<Response>,
			// eslint-disable-next-line no-unused-vars
			getUser: (discordId: string) => Promise<Response>,
			// eslint-disable-next-line no-unused-vars
			deleteUser: (discordId: string) => Promise<Response>,
		}
	}
}

/**
 * API response structure for site interactions.
 * Returned by connectUser, getUser, and other API functions.
 * Contains success status, user data, roles, or error details.
 */
export interface responseJson {
	success?: boolean,
	userId?: number,
	roles?: Array<string>,
	error?: string,
	message?: string,
}
