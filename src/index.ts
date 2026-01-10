import { ShewenyClient } from "sheweny";

import config from "./structures/config";
import { dBConnection } from "./structures/database/dBConnection";
import { connectUser, delay, deleteUser, embed, getUser } from "./structures/utils/functions";

const client = new ShewenyClient({
	intents: ["Guilds", "GuildMembers", "GuildMessages", "GuildPresences"],
	admins: config.botAdminsIds,
	joinThreadsOnCreate: true,
	managers: {
		commands: {
			directory: "./commands",
			autoRegisterApplicationCommands: true,
			guildId: config.registeredGuildsIds,
			prefix: "h.",
			asyncRead: true,
			applicationPermissions: true,
			default: {
				cooldown: 3,
				type: "SLASH_COMMAND",
				channel: "GUILD",
				userPermissions: ["ViewChannel"],
			},
		},
		events: {
			directory: "./events",
			asyncRead: true,
		},
		buttons: {
			directory: "./interactions/buttons",
			asyncRead: true,
		},
		selectMenus: {
			directory: "./interactions/selectmenus",
			asyncRead: true,
		},
		modals: {
			directory: "./interactions/modals",
			asyncRead: true,
		},
		inhibitors: {
			directory: "./inhibitors",
			asyncRead: true,
		},
	},
	// development || production
	mode: "development",
});

client.functions = {
	embed: embed,
	delay: delay,
	connectUser: connectUser,
	getUser: getUser,
	deleteUser: deleteUser,
};

dBConnection();

client.login(config.DISCORD_TOKEN);
