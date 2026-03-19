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
		colorPrimary: 0xF0C841, // "#f0c841"
		colorSecondary: 0xC98129, // "#c98129"
		colorAccent: 0xA4345C, // "#a4345c"
		colorTertiary: 0x639DA5, // "#639da5"
		logo: "", // Seasonal logo URL for autumn
	},
	winter: {
		colorPrimary: 0x6B98AA, // "#6b98aa"
		colorSecondary: 0x18435B, // "#18435b"
		colorAccent: 0xB53762, // "#b53762"
		colorTertiary: 0xB59031, // "#b59031"
		logo: "", // Seasonal logo URL for winter
	},
	spring: {
		colorPrimary: 0xBDEA00, // "#bdea00"
		colorSecondary: 0x76A003, // "#76a003"
		colorAccent: 0xEF5E76, // "#ef5e76"
		colorTertiary: 0x898AC7, // "#898ac7"
		logo: "", // Seasonal logo URL for spring
	},
	summer: { // Placeholder: same as autumn for now
		colorPrimary: 0xF0C841, // "#f0c841"
		colorSecondary: 0xC98129, // "#c98129"
		colorAccent: 0xA4345C, // "#a4345c"
		colorTertiary: 0x639DA5, // "#639da5"
		logo: "", // Seasonal logo URL for summer
	},

	githubRepositoryUrl: "",
};
