/**
 * @author Astyell
 * @version 1.0 - 11/12/2023
 * @creation 11/12/2023
 * @description Permet de vendre un pokémon
 */

const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require ("../index.js");

const PRIX40 =  400;
const PRIX30 =  600;
const PRIX20 =  900;
const PRIX5  = 1400;
const PRIX3  = 2000;
const PRIX2  = 2500;

module.exports = {
    partials: [],
    intents: []
}

module.exports.create = () =>
{
	client.application.commands.create
	({
		"name": "vendre", //Nom sensibleà la casse, pas de majuscule
		"description": "Renvoie pong"

	}, config.guildId)


	// db.query(`SELECT COUNT(*) AS totalPKM, taux_capture FROM Pokemon;`, function (err, totalPokemon, fields)
	// {
	// 	client.application.commands.create
	// 	({
	// 		"name": "vendre", //Nom sensible à la casse, pas de majuscule
	// 		"description": "Permet de vendre un pokémon",
	// 		options:
	// 		[
	// 			{
	// 				name: "id_pokemon",
	// 				description: "Donne l'ID du pokémon que tu veux faire évoluer",
	// 				required: true,
	// 				type: 4,
	// 				min_value: 1,
	// 				max_value: totalPokemon[0].totalPKM
	// 			},
	// 			{
	// 				name: "prix",
	// 				description: "Donner le prix du pokemon",
	// 				required: true,
	// 				type: 4,
	// 				min_value: 1,
	// 				max_value: totalPokemon[0].totalPKM
	// 			}
	// 		]

	// 	}, config.guildId)
	// })
};

module.exports.run = async (interaction) => 
{

	interaction.reply({content:'Commande en cours de création !', embeds:[], ephemeral:false}); // True si je veux que seul la personne qui a activé la command le voi
}