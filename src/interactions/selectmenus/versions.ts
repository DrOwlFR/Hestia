import { Guild, MessageFlags, type StringSelectMenuInteraction } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { SelectMenu } from "sheweny";

import config from "../../structures/config";
import { versionsMessages, versionsSelectMenu } from "../../structures/utils/versionsMessages";

export class VersionsSelectMenu extends SelectMenu {
	constructor(client: ShewenyClient) {
		super(client, ["versionsSelectMenu"]);
	}

	/**
	 * Execute: handler for the `versionsSelectMenu` select menu interaction.
	 * Summary: Updates the message with the patch notes corresponding to the selected version.
	 * Steps:
	 * - Check if guild is valid
	 * - Retrieve the selected version from the interaction
	 * - Get the corresponding version message
	 * - Update the original message with the new version notes
	 * @param selectMenu - The select menu interaction triggered by the user.
	 */
	async execute(selectMenu: StringSelectMenuInteraction) {

		// Ensure the interaction is within a guild
		const { guild } = selectMenu;
		if (!(guild instanceof Guild)) return;

		// Get the selected version and corresponding message
		const [version] = selectMenu.values;
		const versions = versionsMessages(this.client);

		// Get the embed/message for the selected version
		const embed = versions[version as keyof typeof versions];

		// If no embed found for the version, inform the user
		if (!embed) {
			return selectMenu.update({
				content: `${config.emojis.cross} Cette version n'existe plus.`,
				components: [versionsSelectMenu],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Update the select menu message with the selected version notes
		await selectMenu.update({
			components: [embed, versionsSelectMenu],
			flags: MessageFlags.IsComponentsV2,
		});
	}
};
