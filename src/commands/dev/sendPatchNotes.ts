import { ApplicationCommandOptionType, type AutocompleteInteraction, ChannelType, type ChatInputCommandInteraction, Guild, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

import { versionsMessages } from "../../structures/utils/versionsMessages";

export class SendPatchNotesCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "sendpatchnotes",
			description: "Permet d'envoyer des notes de patch.",
			category: "Dev",
			adminsOnly: true,
			usage: "sendpatchnotes [version]",
			examples: ["sendpatchnotes 1.0.0"],
			options: [{
				name: "version",
				description: "Version que vous souhaitez envoyer.",
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			}],
		});
	}

	/**
	 * Execute: main handler for the `sendpatchnotes` command.
	 * Summary: Sends the patch notes message for a specified version in the current channel.
	 * Steps:
	 * - Check if guild is valid and channel is a text channel
	 * - Get the version from command options
	 * - Retrieve the corresponding version message
	 * - Acknowledge the command and inform about sending process
	 * - Send the version message in the current channel
	 * @param interaction - The slash command interaction.
	 */
	async execute(interaction: ChatInputCommandInteraction) {

		// Ensure the interaction is within a guild and a text channel
		const { channel, guild, options } = interaction;
		if (!(guild instanceof Guild)) return;
		if (!channel || channel.type !== ChannelType.GuildText) return;

		// Get the version to send
		const version = options.getString("version", true);

		// Get the corresponding version message and check if it exists
		const versions = versionsMessages(this.client);
		if (!Object.prototype.hasOwnProperty.call(versions, version)) {
			await interaction.reply({ content: `<:round_cross:1424312051794186260> La version \`${version}\` est introuvable, veuillez selectionner une version existante.`, ephemeral: true });
			return;
		}

		// Acknowledge the command and inform about sending process
		await interaction.reply({ content: `<:round_check:1424065559355592884> Envoi de la note de patch de la version \`${version}\` en cours...`, flags: MessageFlags.Ephemeral });

		// Send the version message in the current channel
		await channel.send({
			components: [versions[version as keyof typeof versions]],
			flags: MessageFlags.IsComponentsV2 });

	}
	// Autocomplete handler for the version option
	onAutocomplete(interaction: AutocompleteInteraction) {
		const { options, guild } = interaction;
		if (!(guild instanceof Guild)) return;

		// Get the focused option and filter version choices
		const focusedOption = options.getFocused(true);
		const choices = Object.keys(versionsMessages(this.client));
		const filteredChoices = choices.filter((choice) => choice.startsWith(focusedOption.value)).slice(0, 25);

		// Respond with the filtered choices
		interaction
			.respond(filteredChoices.map((choice) => ({ name: choice, value: choice })))
			// eslint-disable-next-line no-console
			.catch(console.error);
	}
}
