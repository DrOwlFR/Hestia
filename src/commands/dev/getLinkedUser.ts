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

	/**
	 * Execute: main handler for the `getlinkeduser` command.
	 * Summary: Fetch user information from the site's API
	 * for the provided Discord ID via the client's `functions.getUser` helper, which performs a `fetch`
	 * to the configured API endpoint `/api/discord/users/:id`.
	 * Behavior:
	 * - `functions.getUser` returns a `Response` object from `fetch`.
	 * - This method checks for common HTTP statuses (429 rate limit, 404 not found).
	 * - On success (2xx), it parses the JSON payload with `response.json()` and replies.
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		// Extract options helper from the interaction
		const { options } = interaction;

		// Obtain the Discord ID provided by the user (required option)
		const discordId = options.getString("discordid")!;

		// Query the site's API using the client's helper function which performs a `fetch`
		// to the configured API. The helper returns a standard `Response` object.
		const getResponse = await this.client.functions.getUser(discordId);

		// Handle rate-limited responses: inform the user and stop
		if (getResponse.status === 429) return interaction.reply({ content: "Rate limit atteint.", flags: MessageFlags.Ephemeral });

		// Handle not-found responses: inform the user that no linked account exists on the writing site
		if (getResponse.status === 404) return interaction.reply({ content: "L'utilisateur recherché n'est pas enregistré comme lié au site.", flags: MessageFlags.Ephemeral });

		// On success (2xx): parse the JSON body containing user info from the site and reply with the payload (ephemeral)
		interaction.reply({ content: `L'utilisateur recherché renvoie \`${JSON.stringify(await getResponse.json())}\`.`, flags: MessageFlags.Ephemeral });

	}
}
