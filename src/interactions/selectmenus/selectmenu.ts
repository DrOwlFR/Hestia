import type { SelectMenuInteraction } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { SelectMenu } from "sheweny";

// ! UNUSED FILE, FRAMEWORK TEMPLATE ONLY

export class SelectComponent extends SelectMenu {
	constructor(client: ShewenyClient) {
		super(client, ["selectId"]);
	}

	/**
	 * Execute: main handler for select menu interactions.
	 * Summary: Handles select menu interactions by replying with a message based on the selected option (framework template, not currently used).
	 * Steps:
	 * - Switch on the first selected value
	 * - Reply with message for "first_option" or "second_option"
	 * @param selectMenu - The select menu interaction triggered by the user.
	 */
	async execute(selectMenu: SelectMenuInteraction) {
		switch (selectMenu.values[0]) {
			case "first_option":
				await selectMenu.reply({ content: "You have choose **first** option !" });
				break;
			case "second_option":
				await selectMenu.reply({ content: "You have choose **second** option !" });
				break;
		}
	}
};
