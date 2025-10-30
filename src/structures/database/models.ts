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
