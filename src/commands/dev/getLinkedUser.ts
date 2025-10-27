import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

export class GetLinkedUserCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "getlinkeduser",
			description: "Renvoie les informations du site à propos d'un id Discord.",
			category: "Dev",
			adminsOnly: true,
			usage: "getLinkedUser [discordId]",
			examples: ["getLinkedUser 123456789123456789"],
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
