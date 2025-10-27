import type { ButtonInteraction, GuildMemberRoleManager, TextChannel } from "discord.js";
import type { DeleteResult } from "mongoose";
import type { ShewenyClient } from "sheweny";
import { Button } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../structures/config";
import { LinkedUser } from "../../structures/database/models";
import type { responseJson } from "../../types";

export class DisconnectConfirmButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["disconnectConfirmButton"]);
	}

	async execute(button: ButtonInteraction) {

		const { guild, member, user } = button;

		const getResponse = await this.client.functions.getUser(user.id);

		if (getResponse.status === 404) {
			return button.update({
				content: stripIndent(`
					> *Vous observez Hestia hausser un sourcil en jouant avec ses clefs.*
					— Hm. Non. Je ne trouve pas de formulaire d'entrée à votre nom, vous faites erreur.\n
					-# <:round_cross:1424312051794186260> Aucun compte du site n'est associé à ce compte Discord, il ne peut donc pas être déconnecté. Pour connecter votre compte, voir la section « Accepter le règlement ».
					`),
				components: [],
			});
		}

		const getResponseJson = (await getResponse.json() as responseJson);

		const deleteResponse = await this.client.functions.deleteUser(user.id);

		if (deleteResponse.status === 204) {
			// eslint-disable-next-line no-console
			const deleteResult = await LinkedUser.deleteOne({ discordId: user.id, siteId: getResponseJson.userId }).catch(err => console.error(err));
			if ((deleteResult as DeleteResult).deletedCount === 0) { (this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@158205521151787009> Le document LinkedUser de l'id discord \`${user.id}\` n'a pas été supprimé correctement. À vérifier.`); }
			if (getResponseJson.roles!.find(r => r === "user-confirmed")) {
				(member?.roles as GuildMemberRoleManager).remove(config.ampersandRoleId);
				await button.update({
					content: stripIndent(`
						> *Hestia vous adresse un regard triste. Elle tamponne votre formulaire de départ et vous laisse quitter le Manoir, sans un mot.*\n
						-# <:round_check:1424065559355592884> Votre compte Discord a été déconnecté de votre compte du site. Le rôle ${guild?.roles.cache.get(config.ampersandRoleId)}, ainsi que vos autres rôles d'accès, vous ont été retirés.
						`),
					components: [],
				});
			} else {
				(member?.roles as GuildMemberRoleManager).remove(config.seedRoleId);
				await button.update({
					content: stripIndent(`
						> *Hestia vous adresse un regard triste. Elle tamponne votre formulaire de départ et vous laisse quitter le Manoir, sans un mot.*\n
						-# <:round_check:1424065559355592884> Votre compte Discord a été déconnecté de votre compte du site. Le rôle ${guild?.roles.cache.get(config.seedRoleId)}, ainsi que vos autres rôles d'accès, vous ont été retirés.
						`),
					components: [],
				});
			}
			(member?.roles as GuildMemberRoleManager).remove(config.livingRoomRoleId);
			(member?.roles as GuildMemberRoleManager).remove(config.workshopRoleId);
			(member?.roles as GuildMemberRoleManager).remove(config.libraryRoleId);
			(member?.roles as GuildMemberRoleManager).remove(config.terraceRoleId);
			(member?.roles as GuildMemberRoleManager).remove(config.seriousRoleId);
			(member?.roles as GuildMemberRoleManager).remove(config.irlRoleId);
		}

	}
};
