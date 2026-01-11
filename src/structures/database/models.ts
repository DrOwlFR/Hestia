import type { Document, Types } from "mongoose";
import { model, Schema } from "mongoose";

interface MessagePerDay {
	date: string;
	count: number;
}

export interface dbUser extends Document {
	_id: Types.ObjectId;
	discordId: string;
	discordUsername: string;
	totalMessages: number;
	messagesPerDay: MessagePerDay[],
	joinedAt: Date,
	__v: number,
	createdAt: Date,
	updatedAt: Date,
}

export const User = model<dbUser>("User", new Schema({
	discordId: { type: String, required: true, unique: true },
	discordUsername: { type: String, required: true, unique: true },
	totalMessages: { type: Number, required: true, default: 0 },
	messagesPerDay: { type: [Object], required: true, default: [] },
	joinedAt: { type: Date, required: true, default: new Date() },
}, { timestamps: true, strict: true }));

export interface linkedUser extends Document {
	_id: Types.ObjectId,
	discordId: string,
	discordUsername: string,
	siteId: number,
	__v: number,
	createdAt: Date,
	updatedAt: Date,
}

export const LinkedUser = model<linkedUser>("linked_user", new Schema({
	discordId: { type: String, required: true, unique: true },
	siteId: { type: Number, required: true, unique: true },
	discordUsername: { type: String, required: true, unique: true },
}, { timestamps: true, strict: true }));

export interface messageStats extends Document {
	_id: Types.ObjectId,
	guildId: string,
	channelId: string,
	parentChannelId?: string,
	parentChannelName?: string,
	channelName: string,
	year: number,
	month: number,
	messageCount: number,
	__v: number,
	createdAt: Date,
	updatedAt: Date,
}

const MessageStatsSchema = new Schema<messageStats>({
	guildId: { type: String, required: true },
	channelId: { type: String, required: true },
	// eslint-disable-next-line no-inline-comments
	parentChannelId: { type: String }, // for threads only
	// eslint-disable-next-line no-inline-comments
	parentChannelName: { type: String }, // for threads only
	channelName: { type: String, required: true },
	year: { type: Number, required: true },
	month: { type: Number, required: true },
	messageCount: { type: Number, required: true, default: 0 },
}, { timestamps: true, strict: true });

// Composed index unique (only one doc for channel X in january 2026 for example)
MessageStatsSchema.index(
	{ guildId: 1, channelId: 1, year: 1, month: 1 },
	{ unique: true },
);

export const MessageStats = model<messageStats>(
	"messages_stats",
	MessageStatsSchema,
);
