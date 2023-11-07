/**
 * @author Astyell
 * @version 2.0 - 07/11/2023
 * @creation 24/10/2023 
 * @description Permet d'afficher toutes les personnes ayant deux fois le même pokémons non shiny
 */

const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require("../index.js");


module.exports =
{
	partials: [],
	intents: []
}

module.exports.create = () => 
{
	db.query(`SELECT COUNT(*) AS totalPKM FROM Pokemon;`, function (err, totalPokemon, fields) {
		client.application.commands.create
		({
			"name": "doublon", //Nom sensible à la casse, pas de majuscule
			"description": "Renvoie les personnes qui ont des doublons",
			options:
			[
				{
					name: "utilisateur",
					description: "La personne dont tu veux consulter les doublons",
					required: false,
					type: 6
				},
				{
					name: "id_pokemon",
					description: "Le pokémons que tu veux voir",
					required: false,
					type: 4,
					min_value: 1,
					max_value: totalPokemon[0].totalPKM
				}
			]
		}, config.guildId)
	})
};

module.exports.run = async (interaction) => 
{
	/* ------------------------------------------------- */
	/*             Récupérations des données             */
	/* ------------------------------------------------- */

	let cible = interaction.options.getUser('utilisateur');
	let pokemonID = interaction.options.getInteger('id_pokemon');

	/* ------------------------------------------------- */
	/*               Envoie de la réponse                */
	/* ------------------------------------------------- */

	/* Si cible et pokemon id sont null on affiche tout */

	if (cible == null && pokemonID == null)
	{
		db.query(`SELECT PC.Id_DresseurAct, U.nom_utilisateur, PC.Id_Pokemon, p.nom_Pokemon, COUNT(PC.Id_Pokemon) as occurrences FROM PC JOIN Utilisateur U ON PC.Id_DresseurAct = U.Id_Discord JOIN Pokemon p ON p.Id_Pokemon = PC.Id_Pokemon WHERE PC.estShiny = 0 AND nom_utilisateur != 'astyell2' GROUP BY PC.Id_DresseurAct, PC.Id_Pokemon HAVING COUNT(PC.Id_Pokemon) > 1;`, function (err, result, fields) {
			if (err) { console.error(err); }

			if (result.length >= 1)
			{
				let message = "";
				result.forEach(element => {
					message += `- **${element.nom_utilisateur}** possède ${element.occurrences} ${element.nom_Pokemon} (ID : **__${element.Id_Pokemon}__**).\n`;
				}),
		
					interaction.reply({
						content: 'Chef, oui chef !',
						embeds:
							[
								{
									"type": "rich",
									"title": `Listes des personnes ayant des doublons `,
									"description": `${message}`,
									"color": 0x005a5a
								}
							]
					});
		
				return;
			}
			else
			{
				interaction.reply({content: `Il n'y a pas de doublons pour le moment !`, ephemeral : false});
				return;
			}
		});
	}
	if (pokemonID == null && cible != null)
	{
		db.query(`SELECT PC.Id_DresseurAct, U.nom_utilisateur, PC.Id_Pokemon, p.nom_Pokemon, COUNT(PC.Id_Pokemon) as occurrences FROM PC JOIN Utilisateur U ON PC.Id_DresseurAct = U.Id_Discord JOIN Pokemon p ON p.Id_Pokemon = PC.Id_Pokemon WHERE PC.estShiny = 0 AND PC.Id_DresseurAct = ${cible.id} GROUP BY PC.Id_DresseurAct, PC.Id_Pokemon HAVING COUNT(PC.Id_Pokemon) > 1;`, function (err, result, fields) {
			
			if (err) { console.error(err); }

			if (result.length >= 1)
			{
				let message = "";
				result.forEach(element => {
					message += `- **${element.nom_utilisateur}** possède ${element.occurrences} ${element.nom_Pokemon} (ID : **__${element.Id_Pokemon}__**).\n`;
				}),
		
					interaction.reply({
						content: 'Chef, oui chef !',
						embeds:
							[
								{
									"type": "rich",
									"title": `Listes des doublons de ${cible.username}`,
									"description": `${message}`,
									"color": 0x005a5a
								}
							]
					});
		
				return;
			}
			else
			{
				interaction.reply({content: `${cible.username} ne possède pas de doublons !`, ephemeral : false});
				return;
			}
		});
	}
	if (pokemonID != null && cible == null)
	{
		db.query(`SELECT PC.Id_DresseurAct, U.nom_utilisateur, PC.Id_Pokemon, p.nom_Pokemon, COUNT(PC.Id_Pokemon) as occurrences FROM PC JOIN Utilisateur U ON PC.Id_DresseurAct = U.Id_Discord JOIN Pokemon p ON p.Id_Pokemon = PC.Id_Pokemon WHERE PC.estShiny = 0 AND PC.Id_Pokemon = ${pokemonID} GROUP BY PC.Id_DresseurAct, PC.Id_Pokemon HAVING COUNT(PC.Id_Pokemon) > 1;`, function (err, result, fields) {
			
			if (err) { console.error(err); }

			if (result.length >= 1)
			{

				let message = "";
				result.forEach(element => {
					message += `- **${element.nom_utilisateur}** possède ${element.occurrences} ${element.nom_Pokemon} (ID : **__${element.Id_Pokemon}__**).\n`;
				}),
		
					interaction.reply({
						content: 'Chef, oui chef !',
						embeds:
							[
								{
									"type": "rich",
									"title": `Listes des doublons du pokémons n°${pokemonID}`,
									"description": `${message}`,
									"color": 0x005a5a
								}
							]
					});
		
				return;
			}
			else
			{
				interaction.reply({content: `Le pokémon n°${pokemonID} n'existe pas en double !`, ephemeral : false});
				return;
			}
		});
	}
	if (pokemonID != null && cible != null)
	{
		db.query(`SELECT PC.Id_DresseurAct, U.nom_utilisateur, PC.Id_Pokemon, p.nom_Pokemon, COUNT(PC.Id_Pokemon) as occurrences FROM PC JOIN Utilisateur U ON PC.Id_DresseurAct = U.Id_Discord JOIN Pokemon p ON p.Id_Pokemon = PC.Id_Pokemon WHERE PC.estShiny = 0 AND PC.Id_DresseurAct = ${cible.id} AND PC.Id_Pokemon = ${pokemonID} GROUP BY PC.Id_DresseurAct, PC.Id_Pokemon HAVING COUNT(PC.Id_Pokemon) > 1;`, function (err, result, fields) {
			
			if (err) { console.error(err); }

			if (result.length >= 1)
			{

				let message = "";
				result.forEach(element => {
					message += `- **${element.nom_utilisateur}** possède ${element.occurrences} ${element.nom_Pokemon} (ID : **__${element.Id_Pokemon}__**).\n`;
				}),
		
					interaction.reply({
						content: 'Chef, oui chef !',
						embeds:
							[
								{
									"type": "rich",
									"title": `Listes des doublons de ${cible.username} du pokémons n°${pokemonID}`,
									"description": `${message}`,
									"color": 0x005a5a
								}
							]
					});
		
				return;
			}
			else
			{
				interaction.reply({content: `${cible.username} ne possède pas de doublons du pokémon n°${pokemonID} !`, ephemeral : false});
				return;
			}
		});
	}

	
}