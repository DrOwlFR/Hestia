/* eslint-disable no-unused-vars */
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
			formatDateTime: (date?: Date) => string,
			delay: (ms: number) => Promise<void>,
			log: (type: LogChannel, message: string) => Promise<void>,
			connectUser: (code: string, discordId: string, username: string) => Promise<Response>,
			getUser: (discordId: string) => Promise<Response>,
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
