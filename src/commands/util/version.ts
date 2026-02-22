import { type ChatInputCommandInteraction, ContainerBuilder, Guild, MessageFlags, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";
import stripIndent from "strip-indent";

import { versionsSelectMenu } from "../../structures/utils/versionsMessages";

export class VersionCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "version",
			description: "Affiche un menu pour naviguer entre les différentes notes de patch des versions.",
			category: "Divers",
			usage: "version",
			examples: ["version"],
		});
	}

	/**
	 * Execute: main handler for the `version` command.
	 * Summary: Sends messages with a select menu to view patch notes for different bot versions,
	 * Steps:
	 * - Check if guild is valid
	 * - Reply with an embed containing instructions
	 * - Include a select menu component for version selection
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		// Ensure the interaction is within a guild
		const { guild } = interaction;
		if (!(guild instanceof Guild)) return;

		// Reply with the versions messages and select menu
		await interaction.reply({
			components: [
				new ContainerBuilder()
					.setAccentColor(0x26c4ec)
					.addSectionComponents(
						new SectionBuilder()
							.addTextDisplayComponents(
								new TextDisplayBuilder()
									.setContent(stripIndent(`
										## Notes de patch des versions
										Utilisez le menu déroulant ci-dessous pour naviguer entre les différentes notes de patch des versions d'Hestia.
										
										Vous y trouverez des informations détaillées sur les nouvelles fonctionnalités, les améliorations et les corrections de bugs apportées à chaque version.
										
										❗**Notes** : 
										- Parfois vous trouverez des noms entre parenthèses, il s'agit des personnes qui m'ont fait remonter le bug ou suggéré l'amélioration ! Merci à eux ! 🩵
										- Certaines versions sont marquées comme "beta" car elles ont été déployées en tant que versions de test avant une sortie officielle jugée stable.
										- Certains correctifs mineurs et/ou purement techniques peuvent ne pas être listés, pour une liste exhaustive, consultez les journaux complets à la fin des notes.
					`)))
							.setThumbnailAccessory(
								new ThumbnailBuilder()
									.setURL(this.client.user?.displayAvatarURL() || ""),
							),
					),
				versionsSelectMenu,
			],
			flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
		});
	}
}
