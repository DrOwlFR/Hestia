import { EmbedBuilder } from "discord.js";
import config from "./config";

function embed() {
	return new EmbedBuilder()
		.setColor("#26c4ec")
		.setFooter({ text: "© Midriass", iconURL: "https://cdn.discordapp.com/attachments/906273410924040253/906273850168328262/Logo_Hibou_discord.png" })
		.setTimestamp();
}

function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function getUser(userId: string): Promise<Response> {
	return await fetch(`${config.APILink}/api/discord/users/${userId}`, {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${config.API_KEY}`,
			"Content-Type": "application/json",
		},
	});
}

async function deleteUser(userId: string): Promise<Response> {
	return await fetch(`${config.APILink}/api/discord/users/${userId}`, {
		method: "DELETE",
		headers: {
			"Authorization": `Bearer ${config.API_KEY}`,
			"Content-Type": "application/json",
		},
	});
}

export { embed, delay, connectUser, getUser, deleteUser };
