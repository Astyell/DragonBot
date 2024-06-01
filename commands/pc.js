/**
 * @author Astyell
 * @version 1.0.2 - 09/02/2024
 * @creation 15/10/2023 
 * @description Envoie le lien du site affichant les pokémons de chaque utilisateurs
 */

const { SlashCommandBuilder } = require('discord.js');
const { client, config } = require("../index.js");

module.exports = {
	partials: [],
	intents: []
}

module.exports.create = () => {
	client.application.commands.create
		({
			"name": "pc",
			"description": "Permet de donner le lien vers le site web."

		}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	interaction.reply({ content: 'Pour avoir votre boite pc rendez-vous sur ce site : http://dragonbot.duckdns.org:1096/index.php', embeds: [], ephemeral: false }); // True si je veux que seul la personne qui a activé la command le voi
}