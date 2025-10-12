import { Command } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { type ChatInputCommandInteraction, GuildMember, MessageFlags } from "discord.js";
import { responseJson } from "../../types";
import config from "../../structures/config";
import { LinkedUser } from "../../structures/database/models";

export class CleaningRolesCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "cleaningroles",
			description: "Retire le rôle & aux membres qui ne sont pas connectés au site.",
			category: "Dev",
			adminsOnly: true,
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
				if (member.roles.cache.find(r => r.id === config.ampersandRoleId)) {
					member.roles.remove(config.ampersandRoleId);
					console.log(`Rôle esperluette de ${member.user.username} supprimé`);
					actions++;
				}
				else if (member.roles.cache.find(r => r.id === config.seedRoleId)) {
					member.roles.remove(config.seedRoleId);
					console.log(`Rôle graine de ${member.user.username} supprimé`);
					actions++;
				}
			} else {
				if (!await LinkedUser.findOne({ discordId: member.id })) {
					await interaction.followUp({
						content: `⚠️ Le membre ${member} apparaît comme lié dans l'API, mais n'a pas de document à son nom dans la BDD.`,
						flags: MessageFlags.Ephemeral,
					});
				}
				const getResponseJson = await getResponse.json() as responseJson;

				if (!member.roles.cache.find(r => r.id === config.ampersandRoleId) && getResponseJson.roles!.find(r => r === "user-confirmed")) {
					member.roles.add(config.ampersandRoleId);
					console.log(`Rôle esperluette de ${member.user.username} ajouté`);
					actions++;
				} else if (!member.roles.cache.find(r => r.id === config.seedRoleId) && getResponseJson.roles!.find(r => r === "user")) {
					member.roles.add(config.seedRoleId);
					console.log(`Rôle graine de ${member.user.username} ajouté`);
					actions++;
				}
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
