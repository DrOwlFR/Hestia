import type { ChatInputCommandInteraction } from "discord.js";
import { ChannelType, GuildMember, MessageFlags, PermissionFlagsBits } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../structures/config";
import { updateRulesMessages } from "../../structures/tasks/seasonsSystem";

export class RulesCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "editrules",
			description: "Édite les messages des règles.",
			category: "Administration",
			usage: "editrules",
			examples: ["editrules"],
		});
	}

	/**
	 * Execute: main handler for the `editrules` command.
	 * Summary: Edit existing rule messages with updated interactive components in the rules channel.
	 * Steps:
	 * - Check if the user has admin permissions (bot admin/dev or server admin)
	 * - Reply with a loading message
	 * - Edit each rule message component sequentially
	 * - Follow up with a success message
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		// Permission check for guild administrators and bot admins
		const isAdmin = this.client.admins.includes(interaction.user.id) || interaction.member instanceof GuildMember && interaction.member.permissions.has(PermissionFlagsBits.Administrator);
		if (!isAdmin) {
			return interaction.reply({
				content: stripIndent(`
					> *Alors que vous essayez désespérément de faire fonctionner ce mécanisme, vous entendez des talons approcher en claquant sur le sol. Puis… La voix de la Concierge.*
					— Hep, hep, hep ! Que croyez-vous faire là ? Vous n'avez pas le droit ! Déguerpissez !\n
					-# ${config.emojis.cross} Vous n'avez pas les permissions suffisantes pour la commande \`${interaction}\`. Cette dernière est réservée à mon Développeur et aux Majuscules.
				`),
				flags: MessageFlags.Ephemeral,
			});
		}

		// Get the rules channel and verify the command is used there (to be sure that the admin supervises the edit)
		const rulesChannel = interaction.channel;
		if (!rulesChannel || rulesChannel.id !== config.rulesChannelId || rulesChannel.type !== ChannelType.GuildText) {
			return interaction.reply({ content: `${config.emojis.cross} Vous devez vous trouver dans le salon des règles pour utiliser cette commande.`, flags: MessageFlags.Ephemeral });
		}

		// Reply with a loading message while editing the rules
		await interaction.reply({ content: `${config.emojis.loading} Édition des règles en cours...`, flags: MessageFlags.Ephemeral });

		// Update the rules messages in the rules channel
		await updateRulesMessages(rulesChannel, this.client);

		// Follow up with a success message
		return interaction.followUp({ content: `${config.emojis.check} Les règles ont été éditées correctement.`, flags: MessageFlags.Ephemeral });
	}
}
