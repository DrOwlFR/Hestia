import type { Document, Types } from "mongoose";
import { model, Schema } from "mongoose";

/**
 * Interface for MessagePerDay subdocument.
 * Tracks daily message count for a user.
 */
interface MessagePerDay {
	date: string;
	count: number;
}

/**
 * Interface for User documents in the database.
 * Represents a Discord user with message statistics, join date, and timestamps.
 */
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

/**
 * Mongoose model for User collection.
 * Manages user documents with message tracking and join information.
 */
export const User = model<dbUser>("User", new Schema({
	discordId: { type: String, required: true, unique: true },
	discordUsername: { type: String, required: true, unique: true },
	totalMessages: { type: Number, required: true, default: 0 },
	messagesPerDay: { type: [Object], required: true, default: [] },
	joinedAt: { type: Date, required: true, default: new Date() },
}, { timestamps: true, strict: true }));

/**
 * Interface for LinkedUser documents in the database.
 * Represents the link between a Discord user and their site account.
 */
export interface linkedUser extends Document {
	_id: Types.ObjectId,
	discordId: string,
	discordUsername: string,
	siteId: number,
	__v: number,
	createdAt: Date,
	updatedAt: Date,
}

/**
 * Mongoose model for LinkedUser collection.
 * Manages links between Discord and site accounts.
 */
export const LinkedUser = model<linkedUser>("linked_user", new Schema({
	discordId: { type: String, required: true, unique: true },
	siteId: { type: Number, required: true, unique: true },
	discordUsername: { type: String, required: true, unique: true },
}, { timestamps: true, strict: true }));

/**
 * Interface for MessageStats documents in the database.
 * Tracks monthly message counts per channel in a guild.
 */
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
}

/**
 * Mongoose schema for MessageStats collection.
 * Defines the structure for message statistics with unique index on guild, channel, year, month.
 */
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

// Unique index to ensure one document per channel per month
MessageStatsSchema.index(
	{ guildId: 1, channelId: 1, year: 1, month: 1 },
	{ unique: true },
);

/**
 * Mongoose model for MessageStats collection.
 * Manages monthly message statistics for channels.
 */
export const MessageStats = model<messageStats>(
	"messages_stats",
	MessageStatsSchema,
);
