/* eslint-disable no-console */
import fs from "fs";

import type { TextChannel } from "discord.js";
import type { Document, Model } from "mongoose";
import { mongo } from "mongoose";

import config from "../config";
import type { dbUser, linkedUser, messageStats } from "../database/models";

/**
 * backupCollection: backs up a MongoDB collection to a JSON file.
 * Summary: Fetches all documents from a collection, stringifies them, and writes to a timestamped JSON file, logging success or error.
 * Steps:
 * - Fetch all documents from the model
 * - Stringify documents to BSON EJSON
 * - Generate timestamped filename and write file
 * - Send success/error message to log channel
 * @param Model - The Mongoose model for the collection to backup.
 * @param collectionName - The name of the collection for the filename.
 * @param logChannel - The Discord channel to send log messages.
 */
export async function backupCollection<T extends Document = Document>(Model: Model<T>, collectionName: string, logChannel: TextChannel) {
	try {
		const docs = await Model.find().lean();
		const data = mongo.BSON.EJSON.stringify(docs, { relaxed: false });

		const now = new Date();
		const formattedDateTime = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);

		await fs.promises.writeFile(`${collectionName}-${formattedDateTime}.json`, data, "utf8");

		logChannel.send(`${config.emojis.check} La sauvegarde hebdomadaire de la collection \`${collectionName}\` s'est effectuée correctement.`);
	} catch (err) {
		console.error(err);
		logChannel.send(`${config.emojis.cross} <@${config.botAdminsIds[0]}> La sauvegarde hebdomadaire de la collection \`${collectionName}\` a échoué : \`${err}\``);
	}
}

/**
 * weeklyDBBackup: performs weekly backup of database collections.
 * Summary: Backs up Users, LinkedUsers, and MessagesStats collections concurrently and logs completion.
 * Steps:
 * - Run backupCollection for each model in parallel
 * - Log completion to console and channel
 * @param User - The User model.
 * @param LinkedUser - The LinkedUser model.
 * @param MessagesStats - The MessagesStats model.
 * @param logChannel - The Discord channel to send log messages.
 */
export async function weeklyDBBackup(User: Model<dbUser>, LinkedUser: Model<linkedUser>, MessagesStats: Model<messageStats>, logChannel: TextChannel) {
	await Promise.all([
		backupCollection(User, "Users", logChannel),
		backupCollection(LinkedUser, "LinkedUsers", logChannel),
		backupCollection(MessagesStats, "MessagesStats", logChannel),
	]);
	console.log("✅ Fin du script de sauvegarde hebdomadaire de la base de données.");
	logChannel.send(`${config.emojis.check} Fin du script de sauvegarde hebdomadaire de la base de données.`);
}
