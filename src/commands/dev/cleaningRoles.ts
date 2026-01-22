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

	/**
	 * Execute: main handler for the `cleaningroles` command.
	 * Summary: Clean and assign roles to guild members based on their linked status from the site's API.
	 * Steps:
	 * - Fetch all guild members
	 * - For each member, query the API to check linked status
	 * - Remove roles if not linked (404), assign roles if linked (200), handle rate limits (429)
	 * - Log actions in batches and provide final summary
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		// Access the guild from the interaction
		const { guild } = interaction;

		await interaction.reply({
			content: "<a:load:1424326891778867332> Lancement de la commande...",
			flags: MessageFlags.Ephemeral,
		});

		// Fetching all members of the guild
		const members = await guild?.members.fetch();
		if (!members) return interaction.editReply("<:round_cross:1424312051794186260> Impossible de récupérer les membres du serveur.");

		// Initialize counters and logs array
		let i = 0;
		let actions = 0;
		let logs: string[] = [];

		// Define the roles that can be managed by this command
		const roles = [
			config.livingRoomRoleId,
			config.workshopRoleId,
			config.libraryRoleId,
			config.terraceRoleId,
			config.seriousRoleId,
			config.irlRoleId,
		];

		// Iterating through each member to check their status on the external site
		for (const member of members.values()) {
			// Query the site's API for the member's linked status
			const getResponse = await this.client.functions.getUser(member.id);

			// Handling different response statuses from the external API
			// If the user is not found, remove specific roles
			if (getResponse.status === 404) {
				const rolesToRemove: string[] = [];

				if (member.roles.cache.has(config.confirmedUserRoleId)) {
					rolesToRemove.push(config.confirmedUserRoleId);
					logs.push(`🧹 Rôle <@&${config.confirmedUserRoleId}> de ${member} **supprimé**.`);
				}
				if (member.roles.cache.has(config.nonConfirmedUserRoleId)) {
					rolesToRemove.push(config.nonConfirmedUserRoleId);
					logs.push(`🧹 Rôle <@&${config.nonConfirmedUserRoleId}> de ${member} **supprimé**.`);
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

			// Handling rate limiting by pausing the process
			else if (getResponse.status === 429) {
				await interaction.followUp({
					content: "⚠️ Rate limit atteint. Pause de 60 secondes",
					flags: MessageFlags.Ephemeral,
				});
				actions++;
				await this.client.functions.delay(60 * 1000);
			}

			// If the user exists, ensure they have the correct roles
			else if (getResponse.status === 200) {
				const getResponseJson = await getResponse.json() as responseJson;

				// Ensure the user has a document in the LinkedUser collection
				const linked = await LinkedUser.findOne({ discordId: member.id });
				// If not, create one
				if (!linked) {
					await LinkedUser.create({
						discordId: member.id,
						siteId: getResponseJson.userId,
						discordUsername: member.user.username,
						roles: getResponseJson.roles,
					});
					logs.push(`🆕 Le membre ${member} apparaît comme lié dans l'API, mais n'a pas de document à son nom dans la BDD. Document créé.`);
				} else {
					// If exists but roles differ, update the document
					const rolesApi = getResponseJson.roles ?? [];
					const rolesDb = linked.roles;
					const rolesDiffer = rolesApi.length !== rolesDb.length || !rolesApi.every(role => rolesDb.includes(role));
					if (rolesDiffer) {
						await LinkedUser.findOneAndUpdate(
							{ discordId: member.id },
							{ roles: rolesApi },
						);
						logs.push(`🔄 Les rôles du membre ${member} ont été mis à jour dans la BDD.`);
					}
				}

				// Assign roles based on the user's status from the external API
				const hasEsperluette = member.roles.cache.has(config.confirmedUserRoleId);
				const hasGraine = member.roles.cache.has(config.nonConfirmedUserRoleId);
				const rolesApi = getResponseJson.roles ?? [];

				if (!hasEsperluette && rolesApi.includes("user-confirmed")) {
					await member.roles.add(config.confirmedUserRoleId);
					actions++;
					logs.push(`<:round_check:1424065559355592884> Rôle Esperluette de ${member} ajouté.`);
				}
				else if (!hasGraine && rolesApi.includes("user")) {
					await member.roles.add(config.nonConfirmedUserRoleId);
					actions++;
					logs.push(`<:round_check:1424065559355592884> Rôle Graine de ${member.user.username} ajouté.`);
				}
			}

			else {
				logs.push(`⚠️ Erreur inconnue pour ${member}`);
			}

			// Sending logs in batches to avoid message length limits
			if (logs.length >= 10) {
				await interaction.followUp({
					content: logs.join("\n"),
					flags: MessageFlags.Ephemeral,
				});
				logs = [];
			}

			// Pausing every 40 iterations to respect rate limits
			i++;
			if ((i + 1) % 40 === 0 || (actions > 0 && actions % 40 === 0)) {
				await interaction.editReply({
					content: ` Pause de 4 secondes après \`${i + 1}\` itérations et \`${actions}\` actions.`,
				});
				await this.client.functions.delay(4000);
			}
		}

		// Final log output after processing all members
		if (logs.length) {
			await interaction.followUp({
				content: logs.join("\n"),
				flags: MessageFlags.Ephemeral,
			});
		}

		// Final summary of the command execution
		await interaction.followUp({
			content: `<:round_check:1424065559355592884> Commande terminée après ${i + 1} itérations et \`${actions}\` actions.`,
			flags: MessageFlags.Ephemeral,
		});

	}
}
