import type { GuildMemberRoleManager, ModalSubmitInteraction, TextChannel } from "discord.js";
import { MessageFlags } from "discord.js";
import type { Document } from "mongoose";
import type { ShewenyClient } from "sheweny";
import { Modal } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../structures/config";
import { LinkedUser } from "../../structures/database/models";
import type { responseJson } from "../../types";

export class ModalComponent extends Modal {
	constructor(client: ShewenyClient) {
		super(client, ["verificationCodeModal"]);
	}

	async execute(modal: ModalSubmitInteraction) {

		const { fields, guild, member, user } = modal;

		if (guild?.id !== config.gardenGuildId) return;

		const code = fields.getTextInputValue("verificationCode");
		const { id, username } = user;

		const connectResponse = await this.client.functions.connectUser(code, id, username);

		if (connectResponse.status === 404) {
			return modal.reply({
				content: stripIndent(`
					> *Hestia plisse les yeux en regardant la case du code de vérification.*
					— Hm. Je ne reconnais pas ce code. Étes-vous sûr·e que c'est le bon ?\n
					-# <:round_cross:1424312051794186260> Le code que vous avez fourni est invalide ou a expiré.
					`),
				flags: MessageFlags.Ephemeral,
			});
		}
		if (connectResponse.status === 409) {
			return modal.reply({
				content: stripIndent(`
					> *Hestia fronce les sourcils en lisant votre formulaire qu'elle s'empresse de déchirer.*
					— Mais... Vous avez déjà rempli ce formulaire ! Vous me faites perdre mon temps. Oust ! Nom d'une Esperluette !\n
					-# <:round_cross:1424312051794186260> Votre compte Discord est déjà associé à un compte sur le site, ou bien un autre compte Discord est déjà associé au compte sur le site. **Si vous pensez que c'est une erreur, veuillez contacter un·e membre de l'équipe**.
					`),
				flags: MessageFlags.Ephemeral,
			});
		}
		if (connectResponse.status === 429) {
			return modal.reply({
				content: stripIndent(`
					— Oulah doucement, pas si vite ! Du calme. Reprenez calmement.\n
					-# <:round_cross:1424312051794186260> Limite d'interaction avec le site atteinte. Réessayez dans 60 secondes.
					`),
				flags: MessageFlags.Ephemeral,
			});
		}

		const connectResponseJson = (await connectResponse.json() as responseJson);

		if (connectResponseJson.success) {

			let document: Document | null = null;
			try {
				document = await LinkedUser.findOneAndUpdate(
					{ discordId: user.id },
					[{
						$set: {
							discordId: { $ifNull: ["$discordId", user.id] },
							siteId: { $ifNull: ["$siteId", connectResponseJson.userId] },
							discordUsername: { $ifNull: ["$discordUsername", user.username] },
							__v: { $add: { $ifNull: ["$__v", 0] } },
							createdAt: { $ifNull: ["$createdAt", "$$NOW"] },
						},
					}],
					{ upsert: true, new: true, updatePipeline: true },
				);
			}
			catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
			}

			if (!document) {
				await this.client.functions.deleteUser(user.id);
				(this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@${config.botAdminsIds[0]}> Le document LinkedUser de l'id discord \`${user.id}\` n'a pas été créé correctement. À vérifier.`);
				return modal.reply({
					content: stripIndent(`
						> *Hestia fronce les sourcils, visiblement contrariée.*
						— Hm, non, ça ne fonctionne pas. Nom d'une Esperluette, pourquoi ça ne fonctionne pas ?\n
						-# <:round_cross:1424312051794186260> Votre compte Discord n'a pas pu être associé correctement à votre compte sur le site du Jardin. Veuillez réessayez. Si le problème persiste, contactez un·e membre de l'équipe.
						`),
					flags: MessageFlags.Ephemeral,
				});
			}

			if (connectResponseJson.roles!.find(r => r === "user-confirmed")) {
				(member?.roles as GuildMemberRoleManager).add(config.confirmedUserRoleId);
				return modal.reply({
					content: stripIndent(`
						> *Hestia vous adresse un immense sourire, et vous tend une clef.*
						— Bienvenue au Manoir ! Voici la clef de votre chambre. Elle se trouve avec les autres au deuxième étage. Vous avez accès à toutes les pièces du Manoir (sauf le salon fumoir et le salon des évènements IRL, *cf. Règles de vie*).
							Dirigez-vous vers la ${guild.channels.cache.get(config.portraitGaleryChannelId)} pour dresser le vôtre. Ensuite, vous pourrez rejoindre les autres résident·es du Manoir dans l'${guild.channels.cache.get(config.antechamberChannelId)} ou le ${guild.channels.cache.get(config.loungeChannelId)} pour faire connaissance !\n
						-# <:round_check:1424065559355592884> Votre compte Discord est connecté au site du Jardin. Vous avez reçu le rôle ${guild?.roles.cache.get(config.confirmedUserRoleId)}. Bienvenue !
					`),
					flags: MessageFlags.Ephemeral,
				});
			}
			else {
				(member?.roles as GuildMemberRoleManager).add(config.nonConfirmedUserRoleId);
				return modal.reply({
					content: stripIndent(`
						> *Hestia vous adresse un grand sourire.*
						— Une nouvelle Graine ! Bienvenue ! Déposez vos chaussures à l'entrée, je vous prie. Et dirigez-vous vers la ${guild.channels.cache.get(config.portraitGaleryChannelId)} pour dresser le vôtre ! Ensuite vous pourrez rejoindre tout le monde dans l'${guild.channels.cache.get(config.antechamberChannelId)} pour discuter.\n
						-# <:round_check:1424065559355592884> Votre compte Discord est connecté au site du Jardin. Vous avez reçu le rôle ${guild?.roles.cache.get(config.nonConfirmedUserRoleId)}. Bienvenue jeune Graine !
						`),
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	}
};
