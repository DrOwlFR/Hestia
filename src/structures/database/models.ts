import { Document, Types, Schema, model } from "mongoose";

export interface dbUser extends Document {
	_id: Types.ObjectId;
	discordId: string;
	totalMessages: number;
	joinedAt: Date,
	createdAt: Date,
	updatedAt: Date,
}

export const User = model<dbUser>("User", new Schema({
	discordId: { type: String, required: true, unique: true },
	totalMessages: { type: Number, required: true },
	joinedAt: { type: Date, required: true },
}, { timestamps: true }));

export interface linkedUser extends Document {
	_id: Types.ObjectId,
	discordId: string,
	siteId: number,
}

export const LinkedUser = model<linkedUser>("linked_user", new Schema({
	discordId: { type: String, required: true, unique: true },
	siteId: { type: Number, required: true, unique: true },
}, { timestamps: true }));
