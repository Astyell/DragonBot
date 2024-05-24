/**
 * @author Astyell
 * @version 1.0.2 - 14/01/2023
 * @creation 16/10/2023 
 * @description Permet de capturer un pokémon pour quelqu'un qui a gagné un concours
 */

const snekfetch = require('snekfetch')
const { SlashCommandBuilder, channelLink, userMention } = require('discord.js');
const { client, config, db } = require("../index.js");

module.exports = 
{
	partials: [],
	intents: []
}

module.exports.create = () => 
{
	client.application.commands.create
	({
		"name": "concours",
		"description": "Cette commande vous permet d'attraper un pokémon tous les jours.",
		options:
		[
			{
				name: "utilisateur",
				description: "La personne qui a gagné le concours",
				required: true,
				type: 6
			},
			{
				name: "tauxcapture",
				description: "Permet de définir le taux de capture",
				required: true,
				type: 4,
				min_value: 2,
				max_value: 40
			}
		]

	}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	/* ----------------------------------------------- */
	/*           Initialisation des données            */
	/* ----------------------------------------------- */

	// Récupère les données de l'utilisateur

	let idUser = interaction.options.getUser('utilisateur').id;
	let nameUser = interaction.options.getUser('utilisateur').username;

	let tauxRec = 100 - interaction.options.getInteger('tauxcapture');

	console.log(tauxRec);

	// Date au format AAAA-MM-JJ
	let dateAjd = new Date ();

	// Formatage de la data pour un format correct
	let dateFormate = dateAjd.getFullYear() + "-";

	// Si le mois est < 10 il s'écrira "2" hors nous cherchons à avoir "02"
	(dateAjd.getMonth() + 1) < 10 ? dateFormate += "0" + (dateAjd.getMonth() + 1) : dateFormate += (dateAjd.getMonth() + 1);

	dateFormate += "-" + dateAjd.getDate();

	//console.log(dateAjd);
	//console.log(dateFormate);

	// Récupère le random
	let random = (Math.floor(Math.random() * (100 - tauxRec))) + tauxRec;
	let tauxCapture = -1;

	console.log("Random : " + random);
	
	if      (random <  40)                { tauxCapture = 40; } 
	else if (random >= 40 && random < 70) { tauxCapture = 30; } 
	else if (random >= 70 && random < 90) { tauxCapture = 20; } 
	else if (random >= 90 && random < 95) { tauxCapture =  5; } 
	else if (random >= 95 && random < 98) { tauxCapture =  3; } 
	else if (random >= 98)                { tauxCapture  = 2; } 
	else                                  { tauxCapture = -1; }

	if(tauxCapture == -1) 
	{
		interaction.reply({ content: "Erreur 05, contactez l'administrateur <@228948435259228160>.", ephemeral: false });
		return;
	}

	/* ----------------------------------------------- */
	/*           Test des conditions de jeu            */
	/* ----------------------------------------------- */

	// On vient tester si l'utilisateurs a déjà joué
	db.query(`SELECT * FROM Utilisateur WHERE Id_Discord = ${idUser}`, function (err, result, fields) {
		if (err) { console.error(err); }

		if (!result[0]) 
		{
			db.query(`INSERT INTO Utilisateur VALUES (${idUser}, '${nameUser}', 200)`, function (err, result, fields) {
				if (err) { console.error(err); }
			});
		}
	});

	// On sélectionne le pokémon choisi aléatoirement
	db.query(`SELECT nom_Pokemon FROM Pokemon WHERE tauxCapture = ${tauxCapture}`, function (err, result, fields) 
	{
		// On récupère le nombre total de pokémon avec le taux de capture
		let nbPokemon = result.length;

		if (result.length >= 1)
		{
			let pokemon = result[Math.floor(Math.random() * nbPokemon )].nom_Pokemon;
			console.log(pokemon);

			//pokemon = "M. Mime"; //Si besoin de donner un pokémon particulier

			db.query(`SELECT id_Pokemon, nom_Pokemon FROM Pokemon WHERE nom_Pokemon = '${pokemon}'`, function (err, resultat, fields) 
			{
				if (resultat.length >= 1)
				{
					// La capture est-elle shiny ou non ?
					let isShiny;
					Math.floor(Math.random() * 4096 + 1) == 2 ? isShiny = 1 : isShiny = 0;

					//console.log("1");

					db.query(`INSERT INTO Gagne (Id_Pokemon, Id_Discord, date_Gagne, estShiny) VALUES (${resultat[0].id_Pokemon}, ${idUser}, '${dateFormate}', ${isShiny})`, function (err, results, fields) 
					{
						//console.log("2");

						if (err)
						{
							console.error(err);
							interaction.reply({ content: "Code erreur 02, Contactez l'administrateur <@228948435259228160>.", ephemeral: false });
							return;
						}
								
						const channel = client.channels.cache.get(config.channelLog);
						channel.send(`${nameUser} as gagné un ` + resultat[0].nom_Pokemon + `.`);

						if (resultat[0].id_Pokemon == 132 || resultat[0].id_Pokemon == 570 || resultat[0].id_Pokemon == 571 ) 
						{
							idEaster = Math.floor(Math.random() * 151);

							snekfetch.get(`https://pokeapi.co/api/v2/pokemon/${idEaster}/`).then (captureData => 
							{
								interaction.reply({content : `<@${idUser}>`, embeds : genererEmbed(nameUser, resultat[0].nom_Pokemon, isShiny, tauxCapture, resultat[0].id_Pokemon, captureData), ephemeral: false });
							})
							return;
						}
						else
						{
							snekfetch.get(`https://pokeapi.co/api/v2/pokemon/${resultat[0].id_Pokemon}/`).then (captureData => 
							{
								interaction.reply({content : `<@${idUser}>`, embeds : genererEmbed(nameUser, resultat[0].nom_Pokemon, isShiny, tauxCapture, resultat[0].id_Pokemon, captureData), ephemeral: false });
							})
							return;
						}
					});
				}
				else if (resultat.length <= 0)
				{
					interaction.reply({ content: "Code erreur 01, Contactez l'administrateur <@228948435259228160>.", ephemeral: false });
					// Je viens de faire la doc, comment tu fais pour que ça te ping directment ? <@userId> <#ChannelId> Ok merci
				}
				else
				{
					console.error(err)
				}
			});
		}
				
	});

}

function genererEmbed (nomUser, nom_Pokemon, Shiny, tauxCapture, id_Pokemon, captureData)
{
	let embed;
	
	captureData = captureData.body;

	let isShiny;
	Shiny == 1 ? isShiny = "Oui" : isShiny = "Non";

	let nomPokemonURL = nom_Pokemon.replace(" ", "_");

	embed = 
	[{
		"type": "rich",
		"title": `Félictations ${nomUser} tu as gagné un ${nom_Pokemon} (N°${id_Pokemon}) !`,
		"url": `https://www.pokepedia.fr/${nomPokemonURL}`,
		"description": "",
		"color": 0x1b5280,
		"fields": 
		[
			{
			"name": `Est-il shiny ?`,
			"value": `${isShiny}`,
			"inline": false
			},
			{
			"name": `Rareté du pokémon ?`,
			"value": `${tauxCapture} %`,
			"inline": false
			}
		],
		"thumbnail":
		{
			"url": `${captureData.sprites[`front_${Shiny ? "shiny" : "default"}`]}`	
		},
	}]

	return embed;
}