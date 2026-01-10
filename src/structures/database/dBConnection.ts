/* eslint-disable no-console */
import { connect } from "mongoose";

import config from "../config";

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
