import { LinkedUser } from "../../../database/models";

/**
 * getDiscordIdFromSiteId: takes a site ID as input and returns the corresponding Discord ID if it exists in the database, or undefined if it does not.
 * Summary: This function queries the LinkedUser database model to find a user with the given site ID. If a matching user is found, it returns their Discord ID; if no matching user is found, it returns undefined.
 * Steps:
 * - Query the LinkedUser model to find a user with the provided site ID.
 * - If a user is found, return their Discord ID.
 * - If no user is found, return undefined.
 * @param siteId - The site ID for which to find the corresponding Discord ID in the LinkedUser database model.
 * @returns - A promise that resolves to the Discord ID if found, or undefined if not found.
 */
export async function getDiscordIdFromSiteId(siteId: number): Promise<string | undefined> {
	const linkedUser = await LinkedUser.findOne({ siteId });
	return linkedUser?.discordId;
}
