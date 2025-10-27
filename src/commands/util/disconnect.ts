import type { ChatInputCommandInteraction, GuildMemberRoleManager, TextChannel } from "discord.js";
import { MessageFlags } from "discord.js";
import type { DeleteResult } from "mongoose";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

import config from "../../structures/config";
import { LinkedUser } from "../../structures/database/models";
import type { responseJson } from "../../types";

export class DisconnectCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "disconnect",
			description: "Permet la déconnexion du lien entre votre compte Discord et le site du Jardin.",
			category: "Utile",
			usage: "disconnect",
			examples: ["disconnect"],
			clientPermissions: ["ManageRoles"],
		});
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const { user, member, guild } = interaction;

		const getResponse = await this.client.functions.getUser(user.id);

		if (getResponse.status === 404) return interaction.reply({ content: "<:round_cross:1424312051794186260> Aucun compte du site n'est associé à ce compte Discord. Pour connecter votre compte, rendez-vous sur votre profil du jardin et cliquez sur \"Lier\".", flags: MessageFlags.Ephemeral });

		const getResponseJson = (await getResponse.json() as responseJson);

		const deleteResponse = await this.client.functions.deleteUser(user.id);

		if (deleteResponse.status === 204) {
			const deleteResult = await LinkedUser.deleteOne({ discordId: user.id, siteId: getResponseJson.userId }).catch(err => console.error(err));
			if ((deleteResult as DeleteResult).deletedCount === 0) { (this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@158205521151787009> Le document LinkedUser de l'id discord \`${user.id}\` n'a pas été supprimé correctement. À vérifier.`); }
			if (getResponseJson.roles!.find(r => r === "user-confirmed")) {
				(member?.roles as GuildMemberRoleManager).remove(config.ampersandRoleId);
				return interaction.reply({ content: `<:round_check:1424065559355592884> Votre compte Discord a été déconnecté de votre compte du site avec succès. Le rôle ${guild?.roles.cache.get(config.ampersandRoleId)} vous a été retiré.`, flags: MessageFlags.Ephemeral });
			} else {
				(member?.roles as GuildMemberRoleManager).remove(config.seedRoleId);
				return interaction.reply({ content: `<:round_check:1424065559355592884> Votre compte Discord a été déconnecté de votre compte du site avec succès. Le rôle ${guild?.roles.cache.get(config.seedRoleId)} vous a été retiré.`, flags: MessageFlags.Ephemeral });
			}
		}

	}
}
