/* eslint-disable no-console */
import fs from "fs";

import type { TextChannel } from "discord.js";
import type { Document, Model } from "mongoose";
import { mongo } from "mongoose";

import config from "../config";
import type { dbUser, linkedUser, messageStats } from "../database/models";

export async function backupCollection<T extends Document = Document>(Model: Model<T>, collectionName: string, logChannel: TextChannel) {
	try {
		const docs = await Model.find().lean();
		const data = mongo.BSON.EJSON.stringify(docs, { relaxed: false });

		const now = new Date();
		const formattedDateTime = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);

		await fs.promises.writeFile(`${collectionName}-${formattedDateTime}.json`, data, "utf8");

		logChannel.send(`<:round_check:1424065559355592884> La sauvegarde hebdomadaire de la collection \`${collectionName}\` s'est effectuée correctement.`);
	} catch (err) {
		console.error(err);
		logChannel.send(`<:round_cross:1424312051794186260> <@${config.botAdminsIds[0]}> La sauvegarde hebdomadaire de la collection \`${collectionName}\` a échoué : \`${err}\``);
	}
}

export async function weeklyDBBackup(User: Model<dbUser>, LinkedUser: Model<linkedUser>, MessagesStats: Model<messageStats>, logChannel: TextChannel) {
	await Promise.all([
		backupCollection(User, "Users", logChannel),
		backupCollection(LinkedUser, "LinkedUsers", logChannel),
		backupCollection(MessagesStats, "MessagesStats", logChannel),
	]);
	console.log("✅ Fin du script de sauvegarde hebdomadaire de la base de données.");
	logChannel.send("<:round_check:1424065559355592884> Fin du script de sauvegarde hebdomadaire de la base de données.");
}
