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

		if (getResponse.status === 429) {
			return button.update({
				content: stripIndent(`
							— Oulah doucement, pas si vite ! Du calme. Reprenez calmement.\n
							-# <:round_cross:1424312051794186260> Limite d'interaction avec le site atteinte. Réessayez dans 60 secondes.
							`),
				components: [],
			});
		}

		const getResponseJson = (await getResponse.json() as responseJson);

		const deleteResponse = await this.client.functions.deleteUser(user.id);

		if (deleteResponse.status === 204) {
			// eslint-disable-next-line no-console
			const deleteResult = await LinkedUser.deleteOne({ discordId: user.id, siteId: getResponseJson.userId }).catch(err => console.error(err));
			const memberRoles = member?.roles as GuildMemberRoleManager;
			if ((deleteResult as DeleteResult).deletedCount === 0) { (this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@158205521151787009> Le document LinkedUser de l'id discord \`${user.id}\` n'a pas été supprimé correctement. À vérifier.`); }
			if (getResponseJson.roles!.find(r => r === "user-confirmed")) {
				memberRoles.remove(config.ampersandRoleId);
				await button.update({
					content: stripIndent(`
						> *Hestia vous adresse un regard triste. Elle tamponne votre formulaire de départ et vous laisse quitter le Manoir, sans un mot.*\n
						-# <:round_check:1424065559355592884> Votre compte Discord a été déconnecté de votre compte du site. Le rôle ${guild?.roles.cache.get(config.ampersandRoleId)}, ainsi que vos autres rôles d'accès, vous ont été retirés.
						`),
					components: [],
				});
			} else {
				memberRoles.remove(config.seedRoleId);
				await button.update({
					content: stripIndent(`
						> *Hestia vous adresse un regard triste. Elle tamponne votre formulaire de départ et vous laisse quitter le Manoir, sans un mot.*\n
						-# <:round_check:1424065559355592884> Votre compte Discord a été déconnecté de votre compte du site. Le rôle ${guild?.roles.cache.get(config.seedRoleId)}, ainsi que vos autres rôles d'accès, vous ont été retirés.
						`),
					components: [],
				});
			}
			const rolesToRemove = [config.livingRoomRoleId, config.workshopRoleId, config.libraryRoleId, config.terraceRoleId, config.seriousRoleId, config.irlRoleId];
			const rolesOwned = rolesToRemove.filter(roleId => memberRoles.cache.has(roleId));

			if (rolesOwned.length > 0) {
				await memberRoles.remove(rolesOwned);
			}
		}
		else if (deleteResponse.status === 429) {
			return button.update({
				content: stripIndent(`
					— Oulah doucement, pas si vite ! Du calme. Reprenez calmement.\n
					-# <:round_cross:1424312051794186260> Limite d'interaction avec le site atteinte. Réessayez dans 60 secondes.
					`),
				components: [],
			});
		}

	}
};
