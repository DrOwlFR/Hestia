/* eslint-disable no-inline-comments */

/**
 * Configuration template for Hestia bot.
 * Copy to config.ts and fill with actual values for Discord tokens, MongoDB connection, API keys, and Discord IDs.
 * Includes emojis IDs, channel IDs, role IDs, moderator IDs, admin IDs, etc. and seasonal color themes.
 */
export default {
	DISCORD_TOKEN: "",

	MONGO_TOKEN: "",
	dbName: "",

	API_KEY: "",
	APILink: "",

	botAdminsIds: [""],
	registeredGuildsIds: [""],

	errorChannelId: "",
	dbErrorChannelId: "",
	dbCleaningCronChannelId: "",
	seriousRoleCronChannelId: "",
	saveDbCronChannelId: "",
	seasonsCronChannelId: "",

	gardenGuildId: "",

	rulesChannelId: "",
	portraitGaleryChannelId: "",
	antechamberChannelId: "",
	loungeChannelId: "",
	seriousChannelId: "",
	irlChannelId: "",

	confirmedUserRoleId: "",
	nonConfirmedUserRoleId: "",

	livingRoomRoleId: "",
	workshopRoleId: "",
	libraryRoleId: "",
	terraceRoleId: "",
	seriousRoleId: "",
	irlRoleId: "",

	adminRoleId: "",
	modRoleId: "",
	arobaseRoleId: "",
	guillemetRoleId: "",

	adminsDiscordIds: [""],
	discordModsIds: [""],
	siteModsIds: [""],

	illustratorName: "",

	emojis: {
		check: "",
		cross: "",
		loading: "",
		developer: "",
		highConnection: "",
		line: "",
		bot: "",
		nodejs: "",
		discordjs: "",
		sheweny: "",
		rightBlueArrow: "",
		warn: "",
		content: "",
	},

	autumn: {
		colorPrimary: 0xC98129, // "#c98129"
		colorSecondary: 0xF0C841, // "#f0c841"
		colorAccent: 0xA4345C, // "#a4345c"
		colorTertiary: 0x639DA5, // "#639da5"
		logo: "", // Seasonal logo URL for autumn
	},
	winter: {
		colorPrimary: 0x6B98AA, // "#6b98aa"
		colorSecondary: 0x72DDDA, // "#72ddda"
		colorAccent: 0xB53762, // "#b53762"
		colorTertiary: 0xB59031, // "#b59031"
		logo: "", // Seasonal logo URL for winter
	},
	spring: {
		colorPrimary: 0x76A003, // "#76a003"
		colorSecondary: 0xBDEA00, // "#bdea00"
		colorAccent: 0xEF5E76, // "#ef5e76"
		colorTertiary: 0xAD6373, // "#ad6373"
		logo: "", // Seasonal logo URL for spring
	},
	summer: {
		colorPrimary: 0xF24469, // "#f24469"
		colorSecondary: 0xFFCE00, // "#ffce00"
		colorAccent: 0x0078c1, // "#0078c1"
		colorTertiary: 0x83a00c, // "#83a00c"
		logo: "", // Seasonal logo URL for summer
	},

	githubRepositoryUrl: "",
};
