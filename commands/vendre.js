/**
 * @author Astyell
 * @version 1.0 - 11/12/2023
 * @creation 11/12/2023
 * @description Permet de vendre un pokémon
 */

const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require ("../index.js");

module.exports = {
    partials: [],
    intents: []
}

module.exports.create = () => {
	client.application.commands.create
	({
		"name": "vendre", //Nom sensibleà la casse, pas de majuscule
		"description": "Permet de vendre votre pokémon"

	}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	interaction.reply({content:'Commande en cours de création !', embeds:[], ephemeral:false}); // True si je veux que seul la personne qui a activé la command le voi
}