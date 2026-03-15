import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType, ChannelType, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";
import stripIndent from "strip-indent";

import config from "../../structures/config";
import { MessageStats } from "../../structures/database/models";

export class StatisticsCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "statistics",
			description: "Affiche les statistiques du serveur.",
			category: "Administration",
			usage: "statistics",
			examples: ["statistics"],
			options: [
				{
					name: "channels",
					description: "Affiche les statistiques des salons du serveur.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "salon",
							description: "Le salon à analyser (optionnel, par défaut : tous les salons).",
							type: ApplicationCommandOptionType.Channel,
							required: false,
							channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.PublicThread],
						},
					],
				},
				{
					name: "file",
					description: "Envoie les statistiques complètes sous forme de fichier (réservée à l'équipe du Jardin).",
					type: ApplicationCommandOptionType.Subcommand,
				},
			],
		});
	}

	/**
	 * Execute: main handler for the `statistics` command.
	 * Summary:
	 * - This command allows users to view statistics about message activity in the server.
	 * - It has two subcommands: "channels" for viewing statistics of specific channels or all channels, and "file" for exporting the statistics as a CSV file.
	 * - The command calculates the number of messages for the current month and compares it to the previous month to show the evolution in activity.
	 * - It also provides a breakdown of messages by channel and threads when viewing channel statistics.
	 * Steps:
	 * - Defer the reply to give more time for processing and make it ephemeral so only the user can see it.
	 * - Get the subcommand and prepare month names for display.
	 * - For the "channels" subcommand:
	 *   - If a specific channel is provided, fetch its statistics for the current and previous month, calculate the evolution, and display it in an embed.
	 *   - If no specific channel is provided, fetch statistics for all channels, calculate total messages and evolution, and display it in an embed with a breakdown by channel and threads.
	 * - For the "file" subcommand:
	 *   - Check if the user has the required permissions (guild administrators, bot admins, site mods, or discord mods). If not, inform the user.
	 *   - Fetch all message statistics from the database. If no data is found, inform the user.
	 *   - Build a CSV string with a header and rows for each statistic, convert it to a buffer, and send it as a file attachment in the reply.
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		const { options, user } = interaction;

		// Defer the reply to give us more time to process the command, and make it ephemeral so only the user can see it.
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		// Get the subcommand and the month names for display.
		const subCommand = options.getSubcommand();
		const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

		// Handle the subcommands for channels and file export.
		switch (subCommand) {
			case "channels":
				const channel = options.getChannel("salon");

				// Calculate the current month and year, as well as the previous month and its year for comparison.
				const currentMonth = new Date().getMonth() + 1;
				const currentYear = new Date().getFullYear();
				const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
				const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

				// If a specific channel is provided, fetch its statistics for the current and previous month, calculate the evolution, and display it in an embed.
				if (channel) {
					const currentMonthStats = await MessageStats.findOne({ year: currentYear, month: currentMonth, channelId: channel.id });
					const lastMonthStats = await MessageStats.findOne({ year: lastMonthYear, month: lastMonth, channelId: channel.id });

					const currentMonthName = monthNames[currentMonth - 1];
					const currentMonthCount = currentMonthStats ? currentMonthStats.messageCount : 0;

					const lastMonthName = monthNames[lastMonth - 1];
					const lastMonthCount = lastMonthStats ? lastMonthStats.messageCount : 0;

					const channelType = currentMonthStats ? currentMonthStats.parentChannelId ? "fil" : "salon" : channel.type === ChannelType.PublicThread ? "fil" : "salon";

					const evolution = lastMonthCount ? ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0;

					await interaction.editReply({ embeds: [
						this.client.functions.embed()
							.setTitle(`Statistiques du ${channelType} ${channel}`)
							.addFields([
								{ name: `${lastMonthName} ${lastMonthYear}`, value: `${lastMonthCount ? `**${lastMonthCount}** message${lastMonthCount > 1 ? "s" : ""}` : "*Aucune donnée*"}`, inline: true },
								{ name: `${currentMonthName} ${currentYear}`, value: `**${currentMonthCount}** message${currentMonthCount > 1 ? "s" : ""}`, inline: true },
								{ name: "Évolution", value: `**${evolution > 0 ? `📈 +${evolution.toFixed(2)}%` : evolution < 0 ? `📉 ${evolution.toFixed(2)}%` : "🟰"}**`, inline: true },
							]),
					] });
					return;
				// If no specific channel is provided, fetch the statistics for all channels for the current month, calculate the total messages and evolution compared to the previous month, and display it in an embed with a breakdown by channel and threads.
				} else {

					// Fetch all statistics for the current month. If no data is found, inform the user.
					const data = await MessageStats.find({ year: currentYear, month: currentMonth });
					if (!data || data.length === 0) {
						await interaction.editReply(stripIndent(`
							> *Vous observez Hestia chercher frénétiquement dans ses étagères, tirant livres après livres, les uns après les autres, mais sans succès. Après un moment, elle se tourne vers vous avec un air désolé.*
							— Veuillez m'excuser, mais il semble que je n'ai aucune statistique pour ce mois-ci... Je vais m'y ateler. Revenez plus tard !\n
							-# ${config.emojis.cross} Aucune statistique trouvée pour ce mois-ci.
							`));
						return;
					}

					// Calculate the total number of messages for the current month and the previous month, as well as the overall evolution.
					const totalMessages = data.reduce((sum, doc) => sum + doc.messageCount, 0);
					const totalMessagesLastMonth = (await MessageStats.find({ year: lastMonthYear, month: lastMonth })).reduce((sum, doc) => sum + doc.messageCount, 0);
					const totalEvolution = totalMessagesLastMonth ? ((totalMessages - totalMessagesLastMonth) / totalMessagesLastMonth) * 100 : 0;

					// Separate the statistics for channels (those without a parentChannelId) and sort them by message count in descending order.
					const channelStats = data.filter(d => !d.parentChannelId).sort((a, b) => b.messageCount - a.messageCount);

					// Create a map to group thread statistics by their parent channel ID for easy access when building the description.
					const threadsByParentId = new Map<string, typeof data>();
					for (const stat of data) {
						if (stat.parentChannelId) {
							if (!threadsByParentId.has(stat.parentChannelId)) {
								threadsByParentId.set(stat.parentChannelId, []);
							}
							threadsByParentId.get(stat.parentChannelId)!.push(stat);
						}
					}

					// Build the description for the embed, starting with the total messages and overall evolution, then adding a breakdown for each channel and its threads with their respective evolutions compared to the previous month.
					let description = `Total des messages : **${totalMessages}** (${totalEvolution > 0 ? `📈 +${totalEvolution.toFixed(2)}%` : totalEvolution < 0 ? `📉 ${totalEvolution.toFixed(2)}%` : "🟰"} par rapport au mois précédent)\n\n`;
					for (const channelStat of channelStats) {						const lastMonthStats = await MessageStats.findOne({ year: lastMonthYear, month: lastMonth, channelId: channelStat.channelId });
						const channelLastMonthCount = lastMonthStats ? lastMonthStats.messageCount : 0;
						const channelEvolution = channelLastMonthCount ? ((channelStat.messageCount - channelLastMonthCount) / channelLastMonthCount) * 100 : 0;
						const channelEvolutionFormatted = channelEvolution > 0 ? `📈 +${channelEvolution.toFixed(2)}%` : channelEvolution < 0 ? `📉 ${channelEvolution.toFixed(2)}%` : "🟰";
						description += `**• ${channelStat.channelName}** - ${channelStat.messageCount} message${channelStat.messageCount > 1 ? "s" : ""} (${channelEvolutionFormatted})\n`;

						// If the channel has threads, add a breakdown for each thread under the channel with its respective evolution compared to the previous month.
						const threadStats = threadsByParentId.get(channelStat.channelId);
						if (threadStats) {
							const sortedThreads = threadStats.sort((a, b) => b.messageCount - a.messageCount);
							for (const thread of sortedThreads) {
								const lastMonthThreadStats = await MessageStats.findOne({ year: lastMonthYear, month: lastMonth, channelId: thread.channelId });
								const threadLastMonthCount = lastMonthThreadStats ? lastMonthThreadStats.messageCount : 0;
								const threadEvolution = threadLastMonthCount ? ((thread.messageCount - threadLastMonthCount) / threadLastMonthCount) * 100 : 0;
								const threadEvolutionFormatted = threadEvolution > 0 ? `📈 +${threadEvolution.toFixed(2)}%` : threadEvolution < 0 ? `📉 ${threadEvolution.toFixed(2)}%` : "🟰";
								description += `  └─ **${thread.channelName}** - ${thread.messageCount} message${thread.messageCount > 1 ? "s" : ""} (${threadEvolutionFormatted})\n`;
							}
						}
					}

					// Send the embed with the global statistics for the server for the current month, including the breakdown by channel and threads.
					await interaction.editReply({ embeds: [
						this.client.functions.embed()
							.setTitle(`Statistiques globales du serveur pour le mois de ${monthNames[currentMonth - 1]} ${currentYear}`)
							.setDescription(description),
					] });
				}
				break;
			// For the "file" subcommand, check if the user has the required permissions (guild administrators, bot admins, site mods, or discord mods).
			// If not, inform the user that they don't have permission to use this command.
			// If they do have permission, fetch all message statistics from the database, format them into a CSV string with a header and rows for each statistic, convert it to a buffer, and send it as a file attachment in the reply.
			case "file":
				// Permission check for guild administrators and bot admins
				const isAdmin = this.client.admins.includes(user.id) ||
						config.adminsDiscordIds.includes(user.id) ||
						config.siteModsIds.includes(user.id) ||
						config.discordModsIds.includes(user.id);
				if (!isAdmin) {
					return interaction.editReply({
						content: stripIndent(`
							> *Alors que vous essayez désespérément de faire fonctionner ce mécanisme, vous entendez des talons approcher en claquant sur le sol. Puis… La voix de la Concierge.*
							— Hep, hep, hep ! Que croyez-vous faire là ? Vous n'avez pas le droit ! Déguerpissez !\n
							-# ${config.emojis.cross} Vous n'avez pas les permissions suffisantes pour la commande \`${interaction}\`. Cette dernière est réservée à mon Développeur, aux Majuscules et aux Cadratins.
						`),
					});
				}

				// Fetch all message statistics from the database. If no data is found, inform the user.
				const data = await MessageStats.find({});
				if (!data || data.length === 0) {
					await interaction.editReply(stripIndent(`
							> *Vous observez Hestia chercher frénétiquement dans ses étagères, tirant livre après livre, les uns après les autres, mais sans succès. Après un moment, elle se tourne vers vous avec un air désolé.*
							— Veuillez m'excuser, je ne retrouve plus les statistiques dans mes documents... Il faut demander au Trésorier, peut-être qu'il aura une idée.\n
							-# ${config.emojis.cross} Aucune statistique trouvée dans la base de données. Veuillez en informer le Développeur pour qu'il puisse résoudre le problème.
							`));
					return;
				}

				// Build the CSV content with a header and rows for each statistic, including the year, month, type (channel or thread), category ID and name, channel ID and name, parent channel ID and name (if applicable), and message count.
				let csvContent = "year;month;type;categoryId;categoryName;channelId;channelName;parentChannelId;parentChannelName;messageCount\n";
				for (const doc of data) {
					const type: string = doc.parentChannelId ? "Fil" : "Salon";
					const month = monthNames[doc.month - 1];
					const parentChannelId = doc.parentChannelId || "";
					const parentChannelName = doc.parentChannelName || "";
					csvContent += `${doc.year};${month};${type};${doc.categoryId};${doc.categoryName};${doc.channelId};${doc.channelName};${parentChannelId};${parentChannelName};${doc.messageCount}\n`;
				}

				// Convert the CSV content to a buffer and send it as a file attachment in the reply.
				// The buffer is created with a UTF-8 encoding and includes a Byte Order Mark (BOM) to ensure proper encoding when opened in spreadsheet software.
				const csvBuffer = Buffer.from(`\uFEFF${csvContent}`, "utf-8");
				await interaction.editReply({
					content: stripIndent(`
						> *Vous observez Hestia s'affairer à rassembler les données, déposant des gros livres les uns par dessus les autres sur son comptoir, jusqu'à ne plus la voir derrière l'immense pile.*
						> *Après un moment de travail minutieux, vous voyez sa tête apparaître sur la droite de la tour de livres, un sourire entre la statisfaction et la fierté aux lèvres, sans se poser la question de comment vous allez bien pouvoir faire pour transporter tout ça.*
						— Voilà toutes nos statistiques, organisées par année, mois, catégorie, salon et fil. Bon courage !\n
						-# ${config.emojis.check} Voici l'export des statistiques des messages du serveur, au format CSV :
						`),
					files: [{ attachment: csvBuffer, name: `statistiques_${this.client.functions.formatDateTime()}.csv` }],
				});
				break;
		}
	}
}
