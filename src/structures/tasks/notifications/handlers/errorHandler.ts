import { DiscordAPIError } from "discord.js";
import type { ShewenyClient } from "sheweny";

import config from "../../../config";
import { sendLog } from "../../../utils/functions";

export async function handleSendingError(client: ShewenyClient, error: unknown, userId: string, failedRecipients: string[]): Promise<void> {
	if (error instanceof DiscordAPIError) {
		if (error.code === 50278 || error.code === 50007) {
			await sendLog(client, "notificationsCron", `${config.emojis.cross} Echec de l'envoi de la notification à l'ID \`${userId}\`, ce dernier refuse les MPs :\n\`\`\`${error.message}\n\`\`\``);
			return;
		}
	}

	await sendLog(client, "notificationsCron", `${config.emojis.cross} Echec de l'envoi de la notification à l'ID \`${userId}\` :\n\`\`\`js\n${error}\n\`\`\``);
	failedRecipients.push(userId);
}
