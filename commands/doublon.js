/**
 * @author Astyell
 * @version 2.0.1 - 31/01/2023
 * @creation 24/10/2023 
 * @description Permet d'afficher toutes les personnes ayant deux fois le même pokémons non shiny
 */

const { SlashCommandBuilder, embedLength, ReactionUserManager } = require('discord.js');
const { client, config, db } = require("../index.js");


module.exports =
{
	partials: [],
	intents: []
}

module.exports.create = () => 
{
	db.query(`SELECT COUNT(*) AS totalPKM FROM Pokemon;`, function (err, totalPokemon, fields) 
	{
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
	if (interaction.isCommand()) 
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

					let min = 0;
					let max = 20;

					for (let i = min; i < max && i < result.length; i++)
					{
						//console.log(result[i]);
						message += `- **${result[i].nom_utilisateur}** possède ${result[i].occurrences} ${result[i].nom_Pokemon} (ID : **__${result[i].Id_Pokemon}__**).\n`;
					}

					let titre = "Liste des personnes ayant un doublon";

					interaction.reply({ content: 'Chef, oui chef !', embeds : genererEmbed (titre, message), components : genererBouton (min, max, null, null) });
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

					let min = 0;
					let max = 20;

					for (let i = min; i < max && i < result.length; i++)
					{
						//console.log(result[i]);
						message += `- **${result[i].nom_utilisateur}** possède ${result[i].occurrences} ${result[i].nom_Pokemon} (ID : **__${result[i].Id_Pokemon}__**).\n`;
					}

					let titre = `Listes des doublons de ${cible.username}`;

					interaction.reply({ content: 'Chef, oui chef !', embeds : genererEmbed (titre, message), components : genererBouton (min, max, cible.id, null) });
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

					let min = 0;
					let max = 20;

					for (let i = min; i < max && i < result.length; i++)
					{
						//console.log(result[i]);
						message += `- **${result[i].nom_utilisateur}** possède ${result[i].occurrences} ${result[i].nom_Pokemon} (ID : **__${result[i].Id_Pokemon}__**).\n`;
					}

					let titre = `Listes des doublons du pokémons n°${pokemonID}`;

					interaction.reply({ content: 'Chef, oui chef !', embeds : genererEmbed (titre, message), components : genererBouton (min, max, null, pokemonID) });
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

					let min = 0;
					let max = 20;

					for (let i = min; i < max && i < result.length; i++)
					{
						//console.log(result[i]);
						message += `- **${result[i].nom_utilisateur}** possède ${result[i].occurrences} ${result[i].nom_Pokemon} (ID : **__${result[i].Id_Pokemon}__**).\n`;
					}
					
					let titre = `Listes des doublons de ${cible.username} du pokémons n°${pokemonID}`;

					interaction.reply({ content: 'Chef, oui chef !', embeds : genererEmbed (titre, message), components : genererBouton (min, max, cible.id, pokemonID) });
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
	if (interaction.isButton())
	{
		//Récupération des arguments
		let ensArgs = interaction.customId.split("_");

		let min       = ensArgs[1] <=  0 ?  0 : parseInt(ensArgs[2]);
		let max       = ensArgs[2] <= 20 ? 20 : parseInt(ensArgs[3]);
		let cibleID   = ensArgs[3];
		let pokemonID = ensArgs[4];

		//Définition de la requête
		let requete;
		let titre;

		if (cibleID != null)
		{
			client.users.fetch(cibleID, { force: true }).then(user => 
			{	
				if (pokemonID == null) 
				{
					requete = `SELECT PC.Id_DresseurAct, U.nom_utilisateur, PC.Id_Pokemon, p.nom_Pokemon, COUNT(PC.Id_Pokemon) as occurrences FROM PC JOIN Utilisateur U ON PC.Id_DresseurAct = U.Id_Discord JOIN Pokemon p ON p.Id_Pokemon = PC.Id_Pokemon WHERE PC.estShiny = 0 AND PC.Id_DresseurAct = ${cibleID} GROUP BY PC.Id_DresseurAct, PC.Id_Pokemon HAVING COUNT(PC.Id_Pokemon) > 1;`
					titre   = `Listes des doublons de ${user.username}`;
				}
				else                                           
				{
					requete = `SELECT PC.Id_DresseurAct, U.nom_utilisateur, PC.Id_Pokemon, p.nom_Pokemon, COUNT(PC.Id_Pokemon) as occurrences FROM PC JOIN Utilisateur U ON PC.Id_DresseurAct = U.Id_Discord JOIN Pokemon p ON p.Id_Pokemon = PC.Id_Pokemon WHERE PC.estShiny = 0 AND PC.Id_DresseurAct = ${cibleID} AND PC.Id_Pokemon = ${pokemonID} GROUP BY PC.Id_DresseurAct, PC.Id_Pokemon HAVING COUNT(PC.Id_Pokemon) > 1;`
					titre   = `Listes des doublons de ${user.username} du pokémons n°${pokemonID}`;
				}
		
				db.query(requete, function (err, result, fields) 
				{
					if (err) { console.error(err); }
						
					//console.log(result);
						
					if (result.length >= 1)
					{
						let message = "";
							
						console.log("result taille : " + result.length)
							
						for (let i = min; i < max && i < result.length; i++)
						{
							message += `- **${result[i].nom_utilisateur}** possède plusieurs ${result[i].nom_Pokemon} (ID : **__${result[i].Id_Pokemon}__**).\n`;
						}
							
						interaction.update 
						({
							content: 'Cela pourrait peut-être vous intéresser !', embeds: genererEmbed(titre, message), components : genererBouton (min, max, user.id, pokemonID)					
						})
						return;
					}
					else
					{
						interaction.reply({content: `Il n'y a pas de doublons intéressant pour ${cible.username} pour le moment !`, ephemeral : false});
						return;
					}
				});
			});
		}
		else
		{
			if (pokemonID == null) 
			{
				requete = "SELECT PC.Id_DresseurAct, U.nom_utilisateur, PC.Id_Pokemon, p.nom_Pokemon, COUNT(PC.Id_Pokemon) as occurrences FROM PC JOIN Utilisateur U ON PC.Id_DresseurAct = U.Id_Discord JOIN Pokemon p ON p.Id_Pokemon = PC.Id_Pokemon WHERE PC.estShiny = 0 AND nom_utilisateur != 'astyell2' GROUP BY PC.Id_DresseurAct, PC.Id_Pokemon HAVING COUNT(PC.Id_Pokemon) > 1;";
				titre   = "Liste des personnes ayant un doublon";
			}
			else
			{
				requete = `SELECT PC.Id_DresseurAct, U.nom_utilisateur, PC.Id_Pokemon, p.nom_Pokemon, COUNT(PC.Id_Pokemon) as occurrences FROM PC JOIN Utilisateur U ON PC.Id_DresseurAct = U.Id_Discord JOIN Pokemon p ON p.Id_Pokemon = PC.Id_Pokemon WHERE PC.estShiny = 0 AND PC.Id_Pokemon = ${pokemonID} GROUP BY PC.Id_DresseurAct, PC.Id_Pokemon HAVING COUNT(PC.Id_Pokemon) > 1;`
				titre   = `Listes des doublons du pokémons n°${pokemonID}`;
			}

			db.query(requete, function (err, result, fields) 
			{
				if (err) { console.error(err); }
						
				//console.log(result);
						
				if (result.length >= 1)
				{
					let message = "";
						
					console.log("result taille : " + result.length)
					
					for (let i = min; i < max && i < result.length; i++)
					{
						message += `- **${result[i].nom_utilisateur}** possède plusieurs ${result[i].nom_Pokemon} (ID : **__${result[i].Id_Pokemon}__**).\n`;
					}
						
					interaction.update 
					({
						content: 'Cela pourrait peut-être vous intéresser !', embeds: genererEmbed(titre, message), components : genererBouton (min, max, user.id, pokemonID)					
					})
					return;
				}
				else
				{
					interaction.reply({content: `Il n'y a pas de doublons intéressant pour ${cible.username} pour le moment !`, ephemeral : false});
					return;
				}
			});
		}
	
	}
	
}

function genererEmbed (title, message)
{
	let embed;

	embed = 
	[
		{
			"type": "rich",
			"title": `${title}`,
			"description": `${message}`,
			"color": 0x005a5a
		}
	];

	return embed;
}

function genererBouton (min, max, idUser, idPok)
{
	let bouton;

	bouton =
	[
		{
		"type": 1,
		"components": [
			{
			"style": 4,
			"label": `Précédent `,
			"custom_id": `doublon_${(min-20)}_${(max-20)}_${idUser}_${idPok}`,
			"disabled": false,
			"emoji": {
				"id": null,
				"name": `⬅`
			},
			"type": 2
			},
			{
			"style": 3,
			"label": `Suivant`,
			"custom_id": `doublon_${(min+20)}_${(max+20)}_${idUser}_${idPok}`,
			"disabled": false,
			"emoji": {
				"id": null,
				"name": `➡`
			},
			"type": 2
			}
		]
		}
	];

	return bouton;
}