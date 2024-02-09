/**
 * @author Astyell
 * @version 1.0 - 18/10/2023
 * @creation 18/10/2023 
 * @description Permet de lancer des capture de pokémon en contrôlant le taux de ceux-ci
 */

const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require ("../index.js");
const { REST, Routes } = require('discord.js');


module.exports = {
    partials: [],
    intents: []
}

module.exports.create = () => {
	client.application.commands.create
	({
		"name": "debug", //Nom sensibleà la casse, pas de majuscule
		"description": "Debug pokémon"

	}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	if (config.devID != interaction.user.id)
	{
		interaction.reply({content:'Essaie quand tu seras astyell', embeds:[], ephemeral:true});
	}
	else
	{
			//Récupère le random
			let random = Math.floor(Math.random() * 100 );
			let tauxCapture = -1;

			//console.log(random);
			
			if      (random <  40)                { tauxCapture = 40; } 
			else if (random >= 40 && random < 70) { tauxCapture = 30; } 
			else if (random >= 70 && random < 90) { tauxCapture = 20; } 
			else if (random >= 90 && random < 95) { tauxCapture =  5; } 
			else if (random >= 95 && random < 98) { tauxCapture =  3; } 
			else if (random >= 98)                { tauxCapture  = 2; } 
			else                                  { tauxCapture = -1; }

			//tauxCapture = 30;

			db.query(`SELECT nom_Pokemon FROM Pokemon WHERE tauxCapture = ${tauxCapture}`, function (err, result, fields) 
			{
				// On récupère le nombre total de pokémon avec le taux de capture
				let nbPokemon = result.length;

				if (result.length >= 1)
				{
					let pokemon = result[Math.floor(Math.random() * nbPokemon )].nom_Pokemon;
					
					let isShiny;
					Math.floor(Math.random() * 2 + 1) == 2 ? isShiny = 1 : isShiny = 0;

					console.log(random + " - Le pokémon généré est " + pokemon + ". Shiny : " + isShiny);
					interaction.reply({ content: random + " - Le pokémon généré est " + pokemon + ". Shiny : " + isShiny, ephemeral: false });
					return;
				}
				else if (result.length <= 0)
				{
					interaction.reply({ content: "Code erreur 01, Contactez l'administrateur <@228948435259228160>.", ephemeral: false });
					// Je viens de faire la doc, comment tu fais pour que ça te ping directment ? <@userId> <#ChannelId> Ok merci
					return;
				}
				else 
				{ 
					console.error(err);
				}
			});
		
	}
}