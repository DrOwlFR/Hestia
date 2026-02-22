import type { Message } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Event } from "sheweny";

import config from "../structures/config";
import { MessageStats, User } from "../structures/database/models";

export class MessageCreateEvent extends Event {
	constructor(client: ShewenyClient) {
		super(client, "messageCreate", {
			description: "New message is send",
			once: false,
			emitter: client,
		});
	}

	/**
	 * Execute: handler for the `messageCreate` event.
	 * Summary: Processes new messages to update user message counters and channel statistics.
	 * Steps:
	 * - Skip bots, DMs, and messages from other guilds
	 * - Update the user's message count and daily stats in the User collection
	 * - Update message statistics for the channel (and parent if thread) in the MessageStats collection
	 * @param message - The message that was created.
	 */
	async execute(message: Message) {

		// Checks to avoid unnecessary database operations
		if (message.author.bot) return;
		if (!message.inGuild()) return;
		if (message.guildId !== config.gardenGuildId) return;

		/* ========================================================================== */
		/* Message counter management system for each member                           */
		/* ========================================================================== */
		const [today] = new Date().toISOString().split("T");

		// Complex MongoDB aggregation pipeline to update user message stats.
		// Handles daily message increments, field initialization, and ensures consistent field ordering in the document (just because I love that).
		// Uses updatePipeline for advanced operations not possible with standard upsert.
		try {
			await User.findOneAndUpdate(
				{ discordId: message.author.id },
				[
					{
						$set: {
							isNewDay: { $eq: [{ $indexOfArray: ["$messagesPerDay.date", today] }, -1] },
						},
					},
					{
						$set: {
							discordUsername: { $ifNull: ["$discordUsername", message.author.username] },
							totalMessages: { $add: [{ $ifNull: ["$totalMessages", 0] }, 1] },
							// 📊 messagesPerDay : incrémente le jour courant ou ajoute une nouvelle entrée
							messagesPerDay: {
								$let: {
									vars: { today: today },
									in: {
										$cond: [
											{
												// Condition : la date du jour existe déjà dans le tableau
												$in: [
													"$$today",
													{
														$map: {
															input: { $ifNull: ["$messagesPerDay", []] },
															as: "d",
															in: "$$d.date",
														},
													},
												],
											},
											{
												// Si oui → incrémente le count pour cette date
												$map: {
													input: { $ifNull: ["$messagesPerDay", []] },
													as: "d",
													in: {
														$cond: [
															{ $eq: ["$$d.date", "$$today"] },
															{ date: "$$d.date", count: { $add: ["$$d.count", 1] } },
															"$$d",
														],
													},
												},
											},
											{
												// Sinon → ajoute une nouvelle entrée { date: today, count: 1 }
												$concatArrays: [
													{ $ifNull: ["$messagesPerDay", []] },
													[{ date: "$$today", count: 1 }],
												],
											},
										],
									},
								},
							},
							joinedAt: { $ifNull: ["$joinedAt", message.member?.joinedAt] },
							__v: {
								$cond: [
									"$isNewDay",
									{ $add: [{ $ifNull: ["$__v", 0] }, 1] },
									{ $ifNull: ["$__v", 0] },
								],
							},
							createdAt: { $ifNull: ["$createdAt", "$$NOW"] },
						},
					},
					{ $unset: "isNewDay" },
				],
				{ upsert: true },
			);
		}
		catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
		}

		// If the message is sent in the portrait gallery channel, mark the user as having introduced themselves if not already done
		if (message.channel.id === config.portraitGaleryChannelId) {
			try {
				await User.findOneAndUpdate(
					{
						discordId: message.author.id,
						introduced: { $ne: true },
					},
					{
						$set: {
							introduced: true,
						},
					},
				);
			} catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
			}
		}

		/* ========================================================================== */
		/* Message statistics management system by channel, month, and year          */
		/* ========================================================================== */
		const { channel, channelId } = message;

		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;

		// Update or insert message stats for the channel, incrementing the message count for the current month/year
		await MessageStats.updateOne(
			{ guildId: message.guild.id, channelId: channelId, year, month },
			{
				$setOnInsert: {
					// Send the field only if the channel is a thread, better than to send "undefined"
					...(channel.isThread() ? { parentChannelId: channel.parentId } : {}),
				},
				$set: {
					categoryId: channel.parent?.parent ? channel.parent.parent.id : channel.parent ? channel.parent.id : null,
					categoryName: channel.parent?.parent ? channel.parent.parent.name : channel.parent ? channel.parent.name : null,
					// Send the next field only if the channel is a thread, better than to send "undefined"
					...(channel.isThread() ? { parentChannelName: channel.parent?.name } : {}),
					channelName: channel.name,
				},
				$inc: { messageCount: 1 },
			},
			{ upsert: true },
		);

	}
};
