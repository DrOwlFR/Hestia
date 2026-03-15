import { ActionRowBuilder, ContainerBuilder, SectionBuilder, StringSelectMenuBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import type { ShewenyClient } from "sheweny";
import stripIndent from "strip-indent";

import config from "../config";

// Select menu component for version selection
export const versionsSelectMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
	.addComponents(
		new StringSelectMenuBuilder()
			.setCustomId("versionsSelectMenu")
			.setPlaceholder("Sélectionnez une version pour voir les notes de patch")
			.setMaxValues(1)
			.addOptions([
				{ label: "v1.6.2", description: "Dernière version en date", value: "1.6.2" },
				{ label: "v1.6.1", description: "Première version stable", value: "1.6.1" },
				{ label: "v1.6.0-beta", value: "1.6.0-beta" },
				{ label: "v1.5.1-beta", value: "1.5.1-beta" },
				{ label: "v1.5.0-beta", value: "1.5.0-beta" },
				{ label: "v1.4.0-beta", value: "1.4.0-beta" },
				{ label: "v1.3.1-beta", value: "1.3.1-beta" },
				{ label: "v1.3.0-beta", value: "1.3.0-beta" },
				{ label: "v1.2.1-beta", value: "1.2.1-beta" },
				{ label: "v1.2.0-beta", value: "1.2.0-beta" },
				{ label: "v1.1.1-beta", value: "1.1.1-beta" },
				{ label: "v1.1.0-beta", value: "1.1.0-beta" },
				{ label: "v1.0.1-beta", value: "1.0.1-beta" },
				{ label: "v1.0.0-beta", description: "Version initiale du bot", value: "1.0.0-beta" },
			]),
	);

// Function returning embeds for version patch notes
export const versionsMessages = (client: ShewenyClient) => ({
	"1.6.2": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.6.2
							*(15 mars 2026)*
							### ➕ Ajout
							- \`[règles de vie]\` - Ajout du logo du Jardon dans le premier message des règles de vie (qui changera selon les saisons)
							### 🔨 Corrections & Modifications
							- \`[commande "checkintroduced"]\` - La commande ne liste plus les membres qui n'ont pas lié leur compte Discord au site (plus pertinent, puisqu'ils ne peuvent pas accéder au salon de présentation sans compte lié)
							- \`[commande statistics file]\` - Ajout de l'heure dans le nom du fichier exporté.
							- \`[saisons]\` - Correction de la date de début de l'hiver.

							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.6.1...v1.6.2)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.6.1": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.6.1
							*(22 février 2026)*
							Sortie de la période de bêta, cette version est désormais considérée comme stable !
							-# Ce changement intervient après l'augmentation de mes disponibilités, qui me permettent de corriger plus rapidement les bugs, rendant la période de bêta moins pertinente.
							### ➕ Ajouts
							- \`[présentation]\` - Ajout d'un système qui vérifie que les membres se sont présentés
							  - \`[commande "checkintroduced"]\` - Création. Elle permet de lister les membres qui n'ont pas encore posté de présentation dans le salon <#${config.portraitGaleryChannelId}>, avec la possibilité de les notifier (réservée à l'équipe du Jardin)
							- \`[commande statistics channels]\` - Création. Elle permet de visualiser les statistiques d'un salon (ou tous les salons) pour le mois en cours
							- \`[commande statistics file]\` - Création. Elle permet d'exporter les statistiques sous forme de fichier (réservée à l'équipe du Jardin)
							### 🔨 Corrections & Modifications
							- \`[commande "botinfo"]\` - Ajout du crédit de <@${config.adminsDiscordIds[2]}> pour la photo de profil d'Hestia dans la commande
							- \`[statut animé]\` - Ajout du crédit de <@${config.adminsDiscordIds[2]}> pour la photo de profil d'Hestia
							  -# - Le statut animé correspond aux messages qui défilent sous le pseudo d'Hestia, dans la liste des membres du serveur.
							- \`[général]\` - Amélioration de la formulation de certaines réponses du bot
							-# - \`[tâche "nettoyage de la base de données"]\` - Amélioration de la rapidité d'exécution du nettoyage quotidien de la base de données

							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.6.0-beta...v1.6.1)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.6.0-beta": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.6.0-beta - __Les Saisons !__
							*(24 janvier 2026)*
							### 🚀 La grande nouveauté
							Les **saisons** sont arrivées à la conciergerie ! Les liserés de couleur des règles de vie changeront au fil du calendrier, comme sur le site !
							-# ça parait pas mais c'était un enfer à coder pour si peu, appréciez ce système s'il vous plaît 🥲
							### ➕ Ajouts
							- \`[règles de vie]\` - Changement automatique des liserés de couleur (le même thème que sur le site) selon les saisons
							- \`[commande "version"]\` - Création. Elle permet de naviguer dans les anciennes notes de patch
							- \`[commande "editrules"]\` - Création. Elle permet d'éditer facilement les messages des règles de vie sans avoir à les reposter (admins et devs uniquement)
							- \`[commande "sendpatchnotes"]\` - Qui me permet de faire envoyer les notes de patch par Hestia elle-même
							- \`[statistiques]\` - Ajout d'un système pour compter le nombre de messages envoyés par salon et par mois (mise à jour de la politique de confidentialité en accord avec ces nouvelles données stockées)
							-#  - \`[technique]\` - Ajout de documentation dans tous les fichiers du code, pour le rendre plus lisible à d'autres personnes que moi
							### 🔨 Corrections & Modifications
							- \`[commande "botinfo"]\` - Ajout d'une nouvelle info spéciale dans le lore d'Hestia
							- \`[bouton "accepter le règlement"]\` - Correction du message d'erreur
							- \`[bouton "IRL"]\` - Ajout d'un message d'erreur visuel en cas d'erreur de la base de données
							- \`[commande "ping"]\` - Passage à une réponse "éphémère" (i.e., seulement visible par celui qui lance la commande)
							- \`[déconnexion du site]\` - Tous les rôles sont à présent supprimés, sans tenir compte du statut
							- \`[base de données]\` - Ajout du stockage de vos rôles sur le site (sert à détecter les promotions lors du nettoyage nocturne)
							
							-# PS : Je vous le tease maintenant, la prochaine grosse feature sera probablement le système de **notifications** !

							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.5.1-beta...v1.6.0-beta)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.5.1-beta": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.5.1-beta
							*(8 janvier 2026)*
							### 🔨 Corrections & Modifications
							- \`[règles-de-vie]\` - Ajout d'un nouveau trigger-warning (Rimeko)
							- \`[connexion au site]\` - Correction de l'identifiant brut qui apparaissait dans le message de confirmation des Esperluettes (Chablaj)
							- \`[fumoir]\` - Ajout d'une vérification pour éviter de donner le rôle du Fumoir aux Graines (Tous les Cadratins qui ont crié au scandale)
							- \`[rôle IRL]\` - Ajout d'une vérification pour éviter de donner le rôle du Fumoir aux Graines
							
							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.4.0-beta...v1.5.0-beta)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.5.0-beta": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.5.0-beta
							*(7 novembre 2025)*
							### ➕ Ajout
							- \`[développement]\` - Ajout de dépendances de développement pour cadrer les intitulés des modifications du code
							### 🔨 Corrections & Modifications
							- \`[règles-de-vie]\`
							  - Correction d'un mot en trop
							  - Ajout de nouveaux trigger-warnings (Rimeko)
							  - Correction du formatage pour les spoilers (Lily)
							- \`[fumoir]\` - Amélioration du code pour récupérer tous les membres, mêmes ceux qui ne sont pas dans le cache de Discord, évitant les suppressions de document involontaires
							- \`[commande \`*\`/cleaningroles\`*\`]\` - Optimisation en prévision de demain
							### ➖ Suppression
							- \`[commande \`*\`/buttonspanel\`*\`]\` - Suppression de la commande obsolète, maintenue inclue dans la commande *\`rules\`*
							
							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.4.0-beta...v1.5.0-beta)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.4.0-beta": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.4.0-beta
							*(2 novembre 2025)*
							### ➕ Ajout
							- \`[commande \`*\`/editMessage\`*\`]\` - Pour éditer les messages du bot sans avoir à les reposter
							### 🔨 Corrections & Modifications
							- \`[règles-de-vie]\`
							  - Modification d'une partie du texte présentant l'équipe pour plus de clarté (François·6po)
							  - Correction de l'émoji ${config.emojis.content} qui n'apparaissait pas correctement (Dewen)
							### ➖ Suppression
							- \`[salon #conciergerie]\` - Obsolète depuis l'intégration des boutons dans les messages des règles de vie 🫡
							
							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.3.1-beta...v1.4.0-beta)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.3.1-beta": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.3.1-beta
							*(2 novembre 2025)*
							### 🔨 Corrections & Modifications
							- \`[règles-de-vie]\` - Changement d'un index dans le code qui empêchait la mention de Soah (Rimeko)
							-# Promis c'était pas fait exprès Soah patapé
							- \`[tâches]\`
							  - \`[sauvegarde]\` - Correction d'une erreur qui empêchait la tâche de sauvegarde hebdomadaire de la base de données de s'exécuter correctement
							  - \`[fumoir]\` - Correction d'une erreur qui empêchait la boucle du fumoir de s'exécuter correctement
								
							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.3.0-beta...v1.3.1-beta)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.3.0-beta": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.3.0-beta
							*(1 novembre 2025)*
							### ➕ Ajout
							- \`[commande \`*\`/rules\`*\`]\` - Création de la commande
							- \`[politique de confidentialité]\` - Ajout de la politique de confidentialité pour le bot
								- Ajout du lien vers cette politique dans la commande \`/botinfo\` (également présente dans la description du profil d'Hestia)
							### 🔨 Corrections & Modifications
							- \`[commandes \`*\`/cleaningRoles\`*\`, \`*\`/emit\`*\`, \`*\`/getLinkedUser\`*\`]\` - Ajout des usages et des exemples d'utilisation (Joanne)
							- \`[commande \`*\`/buttonspanel\`*\`]\` - Modification de la description de la commande
							- \`[tâches]\`
							  - \`[fumoir]\` - Optimisation du code
							  - \`[sauvegarde de la base de données]\` - Optimisation du code
							  - \`[nettoyage de la base de données]\` - Elle supprime maintenant les rôles d'accès (@de salon, etc.) des utilisateurs non connectés au site
							- \`[base de données]\` - Ajout du stockage du nom d'utilisateur Discord dans les documents
							- \`[status du bot]\` - Le compteur de membres affiche maintenant uniquement les membres du Jardin
							- \`[global]\`
							  - Déplacement des IDs Discord dans le fichier de configuration pour les cacher
							  - Correction de certains emojis (Joanne)
							  - Ajouts de roleplay dans les réponses automatiques des permissions manquantes (Joanne)
							### ➖ Suppression
							- \`[commande \`*\`/connect\`*\`]\` - Suppression de la commande obsolète
							- \`[commande \`*\`/disconnect\`*\`]\` - Suppression de la commande obsolète
							
							PS : La base de données des compteurs de messages a été vidée. Les dates antérieures à celle de l'ouverture (aujourd'hui) n'y sont plus (Maeghan 👀)
							
							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.2.1-beta...v1.3.0-beta)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.2.1-beta": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.2.1-beta
							*(27 octobre 2025)*
							### 🔨 Corrections & Modifications
							- \`[commande \`*\`/buttonspanel\`*\`]\` - Correction de la condition interdisant l'utilisation de la commande, , qui était incorrecte et empêchait les administrateurs du bots qui ne sont pas administrateurs du serveur d'utiliser la commande, et vice versa
							- \`[règles-de-vie]\` - Ajout d'une conditon au bouton "Accepter le règlement" qui empêche le formulaire de s'afficher si le compte Discord est déjà connecté au site (Rimeko)
							
							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.2.0-beta...v1.2.1-beta)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.2.0-beta": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.2.0-beta
							*(27 octobre 2025)*
							### ➕ Ajouts
							- \`[commande \`*\`/say\`*\`]\` - Création de la commande, pour faire parler le bot
							- \`[status du bot]\` - Ajout de l'affichage des membres totaux, et le nombre de membres possédant les rôles \`Esperluette\` et \`Graine\`
							- \`[règles-de-vie]\` - Création du bouton et du formulaire qui remplaceront la commande \`/connect\` à l'avenir
							- \`[règles-de-vie]\` - Création du bouton et du formulaire qui remplaceront la commande \`/disconnect\` à l'avenir
							- \`[déconnexion au site]\` - La déconnexion supprime maintenant les rôles d'accès (\`@de salon\`, \`@d'atelier\`, etc.)
							- \`[IRL]\` - Le rôle d'accès aux IRLs peut maintenant être retiré par les membres eux-mêmes (via le bouton dans les règles de vie)
							- Ajout d'un lien de monitoring du bot : https://watchbot.fr/status/1423709000456737002
							### 🔨 Corrections & Modifications
							- \`[commande \`*\`/ping\`*\`]\` - Ajout de l'affichage de la latence de la base de données
							- \`[commande \`*\`/botinfo\`*\`]\` - Ajout de nouvelles informations
							- \`[commande \`*\`/buttonspanel\`*\`]\` - Réécriture complète de la commande (accessible aux admins) pour accueillir le nouveau système de connexion/déconnexion au site
							- \`[base de données]\` - Changement du lien de connexion qui causait des erreurs d'accès et qui empêchait notamment les connexions au site
							- \`[global]\` - Modification de toutes les réponses du bot pour être plus roleplay (Joanne)
							
							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.1.1-beta...v1.2.0-beta)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.1.1-beta": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.1.1-beta
							*(13 octobre 2025)*
							### 🔨 Correction
							- Changement de place de certaines variables du Client et de fonctions pour faciliter le développement futur et les masquer dans le fichier de configuration
							
							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.1.0-beta...v1.1.1-beta)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.1.0-beta": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.1.0-beta
							*(12 octobre 2025)*
							### ➕ Ajouts
							- \`[tâches]\`
							  - \`[fumoir]\` - Création de la tâche. Comptage des messages par jour sur une période de 30 jours (et suppression des entrées de plus de 30 jours). Tous les jours à 2h du matin.
							  - \`[sauvegarde de la base de données]\` - Création de la tâche. Tous les lundis à 3h du matin.
							  - \`[nettoyage de la base de données]\` - Création de la tâche, suppression des documents inutiles. Tous les jours à 1h du matin.
							### 🔨 Corrections & Modifications
							- \`[IRL]\` - Modification de la comparaison des dates. Comparaison entre la date au moment de l'appui sur le bouton, et la date d'arrivée sur le serveur, pour éviter les faux négatifs.
							-# - \`[base de données]\` - Modification de la création des documents, pour gagner en lignes de code et en performance.
							-# - \`[global]\` - Ajout de la possibilité de lecture des évènements \`guildMemberAdd\` et \`guildMemberRemove\`
							
							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.0.1-beta...v1.1.0-beta)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.0.1-beta": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.0.1-beta
							*(11 octobre 2025)*
							Les informations contenues dans cette version sont des améliorations techniques n'affectant pas l'utilisateur. Inutile de la lire.
							### 🔨 Corrections & Modifications
							-# - \`[global]\` - Ajout de l'ID du serveur du Jardin pour permettre l'enregistement des commandes dessus
							-# - \`[buttons/irlRole]\` - changement de userId en discordId pour suivre le modèle du schéma de la base de données
							
							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/compare/v1.0.0-beta...v1.0.1-beta)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
	"1.0.0-beta": new ContainerBuilder()
		.setAccentColor(0x26c4ec)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder()
						.setContent(stripIndent(`
							## Notes de patch - Version 1.0.0-beta
							*(11 octobre 2025)*
							Cette première version contient la base du bot, ainsi que les premières features liées au site et au serveur Discord. Vous en trouverez le résumé (pas strictement chronologique, et non-exhaustif) ci-dessous.
							### 🚀 Lancement initial
							- \`[base du bot]\`
							  - Mise en place de la structure de base du bot en TypeScript
							  - Mise en place de la base de données (MongoDB)
							- \`[base de données]\` - Création du modèle de document des utilisateurs dans la base de données (User)
								- Comptabilisation de nombre de messages envoyés par l'utilisateur
							- \`[commande \`*\`/ping\`*\`]\` - Création. Renvoie la latence du bot.
							- \`[commande \`*\`/buttonpanel\`*\`]\` - Création
								- Embed avec un bouton qui lorsque l'on clique dessous vérifie dans la base de données que l'utilisateur a bien 300 messages minimum, et 61 jours d'ancienneté (approx 2 mois) pour le rôle IRL
							- \`[commande \`*\`/connect\`*\` & \`*\`/disconnect\`*\`]\` - Création. Connexion du compte Discord au site via un code temporaire, et ajout des rôles correspondant. Et déconnexion possible avec perte des rôles. Les IDs discord (ainsi que les IDs du site) sont stockés dans la base de données via un modèle spécifique).
							- \`[commande \`*\`/cleaningroles\`*\`]\` - Création. Permet au développeur de supprimer les rôles des utilisateurs qui n'ont pas leur compte Discord lié au site.
							- Système qui notifie le développeur directement sur Discord en cas de souci de création ou de suppression de document dans la base de données.
							
							**Journal complet** : [Voir sur GitHub](${config.githubRepositoryUrl}/commits/v1.0.0-beta)
				`)))
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(client.user?.displayAvatarURL() || ""),
				),
		),
} as const);
