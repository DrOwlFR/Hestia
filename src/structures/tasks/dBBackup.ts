/* eslint-disable no-console */
import fs from "fs";

import type { Document, Model } from "mongoose";
import { mongo } from "mongoose";
import type { ShewenyClient } from "sheweny";

import config from "../config";
import type { dbUser, linkedUser, messageStats } from "../database/models";
import { sendLog } from "../utils/functions";

/**
 * backupCollection: backs up a MongoDB collection to a JSON file.
 * Summary: Fetches all documents from a collection, stringifies them, and writes to a timestamped JSON file, logging success or error.
 * Steps:
 * - Fetch all documents from the model
 * - Stringify documents to BSON EJSON
 * - Generate timestamped filename and write file
 * - Send success/error message to log channel
 * @param client - The ShewenyClient instance for logging.
 * @param Model - The Mongoose model for the collection to backup.
 * @param collectionName - The name of the collection for the filename.
 */
export async function backupCollection<T extends Document = Document>(client: ShewenyClient, Model: Model<T>, collectionName: string) {
	try {
		const docs = await Model.find().lean();
		const data = mongo.BSON.EJSON.stringify(docs, { relaxed: false });

		const now = new Date();
		const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
		const timezoneOffset = -now.getTimezoneOffset();
		const timezoneSign = timezoneOffset >= 0 ? "+" : "-";
		const timezoneHours = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, "0");
		const timezoneMinutes = String(Math.abs(timezoneOffset) % 60).padStart(2, "0");
		const formattedDateTime = `${localDate.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19)}_UTC${timezoneSign}${timezoneHours}-${timezoneMinutes}`;

		await fs.promises.writeFile(`${collectionName}-${formattedDateTime}.json`, data, "utf8");

		await sendLog(client, "dbBackupCron", `${config.emojis.check} La sauvegarde hebdomadaire de la collection \`${collectionName}\` s'est effectuée correctement.`);
	} catch (err) {
		console.error(err);
		await sendLog(client, "dbBackupCron", `${config.emojis.cross} <@${config.botAdminsIds[0]}> La sauvegarde hebdomadaire de la collection \`${collectionName}\` a échoué : \`${err}\``);
	}
}

/**
 * weeklyDBBackup: performs weekly backup of database collections.
 * Summary: Backs up Users, LinkedUsers, and MessagesStats collections concurrently and logs completion.
 * Steps:
 * - Run backupCollection for each model in parallel
 * - Log completion to console and channel
 * @param client - The ShewenyClient instance for logging.
 * @param User - The User model.
 * @param LinkedUser - The LinkedUser model.
 * @param MessagesStats - The MessagesStats model.
 */
export async function weeklyDBBackup(client: ShewenyClient, User: Model<dbUser>, LinkedUser: Model<linkedUser>, MessagesStats: Model<messageStats>) {
	console.log("⌚ Lancement de la sauvegarde hebdomadaire de la base de données...");
	await sendLog(client, "dbBackupCron", `${config.emojis.loading} Lancement de la sauvegarde hebdomadaire de la base de données...`);
	await Promise.all([
		backupCollection(client, User, "Users"),
		backupCollection(client, LinkedUser, "LinkedUsers"),
		backupCollection(client, MessagesStats, "MessagesStats"),
	]);
	console.log("✅ Fin du script de sauvegarde hebdomadaire de la base de données.");
	await sendLog(client, "dbBackupCron", `${config.emojis.check} Fin du script de sauvegarde hebdomadaire de la base de données.`);
}
