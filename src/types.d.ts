import type { EmbedBuilder } from "discord.js";

declare module "sheweny" {
	export interface ShewenyClient {
		functions: {
			// embed: () => EmbedBuilder,
			embed: Function,
			// eslint-disable-next-line no-unused-vars
			delay: (ms: number) => Promise<void>,
			// eslint-disable-next-line no-unused-vars
			connectUser: (code: string, discordId: string, username: string) => Promise<Response>,
			// eslint-disable-next-line no-unused-vars
			getUser: (discordId: string) => Promise<Response>,
			// eslint-disable-next-line no-unused-vars
			deleteUser: (discordId: string) => Promise<Response>,
		}
	}
}

export interface responseJson {
	success?: boolean,
	userId?: number,
	roles?: Array<string>,
	error?: string,
	message?: string,
}
