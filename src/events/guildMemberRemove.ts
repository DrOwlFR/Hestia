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

	async execute(member: GuildMember) {

		if (member.user.bot) return;
		if (member.guild.id !== config.gardenGuildId) return;

		if (await User.findOne({ discordId: member.id })) {
			try {
				const userDelete = await User.deleteOne({ discordId: member.id });
				if (userDelete.deletedCount === 0) (this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@158205521151787009> Le document **User** de l'id discord \`${member.id}\` n'a pas été supprimé correctement lors de son **départ du serveur**. À vérifier.`);
			}
			catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
			}
		}

		if (await LinkedUser.findOne({ discordId: member.id })) {
			try {
				const linkedUserDelete = await LinkedUser.deleteOne({ discordId: member.id });
				if (linkedUserDelete.deletedCount === 0) (this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@158205521151787009> Le document **LinkedUser** de l'id discord \`${member.id}\` n'a pas été supprimé correctement lors de son **départ du serveur**. À vérifier.`);
			}
			catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
			}
		}

		const deleteResponse = await this.client.functions.deleteUser(member.id);

		if (deleteResponse.status === 404) { return; }
		else if (deleteResponse.status === 204) { return; }
		else { (this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@158205521151787009> Le lien avec le site de l'utilisateur \`${member.id}\` n'a pas été supprimé correctement lors de son **départ du serveur**. À vérifier.`); }

	}
};
