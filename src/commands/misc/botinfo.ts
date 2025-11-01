// Ajouter les infos ce que le bot stocke (id, messages totaux)
import type { ChatInputCommandInteraction } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

import { dependencies, version } from "../../../package.json";
import config from "../../structures/config";

export class BotInfoCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "botinfo",
			description: "Renvoie des informations sur le bot.",
			category: "Divers",
			usage: "botinfo",
			examples: ["botinfo"],
		});
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const { client } = this;

		const readyTimestamp = client.readyTimestamp ? Math.floor(client.readyTimestamp / 1000) : undefined;
		const createdTimestamp = client.user?.createdTimestamp ? Math.floor(client.user?.createdTimestamp / 1000) : undefined;

		return interaction.reply({
			embeds: [
				client.functions.embed()
					.setTitle(`Informations sur __${client.user?.username}__`)
					.setThumbnail(client.user?.displayAvatarURL({ size: 1024 }))
					.addFields([
						{ name: "🩷 Surnom", value: `Philibert Annick de la Botte de Sept Lieues (par <@${config.adminsDiscordIds[0]}>)` },
						{ name: "🗓️ Date de création", value: `<t:${createdTimestamp}:F>, <t:${createdTimestamp}:R>` },
						{ name: "<:developer:1424387780447834143> Développeur", value: `${interaction.guild?.members.cache.get(client.admins[0])}` },
						{ name: "<:high_connection:1424387839197581445> En ligne depuis", value: `<t:${readyTimestamp}:F>, <t:${readyTimestamp}:R>` },
						{ name: "<:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473>", value: " " },
						{ name: "<:bot:1424388051286622238> Bot", value: `\` v${version} \``, inline: true },
						{ name: "<:nodejs:1424388098631925871> NodeJs", value: "` v22.18.0 `", inline: true },
						{ name: "<:djs:1424388698560266412> Discord.Js", value: `\` v${dependencies["discord.js"].substring(1)} \``, inline: true },
						{ name: "<:sheweny:1424388747062939768> Framework", value: `\` Sheweny v${dependencies["sheweny"].substring(1)} \``, inline: true },
					]),
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel("Statut")
							.setEmoji("📊")
							.setURL("https://watchbot.fr/status/1423709000456737002"),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel("Politique de confidentialité")
							.setEmoji("🔐")
							.setURL("https://github.com/DrOwlFR/Hestia/blob/acceptance/PRIVACY_POLICY.md"),
					),
			],
		});

	}
}
