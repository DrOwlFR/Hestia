import type { Types } from "mongoose";
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
export interface dbUser {
	_id: Types.ObjectId;
	discordId: string;
	discordUsername: string;
	totalMessages: number;
	messagesPerDay: MessagePerDay[],
	accessoryRoles: string[],
	introduced: boolean,
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
	discordUsername: { type: String, required: true },
	totalMessages: { type: Number, required: true, default: 0 },
	messagesPerDay: { type: [Object], required: true, default: [] },
	accessoryRoles: { type: [String], required: true, default: [] },
	introduced: { type: Boolean, required: true, default: false },
	joinedAt: { type: Date, required: true, default: new Date() },
}, { timestamps: true, strict: true }));

/**
 * Interface for LinkedUser documents in the database.
 * Represents the link between a Discord user and their site account.
 */
export interface linkedUser {
	_id: Types.ObjectId,
	discordId: string,
	discordUsername: string,
	siteId: number,
	roles: string[],
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
	discordUsername: { type: String, required: true },
	roles: { type: [String], required: true },
}, { timestamps: true, strict: true }));

/**
 * Interface for MessageStats documents in the database.
 * Tracks monthly message counts per channel in a guild.
 */
export interface messageStats {
	_id: Types.ObjectId,
	guildId: string,
	channelId: string,
	parentChannelId?: string,
	parentChannelName?: string,
	categoryName: string,
	categoryId: string,
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
	categoryName: { type: String, required: true },
	categoryId: { type: String, required: true },
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

/**
 * Interface for voteRecord subdocument.
 * Represents an individual user's vote choice.
 */
interface voteRecord {
	userId: string;
	displayName: string;
	choice: "yes" | "no" | "abstain";
}

/**
 * Interface for proxyVoteRecord subdocument.
 * Represents a proxy vote with holder and target information.
 */
interface proxyVoteRecord {
	holderId: string;
	holderDisplayName: string;
	targetPseudo: string;
	choice: "yes" | "no" | "abstain";
}

/**
 * Interface for voteDocument in the database.
 * Represents a voting session with question, status, and associated votes.
 */
export interface voteDocument {
	messageId: string;
	channelId: string;
	question: string;
	isAnonymous: boolean;
	isClosed: boolean;
	votes: voteRecord[];
	proxyVotes: proxyVoteRecord[];
}

/**
 * Mongoose model for Vote collection.
 * Manages voting sessions with user votes and proxy votes.
 */
export const Vote = model<voteDocument>("Vote", new Schema<voteDocument>({
	messageId: { type: String, required: true, unique: true },
	channelId: { type: String, required: true },
	question: { type: String, required: true },
	isAnonymous: { type: Boolean, required: true, default: false },
	isClosed: { type: Boolean, required: true, default: false },
	votes: [{
		userId: { type: String, required: true },
		displayName: { type: String, required: true },
		choice: { type: String, enum: ["yes", "no", "abstain"], required: true },
	}],
	proxyVotes: [{
		holderId: { type: String, required: true },
		holderDisplayName: { type: String, required: true },
		targetPseudo: { type: String, required: true },
		choice: { type: String, enum: ["yes", "no", "abstain"], required: true },
	}],
}));
