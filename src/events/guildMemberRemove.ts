import type { GuildMember, TextChannel } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";

import config from "../structures/config";
import { LinkedUser, User } from "../structures/database/models";

export class GuildMemberRemoveEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "guildMemberRemove", {
			description: "Member quit the guild",
			once: false,
			emitter: client,
		});
	}

	/**
	 * Execute: handler for the `guildMemberRemove` event.
	 * Summary: Triggered when a member leaves the guild. Cleans up their User and LinkedUser documents, and unlinks from the site API.
	 * Behavior:
	 * - Skips bots and members from other guilds
	 * - Deletes User and LinkedUser documents if they exist
	 * - Calls `functions.deleteUser` which performs a DELETE fetch to the site's `/api/discord/users/:id` endpoint
	 * - Logs errors or failures to a specific channel
	 * @param member - The guild member that left.
	 */
	async execute(member: GuildMember) {

		// Skip bots and members from other guilds
		if (member.user.bot) return;
		if (member.guild.id !== config.gardenGuildId) return;

		// Delete the User document if it exists
		if (await User.findOne({ discordId: member.id })) {
			try {
				const userDelete = await User.deleteOne({ discordId: member.id });
				if (userDelete.deletedCount === 0) (this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@${config.botAdminsIds[0]}> Le document **User** de l'id discord \`${member.id}\` n'a pas été supprimé correctement lors de son **départ du serveur**. À vérifier.`);
			}
			catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
			}
		}

		// Delete the LinkedUser document if it exists
		if (await LinkedUser.findOne({ discordId: member.id })) {
			try {
				const linkedUserDelete = await LinkedUser.deleteOne({ discordId: member.id });
				if (linkedUserDelete.deletedCount === 0) (this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@${config.botAdminsIds[0]}> Le document **LinkedUser** de l'id discord \`${member.id}\` n'a pas été supprimé correctement lors de son **départ du serveur**. À vérifier.`);
			}
			catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
			}
		}

		// Call the API to delete the linked user from the site via a DELETE request to `/api/discord/users/:id`
		const deleteResponse = await this.client.functions.deleteUser(member.id);

		// Handle API response: 404 (not found) or 204 (success) are expected, otherwise log error
		if (deleteResponse.status === 404) { return; }
		else if (deleteResponse.status === 204) { return; }
		else { (this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@${config.botAdminsIds[0]}> Le lien avec le site de l'utilisateur \`${member.id}\` n'a pas été supprimé correctement lors de son **départ du serveur**. À vérifier.`); }

	}
};
