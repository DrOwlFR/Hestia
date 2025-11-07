import type { ChatInputCommandInteraction } from "discord.js";
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

		const members = await guild?.members.fetch();
		if (!members) return interaction.editReply("<:round_cross:1424312051794186260> Impossible de récupérer les membres du serveur.");

		let i = 0;
		let actions = 0;
		let logs: string[] = [];

		const roles = [
			config.livingRoomRoleId,
			config.workshopRoleId,
			config.libraryRoleId,
			config.terraceRoleId,
			config.seriousRoleId,
			config.irlRoleId,
		];

		for (const member of members.values()) {
			const getResponse = await this.client.functions.getUser(member.id);

			if (getResponse.status === 404) {
				const rolesToRemove: string[] = [];

				if (member.roles.cache.has(config.ampersandRoleId)) {
					rolesToRemove.push(config.ampersandRoleId);
					logs.push(`🧹 Rôle <@&${config.ampersandRoleId}> de ${member} **supprimé**.`);
				}
				if (member.roles.cache.has(config.seedRoleId)) {
					rolesToRemove.push(config.seedRoleId);
					logs.push(`🧹 Rôle <@&${config.seedRoleId}> de ${member} **supprimé**.`);
				}

				const extraRolesOwned = roles.filter(role => member.roles.cache.has(role));
				if (extraRolesOwned.length > 0) {
					rolesToRemove.push(...extraRolesOwned);
					logs.push(`🧹 Rôles secondaires de ${member} supprimés.`);
				}

				if (rolesToRemove.length) {
					await member.roles.remove(rolesToRemove);
					actions += rolesToRemove.length;
				}
			}

			else if (getResponse.status === 429) {
				await interaction.followUp({
					content: "⚠️ Rate limit atteint. Pause de 60 secondes",
					flags: MessageFlags.Ephemeral,
				});
				actions++;
				await this.client.functions.delay(60 * 1000);
			}

			else if (getResponse.status === 200) {
				const getResponseJson = await getResponse.json() as responseJson;

				const linked = await LinkedUser.findOne({ discordId: member.id });
				if (!linked) {
					await LinkedUser.create({
						discordId: member.id,
						siteId: getResponseJson.userId,
						discordUsername: member.user.username,
					});
					logs.push(`🆕 Le membre ${member} apparaît comme lié dans l'API, mais n'a pas de document à son nom dans la BDD. Document créé.`);
				}

				const hasEsperluette = member.roles.cache.has(config.ampersandRoleId);
				const hasGraine = member.roles.cache.has(config.seedRoleId);
				const rolesApi = getResponseJson.roles ?? [];

				if (!hasEsperluette && rolesApi.includes("user-confirmed")) {
					await member.roles.add(config.ampersandRoleId);
					actions++;
					logs.push(`<:round_check:1424065559355592884> Rôle Esperluette de ${member} ajouté.`);
				}
				else if (!hasGraine && rolesApi.includes("user")) {
					await member.roles.add(config.seedRoleId);
					actions++;
					logs.push(`<:round_check:1424065559355592884> Rôle Graine de ${member.user.username} ajouté.`);
				}
			}

			else {
				logs.push(`⚠️ Erreur inconnue pour ${member}`);
			}

			if (logs.length >= 10) {
				await interaction.followUp({
					content: logs.join("\n"),
					flags: MessageFlags.Ephemeral,
				});
				logs = [];
			}

			i++;
			if ((i + 1) % 40 === 0 || (actions > 0 && actions % 40 === 0)) {
				await interaction.editReply({
					content: ` Pause de 4 secondes après \`${i + 1}\` itérations et \`${actions}\` actions.`,
				});
				await this.client.functions.delay(4000);
			}
		}

		if (logs.length) {
			await interaction.followUp({
				content: logs.join("\n"),
				flags: MessageFlags.Ephemeral,
			});
		}

		await interaction.followUp({
			content: `<:round_check:1424065559355592884> Commande terminée après ${i + 1} itérations et \`${actions}\` actions.`,
			flags: MessageFlags.Ephemeral,
		});

	}
}
