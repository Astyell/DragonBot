/**
 * @author Astyell, Kinton
 * @version 1.1 - 13/11/2023
 * @creation 07/11/2023 
 * @description Renvoie les informations sur un pokémon
 */

const snekfetch = require('snekfetch');
const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require ("../index.js");

module.exports = {
    partials: [],
    intents: []
}

module.exports.create = () => {
	db.query(`SELECT COUNT(*) AS totalPKM FROM Pokemon;`, function (err, totalPokemon, fields) {
		client.application.commands.create
			({
				"name": "info", //Nom sensible à la casse, pas de majuscule
				"description": "Permet d'avoir les informations sur un pokémon",
				options:
					[
						{
							name: "id_pokemon",
							description: "Donne l'ID du pokémon que tu veux consulter",
							required: true,
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
		await interaction.deferReply({ ephemeral: false});

		/* ------------------------------------------------- */
		/*             Récupérations des données             */
		/* ------------------------------------------------- */

		let pokemonID = interaction.options.getInteger('id_pokemon');

		/* ------------------------------------------------- */
		/*               Envoie de la réponse                */
		/* ------------------------------------------------- */

		db.query(`SELECT * FROM Pokemon WHERE id_Pokemon = ${pokemonID};`, function (err, resultPokemon, fields) 
		{
			if (err) { console.error(err); }

			/* Récupération des données de la requête*/

			nomPokemon    = resultPokemon[0].nom_Pokemon  ;
			estLegendaire = resultPokemon[0].estLegendaire;
			estFabuleux   = resultPokemon[0].estFabuleux  ;
			tauxCapture   = resultPokemon[0].tauxCapture  ;

			/* Ligne de debug */

			console.log(resultPokemon);

			db.query(`SELECT COUNT(*) AS NBtotalDresseur FROM Utilisateur;`, function (err, countUser, fields) 
			{
				if (err) { console.error(err); }

				/* Récupération des données de la requête*/

				nbUtilisateur = countUser[0].NBtotalDresseur ;

				/* Ligne de debug */

				console.log(nbUtilisateur);

				db.query(`SELECT COUNT(DISTINCT Id_DresseurAct) AS NBtotalDresseurPKM FROM PC WHERE Id_Pokemon = ${pokemonID};`, function (err, countUserPKM, fields) 
				{
					if (err) { console.error(err); }

					/* Récupération des données de la requête*/

					nbUtilisateurPKM = countUserPKM[0].NBtotalDresseurPKM ;

					/* Ligne de debug */

					console.log(nbUtilisateurPKM);

					db.query(`SELECT U.nom_utilisateur, COUNT(PC.Id_Pokemon) AS nombre_pokemon FROM PC JOIN Utilisateur U ON PC.Id_DresseurAct = U.Id_Discord WHERE PC.Id_Pokemon = ${pokemonID} GROUP BY U.nom_utilisateur;`, function (err, selectUser, fields) 
					{
						if (err) { console.error(err); }

						db.query(`SELECT nom_Pokemon, o.Id_Objet, nomObjet, type_Evolution FROM Pokemon p JOIN Evolution e ON e.id_Pokemon_Evolue = p.Id_Pokemon
						JOIN EvolueAvec ea ON e.id_Pokemon_Evoluant = ea.Id_Pokemon AND e.id_Pokemon_Evolue = ea.Id_Pokemon_Evolue
                        JOIN Objet o ON o.Id_Objet = ea.Id_Objet
						WHERE e.id_Pokemon_Evoluant = ${pokemonID};`, function (err, selectEvolution, fields) 
						{
							if (err) { console.error(err); }

							snekfetch.get(`https://pokeapi.co/api/v2/pokemon/${pokemonID}/`).then (captureData => 
							{
								captureData = captureData.body;

								interaction.editReply({content : "", embeds : genererEmbed(pokemonID, nomPokemon, estLegendaire, estFabuleux, tauxCapture, nbUtilisateur, nbUtilisateurPKM, captureData, selectEvolution), components: genererBouton(pokemonID, nomPokemon)});
							})
							return;
						});

					});
				
				});

			});

		});
	
	}
	if (interaction.isButton()) 
	{
		/* On grise le bouton pour empêcher d'appuyer dessus encore */
		interaction.update({ content: '', components: boutonGris() });

		/* On récupère l'ID du channel dans lequel on doit répondre */

		let channel = client.channels.cache.get(interaction.channel.id);

		/* On récupère l'ID du pokémon */
		let ensArgs = interaction.customId.split("_");
		let IDPokemon = ensArgs[2];
		let nomPokemon = ensArgs[3];

		/* On envoit la liste des personnes qui ont le pokémons */

		db.query(`SELECT U.nom_utilisateur, COUNT(PC.Id_Pokemon) AS nombre_pokemon FROM PC JOIN Utilisateur U ON PC.Id_DresseurAct = U.Id_Discord WHERE PC.Id_Pokemon = ${IDPokemon} GROUP BY U.nom_utilisateur;`, function (err, selectUser, fields) 
		{
			if (err) { console.error(err); }

			let liste = "";

			selectUser.forEach(element => 
			{
				liste += `- **${element.nom_utilisateur}** en possède ${element.nombre_pokemon}.\n`;
			})

			if (liste == "")
				liste = "Aucun joueur ne possède ce pokémon !";

			channel.send({content : "", embeds : genererEmbedReponse (nomPokemon, liste)})

		});

	}

}

function genererEmbed (pokemonID, nomPokemon, estLegendaire, estFabuleux, tauxCapture, nbUtilisateur, nbUtilisateurPKM, captureData, selectEvolution)
{
	let Leg, Fab;

	estLegendaire == 1 ? Leg = "Oui" : Leg  = "Non";
	estFabuleux   == 1 ? Fab = "Oui" : Fab  = "Non";

	console.log(selectEvolution);

	let messageEvolution = "";

	selectEvolution.forEach(element => 
	{
		messageEvolution += `${nomPokemon} peut evoluer en **${element.nom_Pokemon}**`;

		switch (element.type_Evolution) 
		{
			case 'N':
				messageEvolution += " (par Niveau)\n";
				break;

			case 'O':
				messageEvolution += ` (par Objet - ${element.nomObjet})\n`;
				break;

			case 'E':
				messageEvolution += " (par Echange - Cable Link)\n";
				break;
			
			case 'B':
				messageEvolution += " (par Bonheur - Noeud Destin)\n";
				break;
			
			case 'A':
				messageEvolution += " (par Attaque - CT)\n";
				break;
		
			default:
				break;
		}
	});

	if (messageEvolution == "") { messageEvolution = "Ce pokémon ne possède pas d'évolution"; }

	let embed = 
	[
		{
		"type": "rich",
		"title": `N°${pokemonID} - ${nomPokemon}`,
		"url": `https://www.pokepedia.fr/${nomPokemon}`,
		"description": `**${nomPokemon}** possède un taux de capture de **${tauxCapture}%** !`,
		"color": 0x00005a,
		"fields": [
			{
			"name": `Est-il légendaire ?`,
			"value": `${Leg}`,
			"inline": true
			},
			{
			"name": `Est-il fabuleux ?`,
			"value": `${Fab}`,
			"inline": true
			},
			{
				"name": `Evolutions :`,
				"value": `${messageEvolution}`,
				"inline": false
			},
			{
			"name": `Nombre de personne qui le possède :`,
			"value": `${nbUtilisateurPKM}/${nbUtilisateur}\n`
			}
		],
		"thumbnail": {
			"url": `${captureData.sprites['front_default']}`,
			"height": 300,
			"width": 300
		}
		}
  	]

	return embed;
}

function genererEmbedReponse (pokemonNom, liste)
{
	let embed = 
	[
		{
		"type": "rich",
		"title": `Liste des utilisateurs ayant capturé ${pokemonNom}`,
		"description": `${liste}`,
		"color": 0x00005a
		}
  	]

	return embed;
}

function genererBouton (pokemonID, nomPokemon)
{
	let components =
	[
		{
		"type": 1,
		"components": 
		[
			{
			"style": 3,
			"label": `Voir la liste des personnes qui possède ce pokémon`,
			"custom_id": `info_generer_${pokemonID}_${nomPokemon}`,
			"disabled": false,
			"emoji": 
			{
				"id": `732610213450088533`,
				"name": `turtwig_tilt`,
				"animated": false
			},
			"type": 2
			}
		]
		}
  	]

	return components;
}

function boutonGris ()
{
	let components =
	[
		{
		"type": 1,
		"components": 
		[
			{
			"style": 3,
			"label": `Voir la liste des personnes qui possède ce pokémon`,
			"custom_id": `row_0_button_0`,
			"disabled": true,
			"emoji": 
			{
				"id": `732610213450088533`,
				"name": `turtwig_tilt`,
				"animated": false
			},
			"type": 2
			}
		]
		}
  	]

	return components;
}