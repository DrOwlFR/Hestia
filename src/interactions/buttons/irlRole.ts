import { Button } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { ButtonInteraction, MessageFlags, type GuildMember, GuildMemberRoleManager, TextChannel } from "discord.js";
import config from "../../structures/config";
import { User, type dbUser } from "../../structures/database/models";

export class IRLRoleButton extends Button {
	constructor(client: ShewenyClient) {
		super(client, ["irlRoleButton"]);
	}

	async execute(button: ButtonInteraction) {

		const { guildId, member, guild } = button;

		if (guildId !== config.gardenGuildId) return;

		if ((member?.roles as GuildMemberRoleManager).cache.some(role => role.id === config.irlRoleId)) {
			return button.reply({
				content: "<:round_cross:1424312051794186260> Vous possédez déjà le rôle d'accès au salon des IRLs.",
				flags: MessageFlags.Ephemeral,
			});
		}

		let memberData: dbUser | null = null;
		try {
			memberData = await User.findOneAndUpdate(
				{ discordId: member?.user.id },
				{ $setOnInsert: { joinedAt: (member as GuildMember).joinedAt } },
				{ upsert: true, setDefaultsOnInsert: true },
			);
		}
		catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
			(this.client.channels.cache.get("1425177656755748885") as TextChannel)!.send(`<@158205521151787009> Le document **User** de l'id discord \`${(member as GuildMember).id}\` n'a pas été créé correctement lorsqu'il a cliqué sur **le bouton du rôle IRL**. À vérifier.`);
		}

		if (memberData && ((Date.now() - memberData?.joinedAt.getTime()) / (1000 * 60 * 60 * 24)) >= 61 && (memberData.totalMessages >= 300)) {
			(member?.roles as GuildMemberRoleManager).add(config.irlRoleId).catch(err => {
				// eslint-disable-next-line no-console
				console.error(err);
				return button.reply({
					content: `<:round_cross:1424312051794186260> Le rôle ${guild?.roles.cache.get(config.irlRoleId)} n'a pas pu vous être attribué. Veuillez contacter un cadratin du Discord (${config.cadratinDiscordIds.map(c => guild?.members.cache.get(c)).join(", ")}) pour le recevoir, ainsi que mon développeur (${this.client.admins.map(a => guild?.members.cache.get(a)).join(", ")}) pour en avoir le coeur net.`,
					flags: MessageFlags.Ephemeral,
				});
			});
			return button.reply({
				content: `<:round_check:1424065559355592884> Le rôle ${guild?.roles.cache.get(config.irlRoleId)} vous a été attribué. Vous avez à présent accès au salon ${guild?.channels.cache.get(config.irlChannelId)}. Bienvenue !\n**Rappel** : Le Jardin en tant qu'association n'est pas responsable des IRLs organisées par ses membres.`,
				flags: MessageFlags.Ephemeral,
			});
		} else {
			return button.reply({
				content: "<:round_cross:1424312051794186260> Il semble que vous ne remplissez pas les critères requis pour recevoir l'accès au salon des IRLs. Repassez plus tard.",
				flags: MessageFlags.Ephemeral,
			});
		}
	}
};
