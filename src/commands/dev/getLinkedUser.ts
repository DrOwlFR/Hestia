import { Command } from "sheweny";
import type { ShewenyClient } from "sheweny";
import { ApplicationCommandOptionType, MessageFlags, type ChatInputCommandInteraction } from "discord.js";

export class GetLinkedUserCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "getlinkeduser",
			description: "Émet un évènement au choix.",
			category: "Dev",
			adminsOnly: true,
			options: [{
				name: "discordid",
				description: "ID du compte Discord.",
				type: ApplicationCommandOptionType.String,
				required: true,
			}],
		});
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const { options } = interaction;

		const discordId = options.getString("discordid")!;

		const getResponse = await this.client.functions.getUser(discordId);

		if (getResponse.status === 404) return interaction.reply({ content: "L'utilisateur recherché n'est pas enregistré comme lié au site.", flags: MessageFlags.Ephemeral });

		interaction.reply({ content: `L'utilisateur recherché renvoie \`${JSON.stringify(await getResponse.json())}\`.`, flags: MessageFlags.Ephemeral });

	}
}
