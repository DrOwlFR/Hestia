import { ShewenyClient } from "sheweny";
import config from "./structures/config";
import { embed, delay, connectUser, getUser, deleteUser } from "./structures/functions";
import { dBConnection } from "./structures/database/dBConnection";

const client = new ShewenyClient({
	intents: ["Guilds", "GuildMembers", "GuildMessages", "GuildPresences"],
	admins: config.adminsId,
	joinThreadsOnCreate: true,
	managers: {
		commands: {
			directory: "./commands",
			autoRegisterApplicationCommands: true,
			guildId: config.registeredGuildIds,
			prefix: "pp.",
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
