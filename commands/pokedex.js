/**
 * @author Astyell
 * @version 1.0 - 15/10/2023
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
			"name": "pokedex",
			"description": "Commande en cours de création, permettra de voir tous les pokémons attrapés."

		}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	interaction.reply({ content: 'Pour avoir le pokedex et les stats rendez-vous sur ce site : https://m104.ovh/Dragonbot/', embeds: [], ephemeral: false }); // True si je veux que seul la personne qui a activé la command le voi
}