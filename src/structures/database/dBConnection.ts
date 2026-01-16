/* eslint-disable no-console */
import { connect } from "mongoose";

import config from "../config";

/**
 * dBConnection: establishes connection to the MongoDB database.
 * Summary: Connects to MongoDB using Mongoose with the provided config, logs success or exits on failure.
 * Steps:
 * - Attempt to connect to MongoDB with MONGO_TOKEN and dbName
 * - Log success message on connection
 * - Log error and exit process if connection fails
 */
export const dBConnection = async (): Promise<void> => {
	try {
		await connect(config.MONGO_TOKEN, {
			dbName: config.dbName,
		});
		console.log("Base de données connectée.");
	} catch (err: unknown) {
		console.error("Impossible de se connecter à la base de données :", err);
		return process.exit(1);
	}
};
