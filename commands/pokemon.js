/**
 * @author Astyell, Kinton
 * @version 1.1.2 - 06/11/2023
 * @creation 14/10/2023 
 * @description Permet de capturer un pokémon selon un taux de capture défini dans la base de donnée
 */

const snekfetch = require('snekfetch')
const { SlashCommandBuilder, channelLink } = require('discord.js');
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
			"name": "pokemon",
			"description": "Cette commande vous permet d'attraper un pokémon tous les jours."

		}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	/* ----------------------------------------------- */
	/*           Initialisation des données            */
	/* ----------------------------------------------- */

	// Récupère les données de l'utilisateur

	let idUser = interaction.user.id;
	let nameUser = interaction.user.username;

	// Date au format AAAA-MM-JJ
	let dateAjd = new Date();

	// Formatage de la data pour un format correct
	let dateFormate = dateAjd.getFullYear() + "-";

	// Si le mois est < 10 il s'écrira "2" hors nous cherchons à avoir "02"
	(dateAjd.getMonth() + 1) < 10 ? dateFormate += "0" + (dateAjd.getMonth() + 1) : dateFormate += (dateAjd.getMonth() + 1);

	dateFormate += "-" + dateAjd.getDate();

	//console.log(dateAjd);
	//console.log(dateFormate);

	// Récupère le random
	let random = Math.floor(Math.random() * 100 );
	let tauxCapture = -1;

	console.log(random);
	
	if      (random <  40)                { tauxCapture = 40; } 
	else if (random >= 40 && random < 70) { tauxCapture = 30; } 
	else if (random >= 70 && random < 90) { tauxCapture = 20; } 
	else if (random >= 90 && random < 95) { tauxCapture =  5; } 
	else if (random >= 95 && random < 98) { tauxCapture =  3; } 
	else if (random >= 98)                { tauxCapture  = 2; } 
	else                                  { tauxCapture = -1; }

	if(tauxCapture == -1) 
	{
		interaction.reply({ content: "Erreur 03, contactez l'administrateur <@228948435259228160>.", ephemeral: false });
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

	// On test si l'utilisateur a déjà joué aujourd"hui 
	db.query(`SELECT * FROM Capture WHERE Id_Discord = ${idUser} AND date_capture = '${dateFormate}'`, function (err, result, fields) {

		// Si il y a un résultat il a déjà joué
		if (result.length >= 1) 
		{
			interaction.reply({ content: "Erreur, tu as déjà joué, essaie demain !", ephemeral: false });
			return;
		}

		// Sinon on le fait jouer
		else if (result.length <= 0) 
		{

			// On sélectionne le pokémon choisi aléatoirement
			db.query(`SELECT nom_Pokemon FROM Pokemon WHERE tauxCapture = ${tauxCapture}`, function (err, result, fields) 
			{
				// On récupère le nombre total de pokémon avec le taux de capture
				let nbPokemon = result.length;

				if (result.length >= 1)
				{
					let pokemon = result[Math.floor(Math.random() * nbPokemon )].nom_Pokemon;
					console.log(pokemon);

					db.query(`SELECT id_Pokemon, nom_Pokemon FROM Pokemon WHERE nom_Pokemon = '${pokemon}'`, function (err, resultat, fields) 
					{
						if (resultat.length >= 1)
						{
							// La capture est-elle shiny ou non ?
							let isShiny;
							Math.floor(Math.random() * 4096 + 1) == 2 ? isShiny = 1 : isShiny = 0;

							//console.log("1");

							db.query(`INSERT INTO Capture VALUES (${resultat[0].id_Pokemon}, ${idUser}, '${dateFormate}', ${isShiny})`, function (err, results, fields) 
							{
								//console.log("2");

								if (err)
								{
									console.error("3");
									interaction.reply({ content: "Code erreur 02, Contactez l'administrateur <@228948435259228160>.", ephemeral: false });
									return;
								}
								
								const channel = client.channels.cache.get(config.channelLog);
								channel.send(`${nameUser} as capturé un ` + resultat[0].nom_Pokemon + `.`);

								if (resultat[0].id_Pokemon == 132 || resultat[0].id_Pokemon == 570 || resultat[0].id_Pokemon == 571 ) 
								{
									idEaster = Math.floor(Math.random() * 151);

									snekfetch.get(`https://pokeapi.co/api/v2/pokemon/${idEaster}/`).then (captureData => 
									{
									interaction.reply({content : "", embeds : genererEmbed(nameUser, resultat[0].nom_Pokemon, isShiny, tauxCapture, resultat[0].id_Pokemon, captureData), ephemeral: false });
									})
									return;
								}
								else
								{
									snekfetch.get(`https://pokeapi.co/api/v2/pokemon/${resultat[0].id_Pokemon}/`).then (captureData => 
									{
									interaction.reply({content : "", embeds : genererEmbed(nameUser, resultat[0].nom_Pokemon, isShiny, tauxCapture, resultat[0].id_Pokemon, captureData), ephemeral: false });
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
		else
		{
			console.error(err)
			interaction.reply({ content: 'Erreur, commande en cours de développement', embeds: [], ephemeral: false });
			return;	
		}
	});


}

function genererEmbed (nomUser, nom_Pokemon, Shiny, tauxCapture, id_Pokemon, captureData)
{
	let embed;
	
	captureData = captureData.body;

	let isShiny;
	Shiny == 1 ? isShiny = "Oui" : isShiny = "Non";

	

	embed = 
	[{
		"type": "rich",
		"title": `Félictations ${nomUser} tu as capturé un ${nom_Pokemon} (N°${id_Pokemon}) !`,
		"url": `https://www.pokepedia.fr/${nom_Pokemon}`,
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