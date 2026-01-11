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

	async execute(message: Message) {

		// Management of bot messages, PMs, and messages that are not on the community server (simple protection)
		if (message.author.bot) return;
		if (!message.inGuild()) return;
		if (message.guildId !== config.gardenGuildId) return;

		// Message counter management system for each member
		const [today] = new Date().toISOString().split("T");

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
				{ upsert: true, updatePipeline: true },
			);
		}
		catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
		}

		// Statistics module, message counter for each channel (and thread), by month and by year
		const { channel, channelId } = message;

		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;

		await MessageStats.updateOne(
			{ guildId: message.guild.id, channelId: channelId, year, month },
			{
				$setOnInsert: {
					parentChannelId: channel.isThread() ? channel.parentId : undefined,
				},
				$set: {
					parentChannelName: channel.isThread() ? channel.parent?.name : undefined,
					channelName: channel.name,
				},
				$inc: { messageCount: 1 },
			},
			{ upsert: true, updatePipeline: true },
		);

	}
};
