/**
 * @author Astyell
 * @version 1.0 - 10/10/2023
 * @creation 10/10/2023 
 * @description Envoie Pong, permet notamment de vérifier le bon fonctionnement des commandes et du bot
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
		"name": "test", //Nom sensibleà la casse, pas de majuscule
		"description": "Renvoie pong"

	}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	interaction.reply({content:'Pong!', embeds:[], ephemeral:false}); // True si je veux que seul la personne qui a activé la command le voi
}