import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

export class EmitCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "emit",
			description: "Émet un évènement au choix.",
			category: "Dev",
			adminsOnly: true,
			usage: "emit [événement]",
			examples: ["emit guildMemberAdd"],
			clientPermissions: ["Administrator"],
			options: [{
				name: "événement",
				description: "Choisir un événement à émettre.",
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: [
					{
						name: "guildMemberAdd",
						value: "guildMemberAdd",
					},
					{
						name: "guildMemberRemove",
						value: "guildMemberRemove",
					},
				],
			}],
		});
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const { options, member } = interaction;

		const choice = options.getString("événement");

		switch (choice) {
			case "guildMemberAdd":
				this.client.emit("guildMemberAdd", member as GuildMember);
				interaction.reply({ content: "<:round_check:1424065559355592884> L'événement `guildMemberAdd` a été émis avec succès.", flags: MessageFlags.Ephemeral });
				break;
			case "guildMemberRemove":
				this.client.emit("guildMemberRemove", member as GuildMember);
				interaction.reply({ content: "<:round_check:1424065559355592884> L'événement `guildMemberRemove` a été émis avec succès.", flags: MessageFlags.Ephemeral });
				break;
		}

	}
}
