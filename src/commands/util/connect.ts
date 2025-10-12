import { Command } from "sheweny";
import { ShewenyClient } from "sheweny";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction, GuildMemberRoleManager, MessageFlags, TextChannel } from "discord.js";
import config from "../../structures/config";
import type { responseJson } from "../../types";
import { LinkedUser } from "../../structures/database/models";
import { Document } from "mongoose";

export class ConnectCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "connect",
			description: "Permet la connexion entre votre compte Discord et le site du Jardin.",
			category: "Utile",
			usage: "connect [code]",
			examples: ["connect baa72b30"],
			clientPermissions: ["ManageRoles"],
			options: [{
				name: "code",
				description: "Code de vérification temporaire fournit par le site.",
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const { options, channel, member, guild, user } = interaction;

		if (guild?.id !== config.gardenGuildId) return;
		if (channel?.id !== config.conciergeLodgeChannelId) {
			return interaction.reply({
				content: `<:round_cross:1424312051794186260> Hep hep hep ! Pour l'enregistrement, c'est par ici ${guild?.channels.cache.get(config.conciergeLodgeChannelId)} !`,
				flags: MessageFlags.Ephemeral,
			});
		}

		const code = options.getString("code")! as string;
		const { id, username } = user;

		const connectResponse = await this.client.functions.connectUser(code, id, username);

		if (connectResponse.status === 404) {
			return interaction.reply({
				content: "<:round_cross:1424312051794186260> Le code que vous avez fourni est invalide ou a expiré.",
				flags: MessageFlags.Ephemeral,
			});
		}
		if (connectResponse.status === 409) {
			return interaction.reply({
				content: "<:round_cross:1424312051794186260> Votre compte Discord est déjà associé à un compte sur le site, ou bien un autre compte Discord est déjà associé au compte sur le site. Si vous pensez que c'est une erreur, veuillez contacter un membre de l'équipe.",
				flags: MessageFlags.Ephemeral,
			});
		}
		if (connectResponse.status === 429) {
			return interaction.reply({
				content: "<:round_cross:1424312051794186260> Limite d'interaction avec le site atteinte. Réessayez dans 60 secondes.",
				flags: MessageFlags.Ephemeral,
			});
		}

		const connectResponseJson = (await connectResponse.json() as responseJson);

		if (connectResponseJson.success) {

			let document: Document | null = null;
			try {
				document = await LinkedUser.findOneAndUpdate(
					{ discordId: user.id },
					{
						$set: {
							discordId: user.id,
							siteId: connectResponseJson.userId,
						},
					},
					{ new: true, upsert: true },
				);
			}
			catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
			}

			if (!document) {
				await this.client.functions.deleteUser(user.id);
				(this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@158205521151787009> Le document LinkedUser de l'id discord \`${user.id}\` n'a pas été créé correctement. À vérifier.`);
				return interaction.reply({
					content: "<:round_cross:1424312051794186260> Votre compte Discord n'a pas pu être associé correctement à votre compte sur le site du Jardin. Veuillez réessayez. Si le problème persiste contactez un membre de l'équipe.",
					flags: MessageFlags.Ephemeral,
				});
			}

			if (connectResponseJson.roles!.find(r => r === "user-confirmed")) {
				(member?.roles as GuildMemberRoleManager).add(config.ampersandRoleId);
				return interaction.reply({
					content: `<:round_check:1424065559355592884> Votre compte Discord est connecté au site du Jardin. Vous avez reçu le rôle ${guild?.roles.cache.get(config.ampersandRoleId)}. Bienvenue dans la cour des grands !`,
					flags: MessageFlags.Ephemeral,
				});
			}
			else {
				(member?.roles as GuildMemberRoleManager).add(config.seedRoleId);
				return interaction.reply({
					content: `<:round_check:1424065559355592884> Votre compte Discord est connecté au site du Jardin. Vous avez reçu le rôle ${guild?.roles.cache.get(config.seedRoleId)}. Bienvenue jeune graine !`,
					flags: MessageFlags.Ephemeral,
				});
			}
		}

	}
}
