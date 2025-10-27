import type { AutocompleteInteraction, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import type { ShewenyClient } from "sheweny";
import { Command } from "sheweny";

export class HelpCommand extends Command {
	constructor(client: ShewenyClient) {
		super(client, {
			name: "help",
			description: "Affiche la liste des commandes, ou de l'aide sur une commande précise.",
			category: "Utile",
			usage: "help <commande>",
			examples: ["help", "help ping"],
			options: [{
				name: "commande",
				description: "Demandez de l'aide pour une commande",
				type: ApplicationCommandOptionType.String,
				autocomplete: true,
			}],
		});
	}

	async execute(interaction: ChatInputCommandInteraction) {

		const commands = Array.from(this.client.util.getCommands());
		const embed = this.client.functions.embed()
			.setAuthor({ name: "Voici la liste de mes commandes.", iconURL: interaction.user.displayAvatarURL() })
			.setThumbnail(this.client.user?.displayAvatarURL());

		if (!interaction.options.getString("commande", false)) {

			embed.setDescription("<:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473>");

			const categories = new Set(commands.map((command) => command.category));

			for (let category of categories) {
				if (category === "Dev") continue;
				const commandInCategory = commands.filter((command) => command.category === category);

				if (!category) category = "Non classée(s)";

				embed.addFields({
					name: `<:right_blue_arrow:1424370479086440654> ${category}`,
					value: `${commandInCategory.map(command => `**\`${command.name}\`** : ${command.description}`).join("\r\n")}`,
				});
			}

			embed.addFields({ name: "<:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473>", value: `**\`help <commande>\`** pour des informations sur une commande spécifique.\n\nExemple : **\`help ping\`**\n\n*En cas de besoin, n'hésitez pas à contacter mon développeur : ${this.client.admins.map(a => interaction.guild?.members.cache.get(a)).join(", ")}*.` });

			return interaction.reply({ embeds: [embed] });
		}

		// eslint-disable-next-line prefer-destructuring
		const command = commands.filter((cmd) => cmd.name === interaction.options.getString("commande"))[0];
		const lines = "<:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473><:line:1424369804839485473>";

		embed.setAuthor({ name: (interaction.member as GuildMember).nickname, iconURL: interaction.user.displayAvatarURL() });
		embed.setTitle(`${command.name} ${command.adminsOnly ? "— ⚠️ Dev Only ⚠️" : ""} ${command.userPermissions.toString() ? `— ⚠️ Requiert : *${command.userPermissions}* ⚠️` : ""}`);
		embed.setDescription(`${command.description}`);
		embed.addFields({ name: "Utilisation", value: `${command.usage}`, inline: true });

		if (command.examples) {
			embed.addFields({ name: `${command.examples.length > 1 ? "Exemples" : "Exemple"}`, value: `${command.examples.length > 1 ? `${(command.examples as string[]).join("\n")}` : `${command.examples}`}`, inline: true });
		}

		embed.addFields({ name: `${lines}`, value: `{} = sous-commande(s) disponible(s)\n<> = option(s) optionnel(s)\n[] = option(s) obligatoire(s)\n\nNe pas inclure les caractères suivants → <> et [] dans vos commandes.\n\n*En cas de besoin, n'hésitez pas à contacter mon développeur : ${this.client.admins.map(a => interaction.guild?.members.cache.get(a)).join(", ")}*.` });

		return interaction.reply({ embeds: [embed] });
	}
	onAutocomplete(interaction: AutocompleteInteraction) {
		const focusedOption = interaction.options.getFocused(true);
		const choices = Array.from(this.client.util.getCommands()).map(cmd => cmd.name);
		const filteredChoices = choices.filter((choice) => choice.startsWith(focusedOption.value)).slice(0, 25);

		interaction
			.respond(filteredChoices.map((choice) => ({ name: choice, value: choice })))
			.catch(console.error);
	}
}
