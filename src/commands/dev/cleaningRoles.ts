import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

import config from "../../structures/config";
import { LinkedUser } from "../../structures/database/models";
import type { responseJson } from "../../types";

export class CleaningRolesCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "cleaningroles",
			description: "Retire le rôle & aux membres qui ne sont pas connectés au site.",
			category: "Dev",
			adminsOnly: true,
			usage: "cleaningroles",
			examples: ["cleaningroles"],
		});
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const { guild } = interaction;

		await interaction.reply({
			content: "<a:load:1424326891778867332> Lancement de la commande...",
			flags: MessageFlags.Ephemeral,
		});

		const members = guild?.members.cache.map(m => m);

		let i;
		let actions = 0;
		for (i = 0; i < members!.length; i++) {
			const member = members![i] as GuildMember;
			const getResponse = await this.client.functions.getUser(member.id);

			if (getResponse.status === 404) {
				if (member.roles.cache.has(config.ampersandRoleId)) {

					member.roles.remove(config.ampersandRoleId);
					actions++;

					await interaction.followUp({
						content: `Rôle esperluette de ${member.user.username} supprimé.`,
						flags: MessageFlags.Ephemeral,
					});
					actions++;
				}
				else if (member.roles.cache.has(config.seedRoleId)) {

					member.roles.remove(config.seedRoleId);
					actions++;

					await interaction.followUp({
						content: `Rôle graine de ${member.user.username} supprimé.`,
						flags: MessageFlags.Ephemeral,
					});
					actions++;
				}
				const rolesToRemove = [config.livingRoomRoleId, config.workshopRoleId, config.libraryRoleId, config.terraceRoleId, config.seriousRoleId, config.irlRoleId];
				const rolesOwned = rolesToRemove.filter(roleId => member.roles.cache.has(roleId));

				if (rolesOwned.length > 0) {
					await member.roles.remove(rolesOwned);
				}
			} else if (getResponse.status === 429) {
				await interaction.followUp({
					content: "⚠️ Rate limit atteint. Pause de 60 secondes",
					flags: MessageFlags.Ephemeral,
				});
				await this.client.functions.delay(60 * 1000);
			}
			else if (getResponse.status === 429) {
				const getResponseJson = await getResponse.json() as responseJson;

				if (!await LinkedUser.findOne({ discordId: member.id })) {
					await interaction.followUp({
						content: `⚠️ Le membre ${member} apparaît comme lié dans l'API, mais n'a pas de document à son nom dans la BDD. Création d'un document en cours.`,
						flags: MessageFlags.Ephemeral,
					});
					actions++;

					await LinkedUser.create({ discordId: member.id, siteId: getResponseJson.userId, discordUsername: member.user.username });
				}

				if (!member.roles.cache.has(config.ampersandRoleId) && getResponseJson.roles!.find(r => r === "user-confirmed")) {

					member.roles.add(config.ampersandRoleId);
					actions++;

					await interaction.followUp({
						content: `Rôle Esperluette de ${member.user.username} ajouté.`,
						flags: MessageFlags.Ephemeral,
					});
					actions++;
				} else if (!member.roles.cache.has(config.seedRoleId) && getResponseJson.roles!.find(r => r === "user")) {

					member.roles.add(config.seedRoleId);
					actions++;

					await interaction.followUp({
						content: `Rôle graine de ${member.user.username} ajouté.`,
						flags: MessageFlags.Ephemeral,
					});
					actions++;
				}
			} else {
				await interaction.followUp({
					content: `⚠️ Erreur inconnue sur le membre : ${member}. À vérifier.`,
					flags: MessageFlags.Ephemeral,
				});
				actions++;
			}

			if ((i + 1) % 40 === 0 || (actions % 40 === 0 && actions > 0)) {
				await interaction.editReply({
					content: ` Pause de 4 secondes après \`${i + 1}\` itérations et \`${actions}\` actions.`,
				});
				await this.client.functions.delay(4000);
				continue;
			} else { continue; }
		}

		await interaction.followUp({
			content: `<:round_check:1424065559355592884> Commande terminée après ${i + 1} itérations et \`${actions}\` actions.`,
			flags: MessageFlags.Ephemeral,
		});

	}
}
