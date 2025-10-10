// Ajouter les infos ce que le bot stocke (id, messages totaux)
import { Command } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { ChannelType, type ChatInputCommandInteraction } from "discord.js";
import { version } from "../../../package.json";
import { dependencies } from "../../../package.json";

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
		const trueUsers = client.users.cache.filter(user => !user.bot);
		const channels = client.channels.cache.filter(channel => channel.type !== ChannelType.GuildCategory);

		return interaction.reply({
			embeds: [
				client.functions.embed()
					.setTitle(`Informations sur ${client.user?.username}`)
					.setThumbnail(client.user?.displayAvatarURL())
					.addFields([
						{ name: "🗓️ Date de création", value: `<t:${createdTimestamp}:F>, <t:${createdTimestamp}:R>` },
						{ name: "<:developer:1424387780447834143> Développeur", value: `${interaction.guild?.members.cache.get(client.admins[0])}\n‏‏‎ ‎` },
						{ name: "<:high_connection:1424387839197581445> En ligne depuis", value: `<t:${readyTimestamp}:F>, <t:${readyTimestamp}:R>` },
						{ name: "<:compass:1270723556719988828> Serveurs", value: `\` ${client.guilds.cache.size} \``, inline: true },
						{ name: "<:textchannel:1424387916708450425> Salons", value: `\` ${channels.size} \``, inline: true },
						{ name: "<:members:1424387997138157648> Utilisateurs", value: `\` ${trueUsers.size} \`\n‏‏‎ ‎`, inline: true },
						{ name: "<:bot:1424388051286622238> Bot", value: `\` v${version} \``, inline: true },
						{ name: "<:nodejs:1424388098631925871> NodeJs", value: "` v22.18.0 `", inline: true },
						{ name: "<:djs:1424388698560266412> Discord.Js", value: `\` v${dependencies["discord.js"].substring(1)} \``, inline: true },
						{ name: "<:sheweny:1424388747062939768> Framework", value: `\` Sheweny v${dependencies["sheweny"].substring(1)} \`` },
					]),
			],
		});

	}
}
