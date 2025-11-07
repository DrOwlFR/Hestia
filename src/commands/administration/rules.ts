import type { ChatInputCommandInteraction, PermissionsBitField, TextChannel } from "discord.js";
import { ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags, PermissionFlagsBits, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../structures/config";

export class RulesCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "rules",
			description: "Envoie les règles du Jardin.",
			category: "Administration",
			usage: "rules",
			examples: ["rules"],
		});
	}

	async execute(interaction: ChatInputCommandInteraction) {

		if (!this.client.admins.find(id => id === interaction.user.id) && !(interaction.member?.permissions as PermissionsBitField).has(PermissionFlagsBits.Administrator)) {
			return interaction.reply({
				content: "<:round_cross:1424312051794186260> Vous n'avez pas les permissions requises pour utiliser cette commande.",
				flags: MessageFlags.Ephemeral,
			});
		}

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		await (interaction.channel as TextChannel).send({
			components: [
				new ContainerBuilder()
					.setAccentColor(config.colorPrimary)
					.addTextDisplayComponents(
						new TextDisplayBuilder()
							.setContent(stripIndent(`
								# Bienvenue dans le Manoir du Jardin des Esperluettes !
								Ce serveur Discord est un satellite du site éponyme, que vous pouvez découvrir juste ici : [Jardin des Esperluettes](https://jd-esperluettes.fr/). Nous appelons ce serveur le Manoir (une enclave au milieu du Jardin que représente le site).

								❗**Attention** : **seules les Esperluettes et les Graines d’Esperluettes avec un compte sur le site peuvent séjourner entre ces murs**. Pour plus de clarté, veuillez par ailleurs utiliser le même pseudo partout dans le Jardin (vous pouvez changer votre pseudo Discord pour ce serveur uniquement) 👍

								> ❗  Attention, des détails de ces règles de vie peuvent être sujets à changement puisque la communauté est encore en phase de croissance 🌱. Nous vous informerons le cas échéant et vous serez alors tenus de vous mettre à jour.
						`)),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				new ContainerBuilder()
					.setAccentColor(config.colorAccent)
					.addTextDisplayComponents(
						new TextDisplayBuilder()
							.setContent(stripIndent(`
								## Règlement
								Sachez maintenant que nous tenons à ce que le manoir et ses différents espaces, intérieurs comme extérieurs, restent bien rangés. Alors, pour éviter de vous attirer la terrible colère des <@&${config.adminRoleId}> (administrateur·rice·s) ou de vous faire arrêter par les <@&${config.modRoleId}> (modérateur·rice·s), voici quelques instructions à suivre :

								* Pour des raisons de sécurité et de légalité, **ce serveur Discord est réservé aux personnes de plus de 15 ans**. C’est pourquoi nous vous demandons votre âge dans votre présentation ; tout mensonge entraînera un bannissement immédiat (vous pouvez cependant nous donner une fourchette si vous avez largement dépassé cet âge limite). De plus, il est demandé aux personnes majeures de bien vouloir adopter un comportement responsable envers les plus jeunes.

								* Sont strictement interdits : les messages de diffamation ou de menaces, les contenus à caractère pornographique, les incitations à la haine ou la violence, les discriminations en raison de l'ethnie, de la religion, de l’orientation sexuelle ou du genre, l’apologie du nazisme ou la contestation de crimes contre l’humanité. Soit, globalement : **est interdit tout contenu illicite et/ou portant atteinte à autrui**.
								❗ Sont également interdits : le prosélytisme et les discussions politiques ouvertement partisanes.

								* **Merci de vous adresser aux autres Esperluettes avec bienveillance et considération en toutes circonstances**. Si un message ou un sujet abordé vous met mal à l’aise ou vous blesse, vous pouvez le signaler directement dans la discussion incriminée sur le serveur ou, si vous n’osez pas, en contactant **l’équipe** :
								  * les <@&${config.adminRoleId}> : <@${config.adminsDiscordIds[0]}>, <@${config.adminsDiscordIds[1]}> et <@${config.adminsDiscordIds[2]}>,
								  * les <@&${config.modRoleId}> du Discord : <@${config.discordModsIds[0]}>, <@${config.discordModsIds[1]}> et <@${config.discordModsIds[2]}>,
								  * *<@${config.siteModsIds[0]}>, <@${config.siteModsIds[1]}> et <@${config.siteModsIds[2]}> sont quant à eux les Cadratins du site*.
								❓ **Note** : si le ton monte, il est possible de demander à ce que l’équipe vous transfère temporairement dans une zone de calme, à l’écart du reste de serveur, afin que vous puissiez décompresser.
								❗ **Attention** : en cas de problème grave et/ou qui persiste, vous recevrez un avertissement puis, à terme, si votre comportement ne change pas, vous serez banni·e du Jardin.
						`)),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				new ContainerBuilder()
					.setAccentColor(config.colorAccent)
					.addTextDisplayComponents(
						new TextDisplayBuilder()
							.setContent(stripIndent(`
								* **Nous décourageons la publicité personnelle**. De fait, merci de ne partager vos créations que dans les endroits dédiés, dans la section Atelier, en respectant les règles qui y sont épinglées (📍) et sous réserve de participation à la vie de la communauté.
								❗ **À savoir** : tout contenu partagé sur ce serveur ou sur le site, appartient strictement à l’Esperluette qui l’a créé. Les règles usuelles de propriété intellectuelle s’appliquent.
								❓**Note** : vos réseaux sociaux peuvent figurer uniquement dans votre message de présentation. Globalement, l’utilisation des services du Jardin à des fins commerciales ou conduisant à toute autre forme de rémunération est interdite.

								* Le Jardin des Esperluettes est un espace dédié à la création en langue française. L’utilisation d’autres langues ou d’abréviations dans les discussions sur ce serveur est fortement découragée.
								❗ Attention également à ne pas spammer : les réactions sont à privilégier aux messages contenant uniquement des émojis, et les gifs sont à utiliser avec modération.

								* Si jamais un message commence par « Modération : », il doit être pris en compte et aussitôt appliqué. Nous précisons cependant que ce n'est pas parce que nous vous reprenons que vous nous êtes moins sympathiques à titre individuel : une demande de la modération n’est pas une punition ou un « mauvais point », c’est seulement une démarche pour rendre le Jardin le plus agréable possible pour toutes les Esperluettes.
								❗ De fait, la modération se réserve le droit d'interrompre toute conversation ou débat susceptible de déclencher stress, tension ou malaise, y compris sur des sujets qui ne sont pas traités explicitement dans ce règlement.
						`)),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				new ContainerBuilder()
					.setAccentColor(config.colorSecondary)
					.addTextDisplayComponents(
						new TextDisplayBuilder()
							.setContent(stripIndent(`
								## Comment accéder au reste du serveur ?
								**Pour accéder au serveur, il vous sera demandé d'accepter le règlement en cliquant sur le bouton vert dédié que vous propose notre robot concierge, Hestia** (voir en bas du salon). **Vous vous engagerez alors à toujours respecter et appliquer les demandes de la modération.** Si vous souhaitez demander un éclaircissement ou soulever un problème, merci de contacter – poliment – en privé un membre de l'équipe (Cadratin du Discord ou Majuscule).
								❓ **Note** : le bouton vous demandera un code de vérification que vous pourrez obtenir sur le site (en cliquant sur bouton « Lier » sur votre page de profil), ceci afin de s’assurer que vous possédez un compte sur le Jardin avant d’entrer sur le serveur et de vous ajouter le rôle correspondant. Vous pourrez vous déconnecter à tout moment en cliquant sur le bouton rouge (voir en bas du salon), mais attention : vous perdrez l’accès aux salons du Discord.

								Vous êtes maintenant cordialement invité·e à enlever vos chaussures pour profiter de l'⁠<#${config.antechamberChannelId}> et vous présenter dans la ⁠<#${config.portraitGaleryChannelId}> <:content:1400469496325607454>
								**Notez que tant que vous êtes une <@&${config.seedRoleId}>, seule cette section Antichambre vous sera accessible**.
								`)),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				new ContainerBuilder()
					.setAccentColor(config.colorTertiary)
					.addTextDisplayComponents(
						new TextDisplayBuilder()
							.setContent(stripIndent(`
								## Point vocabulaire : les rôles sur le Serveur
								* <@&${config.adminRoleId}> : ce sont nos admin·e·s. Ielles gèrent le site et la modération.
								* <@&${config.modRoleId}> : ce sont nos modos discord et site qui veillent à ce que tout se passe bien et à ce que tout le monde soit sage 😉

								* <@&${config.arobaseRoleId}> \`(rôle temporaire)\` : ce sont les petits doigts qui travaillent en coulisses sur le site et/ou les outils annexes comme Hestia (développeur·euse·s, graphistes, alpha-testeur·euse·s, etc.).
								* <@&${config.guillemetRoleId}> \`(rôle temporaire)\` : ce sont les petits doigts qui travaillent en coulisses sur les initiatives « non techniques » (concours, visuels, lore, pages du site comme la FAQ ou le guide Cultiver un commentaire, etc.).

								* <@&${config.ampersandRoleId}> : c'est le nom que nous donnons à nos membres. Nous sommes tous·tes ici des Esperluettes (ou des &) !
								* <@&${config.seedRoleId}> : c’est le nom que l’on donne aux primo-arrivant·e·s en période de probation !
								`)),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				new ContainerBuilder()
					.setAccentColor(config.colorAccent)
					.addTextDisplayComponents(
						new TextDisplayBuilder()
							.setContent(stripIndent(`
								## Point contenu : les trigger-warnings
								Ci-dessous, les **contenus à éviter** :
								* spoilers de livres/films/séries (logique)
								* gifs clignotants ou très rapides, pour les & photosensibles
								* contenu violent (a fortiori contenu autour des violences sur animaux, des violences sexuelles, de la torture)
								* contenu à caractère médical, notamment autour des soucis aux yeux, de la dermatillomanie, et des photos de blessures ou de seringues
								* images des bébêtes suivantes : araignées, mantes religieuses, guêpes, frelons
								* décès d'un·e proche
								* discussion poussée ou récurrente autour de personnalités ou d’auteur·rice·s aux agissements ou paroles problématiques (ex : JKR, Neil Gaiman…)
								* les blagues autour des substances addictives / de l'addiction ; les mentions sont okay, mais à ne pas prendre à la légère ou tourner en dérision
								* les images plein de petits trous (i.e. trypophobie)
								* les images de ventre de personne enceinte et les descriptions trop précises des sensations de la grossesse
								* toute discussion d'un ||cours|| de piscine (||apprendre à nager, maître-nageur||, etc.) : ***❗ attention**, ceci est un trigger majeur d'une &, respectez la même logique de termes sous spoiler que dans cet avertissement*
								❓ **Rappel** : ces contenus ne sont pas interdits, il faut seulement qu'ils soient cachés sous balises spoiler (ajouter \\|| de chaque côté du texte à cacher : ||exemple||, et cliquer sur l'icône « œil » quand vous téléversez une image) ET qu'ils soient signalés par un avertissement explicite.

								❓ **Note** : Pour les <@&${config.ampersandRoleId}> confirmées, vous avez normalement accès à un fil dans ce salon contenant le pad à compléter si vous avez également des sujets sensibles/triggers personnels à signaler. Pour les <@&${config.seedRoleId}>, patience ! Pour des raisons de partage d'informations sensibles, le pad ne vous est pas encore accessible. Contactez directement l'équipe s'il y a un sujet dont vous tenez absolument à nous faire part 👍
								`)),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				new ContainerBuilder()
					.setAccentColor(config.colorPrimary)
					.addTextDisplayComponents(
						new TextDisplayBuilder()
							.setContent(stripIndent(`
								## Point accès  : les salons restreints
								Sur le serveur, nous possédons un salon pour les **rencontres IRL** (= *In Real Life* : dans la vraie vie). Pour y accéder, il faudra cliquer sur le bouton bleu dédié proposé par Hestia (voir en bas du salon). Elle vous donnera le rôle automatiquement si vous répondez aux critères d’accès.
								❗ **Critères** : au minimum 2 mois d’ancienneté et 300 messages envoyés.

								Il existe également le Fumoir, un salon restreint contenant les discussions à caractère sérieux et sensible (qui sont à éviter dans le reste du Manoir). L’obtention du rôle d’accès est automatique dès lors que vous dépassez 50 messages envoyés durant les 30 derniers jours.
								❓ **Note** : Le système d’obtention s’effectue automatiquement tous les jours à 2 h du matin. Si vous dépassez les 50 messages au cours d’une journée, il faudra attendre le lendemain pour voir apparaître le salon.
								`)),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				new ContainerBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder()
							.setContent("ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ"),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setDivider(false)
							.setSpacing(SeparatorSpacingSize.Small),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});

		await (interaction.channel as TextChannel).send({
			components: [
				new ContainerBuilder()
					.setAccentColor(config.colorTertiary)
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
		});

		return interaction.editReply({ content: "<:round_check:1424065559355592884> Les règles ont été envoyées correctement." });
	}
}
