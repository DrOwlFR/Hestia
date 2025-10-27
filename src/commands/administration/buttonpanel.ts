import type { ChatInputCommandInteraction, PermissionsBitField, TextChannel } from "discord.js";
import { ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags, PermissionFlagsBits, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";
import stripIndent from "strip-indent";

export class ButtonsPanelCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "buttonspanel",
			description: "Envoie le panneau du bouton des IRLs.",
			category: "Administration",
			usage: "buttonspanel",
			examples: ["buttonspanel"],
		});
	}

	async execute(interaction: ChatInputCommandInteraction) {

		if (!this.client.admins.find(id => id === interaction.user.id) || !(interaction.member?.permissions as PermissionsBitField).has(PermissionFlagsBits.Administrator)) {
			return interaction.reply({
				content: "<:round_cross:1424312051794186260> Vous n'avez pas les permissions requises pour utiliser cette commande.",
				flags: MessageFlags.Ephemeral,
			});
		}

		await (interaction.channel as TextChannel).send({
			components: [
				new ContainerBuilder()
					.setAccentColor(0xA4345C)
					.addTextDisplayComponents(
						new TextDisplayBuilder()
							.setContent("# Formulaire d'entrée\nBien ! Maintenant que vous avez lu le règlement et ses petites lignes, il est temps de signer ! Cochez les cases suivantes, pour :"),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setDivider(true)
							.setSpacing(SeparatorSpacingSize.Large),
					)
					.addSectionComponents(
						new SectionBuilder()
							.addTextDisplayComponents(
								new TextDisplayBuilder()
									.setContent(stripIndent(`
										## Accepter le règlement
										Cochez la case verte (bouton vert) pour accepter le règlement et connecter votre compte Discord au site du Jardin en renseignant le code de vérification fourni par le site pour obtenir votre rôle d'Esperluette ou de Graine.\n
										❓ **Note** : le code de vérification s'obtient via le bouton « Lier » sur votre page de profil sur le site.
										`)),
							)
							.setButtonAccessory(
								new ButtonBuilder()
									.setCustomId("rulesAcceptButton")
									.setStyle(ButtonStyle.Success)
									.setLabel("Accepter")
									.setEmoji("✅"),
							),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setDivider(true)
							.setSpacing(SeparatorSpacingSize.Large),
					)
					.addSectionComponents(
						new SectionBuilder()
							.addTextDisplayComponents(
								new TextDisplayBuilder()
									.setContent(stripIndent(`
										## Accès au salon des IRLs
										Cochez la case bleue (bouton bleu) pour obtenir les accès aux évènements de rencontres des Esperluettes (appelés « retraites », « cousinades »...) dans la vie réelle (= *in real life* : IRL).\n
										❗** Rappel des critères ** : 2 mois d'ancienneté et 300 messages envoyés.
										❓ **Note** : vous pouvez décider d'enlever ce rôle à tout moment en cliquant de nouveau sur le bouton bleu.
										`)),
							)
							.setButtonAccessory(
								new ButtonBuilder()
									.setCustomId("irlRoleButton")
									.setStyle(ButtonStyle.Primary)
									.setLabel("Obtenir l'accès")
									.setEmoji("🤝"),
							),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setDivider(true)
							.setSpacing(SeparatorSpacingSize.Large),
					)
					.addSectionComponents(
						new SectionBuilder()
							.addTextDisplayComponents(
								new TextDisplayBuilder()
									.setContent(stripIndent(`
										## Déconnecter votre compte Discord du site
										Cochez la case rouge (bouton rouge) pour déconnecter votre compte Discord de votre compte sur le site.\n
										⚠️ **Attention** : vous perdrez l'accès aux différents salons du Manoir (Discord).
										`)),
							)
							.setButtonAccessory(
								new ButtonBuilder()
									.setCustomId("disconnectButton")
									.setStyle(ButtonStyle.Danger)
									.setLabel("Déconnecter")
									.setEmoji("⛓️‍💥"),
							),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		}).catch(err => {
			interaction.reply({
				content: "<:round_cross:1424312051794186260> Le panel ne s'est pas envoyé suite à une erreur. Veuillez contacter le développeur.",
				flags: MessageFlags.Ephemeral,
			});
			// eslint-disable-next-line no-console
			return console.error(err);
		});

		return interaction.reply({ content: "<:round_check:1424065559355592884> Panel du button des IRLs envoyé avec succès.", flags: MessageFlags.Ephemeral });
	}
}
