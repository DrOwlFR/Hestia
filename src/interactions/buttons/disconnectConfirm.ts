import { type ButtonInteraction, GuildMember } from "discord.js";
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

	/**
	 * Execute: main handler for the disconnect confirm button interaction.
	 * Summary: Confirms the disconnect by deleting the linked account from the site and database, removing associated roles from the user.
	 * Steps:
	 * - Fetch user data from the site
	 * - Handle 404 (no account) or 429 (rate limit) errors
	 * - Delete user's link from the site
	 * - If successful, delete from LinkedUser collection and remove roles based on confirmation status
	 * - Remove access roles (living room, workshop, etc.)
	 * - Handle 429 on delete operation
	 * @param button - The button interaction triggered by the user.
	 */
	async execute(button: ButtonInteraction) {

		const { guild, member, user } = button;

		if (!member || !(member instanceof GuildMember)) return;

		// Fetch user data from the site
		const getResponse = await this.client.functions.getUser(user.id);

		// Handle no linked account
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

		// Handle rate limit
		if (getResponse.status === 429) {
			return button.update({
				content: stripIndent(`
							— Oulah doucement, pas si vite ! Du calme. Reprenez calmement.\n
							-# <:round_cross:1424312051794186260> Limite d'interaction avec le site atteinte. Réessayez dans 60 secondes.
							`),
				components: [],
			});
		}

		// Parse response and delete user from site
		const getResponseJson = (await getResponse.json() as responseJson);

		const deleteResponse = await this.client.functions.deleteUser(user.id);

		// If delete successful
		if (deleteResponse.status === 204) {
			// Delete from LinkedUser collection and log if deletion failed
			const deleteResult = await LinkedUser.deleteOne({ discordId: user.id, siteId: getResponseJson.userId }).catch(() => null);
			if (!deleteResult || deleteResult.deletedCount === 0) {
				await this.client.functions.log("dbError", `<@${config.botAdminsIds[0]}> Le document LinkedUser de l'id discord \`${user.id}\` n'a pas été supprimé correctement. À vérifier.`);
			}

			const memberRoles = member.roles;
			// Remove confirmed or non-confirmed role and update message
			if (getResponseJson.roles!.find(r => r === "user-confirmed")) {
				memberRoles.remove(config.confirmedUserRoleId);
				await button.update({
					content: stripIndent(`
						> *Hestia vous adresse un regard triste. Elle tamponne votre formulaire de départ et vous laisse quitter le Manoir, sans un mot.*\n
						-# <:round_check:1424065559355592884> Votre compte Discord a été déconnecté de votre compte du site. Le rôle ${guild?.roles.cache.get(config.confirmedUserRoleId)}, ainsi que vos autres rôles d'accès, vous ont été retirés.
						`),
					components: [],
				});
			} else {
				memberRoles.remove(config.nonConfirmedUserRoleId);
				await button.update({
					content: stripIndent(`
						> *Hestia vous adresse un regard triste. Elle tamponne votre formulaire de départ et vous laisse quitter le Manoir, sans un mot.*\n
						-# <:round_check:1424065559355592884> Votre compte Discord a été déconnecté de votre compte du site. Le rôle ${guild?.roles.cache.get(config.nonConfirmedUserRoleId)}, ainsi que vos autres rôles d'accès, vous ont été retirés.
						`),
					components: [],
				});
			}
			// Remove access roles
			const rolesToRemove = [config.livingRoomRoleId, config.workshopRoleId, config.libraryRoleId, config.terraceRoleId, config.seriousRoleId, config.irlRoleId];
			const rolesOwned = rolesToRemove.filter(roleId => memberRoles.cache.has(roleId));

			if (rolesOwned.length > 0) {
				await memberRoles.remove(rolesOwned);
			}
		}
		// Handle rate limit on delete
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
