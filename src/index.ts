import { ShewenyClient } from "sheweny";

import config from "./structures/config";
import { dBConnection } from "./structures/database/dBConnection";
import { connectUser, delay, deleteUser, embed, getUser, log } from "./structures/utils/functions";

/**
 * Initialize and configure the Discord bot client.
 * Sets up managers for commands, events, buttons, select menus, modals, and inhibitors.
 * Configures bot intents, permissions, and development mode.
 */
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

// Attach utility functions to client for use across bot
client.functions = {
	embed: embed,
	delay: delay,
	connectUser: connectUser,
	getUser: getUser,
	deleteUser: deleteUser,
	log: log.bind(client),
};

// Connect to MongoDB
dBConnection();

// Login to Discord
client.login(config.DISCORD_TOKEN);
