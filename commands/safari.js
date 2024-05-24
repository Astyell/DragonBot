/**
 * @author Astyell
 * @version 1.0 - 24/05/2024
 * @creation 24/05/2024 
 * @description Permet de capturer des pokémons en plus chaque jour
 */

const snekfetch = require('snekfetch');
const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require ("../index.js");

module.exports = 
{
    partials: [],
    intents: []
}

module.exports.create = () => 
{
	client.application.commands.create
	({
		"name": "safari", //Nom sensible à la casse, pas de majuscule
		"description": "Permet de capturer des pokémons en plus chaque jours (Maximum 10 par commande)",
		options:
		[
			{
				name: "quantite",
				description: "Donne le nombre de pokémon que tu veux capturer (1000P par pokemon)",
				required: true,
				type: 4,
				min_value: 1,
				max_value: 10
			},
			{
				name: "bonushiny",
				description: "true = oui false = non (1000P en plus)",
				required: false,
				type: 5
			}
		]

	}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	/* ------------------------------------------------- */
	/*             Mise en place interaction             */
	/* ------------------------------------------------- */

	await interaction.deferReply({ ephemeral: false });

	/* ------------------------------------------------- */
	/*             Récupérations des données             */
	/* ------------------------------------------------- */

	let bonus       = interaction.options.getBoolean('bonushiny');
	let utilisateur = interaction.user;
	let quantite    = interaction.options.getInteger('quantite');

	/* ------------------------------------------------- */
	/*               Envoie de la réponse                */
	/* ------------------------------------------------- */

	let prix;
	bonus == null || bonus == false ? prix = quantite * 1000 : prix = quantite * 1000 + 1000;

	const totalMonnaie = await executeQuery(`SELECT monnaie FROM Utilisateur WHERE Id_Discord = ?`, [utilisateur.id]);

	// Vérification que l'utilisateur a déjà joué
	if (totalMonnaie.length <= 0)
	{
		interaction.reply({ content: "Veuillez commencer à jouer avec /pokemon. Si vous avez déjà joué, contactez <@228948435259228160>.", ephemeral: false });
		return;
	}

	// Vérification qu'il a assez d'argent pour jouer
	if (totalMonnaie[0].monnaie < prix)
	{
		interaction.editReply({content:`Il vous faut ${prix}P pour réaliser cette action ! Faites /stat pour voir votre argent.`, embeds:[], ephemeral:false});
		return;
	}

	// Vérification de la quantité
	if (quantite == 1)
	{
		const tauxCapture = getTauxCapture();

		// On récupère les pokémons possible avec un taux de capture aléatoire
		const ensPKM = await executeQuery(`SELECT id_Pokemon, nom_Pokemon FROM Pokemon WHERE tauxCapture = ?`, tauxCapture);
		const nbPKM = ensPKM.length;

		if (ensPKM.length <= 0)
		{
			interaction.reply({ content: "Erreur 04 : contactez <@228948435259228160>.", ephemeral: false });
			return;
		}
		else
		{
			// On choisit le pokemon
			let pokemon = ensPKM[Math.floor(Math.random() * nbPKM )];
			console.log(pokemon);

			// On regarde s'il est shiny ou non
			let isShiny;
			bonus ? (Math.floor(Math.random() * 510 + 1) == 2 ? isShiny = 1 : isShiny = 0) : (Math.floor(Math.random() * 2048 + 1) == 2 ? isShiny = 1 : isShiny = 0)

			let query  = "INSERT INTO Chasse (Id_Pokemon, Id_Discord, dateChasse, estShiny) VALUES (?, ?, ?, ?)";
			let params = [pokemon.id_Pokemon, utilisateur.id, getDateFormate(), isShiny];

			await executeQuery(query, params);

			query  = `UPDATE Utilisateur SET monnaie = monnaie - ? WHERE Id_Discord = ?`
			params = [prix, utilisateur.id];

			await executeQuery(query, params);

			const channel = client.channels.cache.get(config.channelLog);
			channel.send(`${utilisateur.username} as chassé un ` + pokemon.nom_Pokemon + `.`);

			if (pokemon.id_Pokemon == 132 || pokemon.id_Pokemon == 570 || pokemon.id_Pokemon == 571 ) 
			{
				idEaster = Math.floor(Math.random() * 1025);

				console.log("easteregg");

				snekfetch.get(`https://pokeapi.co/api/v2/pokemon/${idEaster}/`).then (captureData => 
				{
					interaction.editReply({content : "", embeds : genererEmbed(utilisateur.username, pokemon.nom_Pokemon, isShiny, tauxCapture, pokemon.id_Pokemon, captureData) });
				})
				return;
			}
			else
			{
				snekfetch.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.id_Pokemon}/`).then (captureData =>
				{
					interaction.editReply({content : "", embeds : genererEmbed(utilisateur.username, pokemon.nom_Pokemon, isShiny, tauxCapture, pokemon.id_Pokemon, captureData) });
				})
				return;
			}

		}

	}
	else
	{
		let message = "";

		for (let i = 0; i < quantite; i++) 
		{
			// On génère le taux de capture
			const tauxCapture = getTauxCapture();

			// On trouve un pokemon
			const ensPKM = await executeQuery(`SELECT id_Pokemon, nom_Pokemon FROM Pokemon WHERE tauxCapture = ?`, tauxCapture);
			const nbPKM = ensPKM.length;

			// On choisit le pokemon
			let pokemon = ensPKM[Math.floor(Math.random() * nbPKM )];
			console.log(pokemon);

			// On regarde s'il est shiny ou non
			let isShiny;
			bonus ? (Math.floor(Math.random() * 510 + 1) == 2 ? isShiny = 1 : isShiny = 0) : (Math.floor(Math.random() * 2048 + 1) == 2 ? isShiny = 1 : isShiny = 0);

			let query  = "INSERT INTO Chasse (Id_Pokemon, Id_Discord, dateChasse, estShiny) VALUES (?, ?, ?, ?)";
			let params = [pokemon.id_Pokemon, utilisateur.id, getDateFormate(), isShiny];

			await executeQuery(query, params);

			isShiny ? message += ` **${pokemon.nom_Pokemon}** ✨,` :  message += ` **${pokemon.nom_Pokemon}**,`;

			//console.log(message); //debug
		}

		message = message.slice(0, -1);

		let query  = `UPDATE Utilisateur SET monnaie = monnaie - ? WHERE Id_Discord = ?`
		let params = [prix, utilisateur.id];
		
		await executeQuery(query, params);

		const channel = client.channels.cache.get(config.channelLog);
		channel.send(`${utilisateur.username} a chassé ` + message + `.`);

		interaction.editReply({content:`Vous avez chassé${message}. Félicitations et merci pour votre participation !`, embeds:[], ephemeral:false});
		return;

	}

}

function executeQuery(query, params) 
{
    return new Promise((resolve, reject) => 
	{
        db.query(query, params, (err, results) => 
		{
            if (err) 
			{
                reject(err);
            } 
			else 
			{
                resolve(results);
            }
        });
    });
}

function getDateFormate ()
{
	// Date au format AAAA-MM-JJ
	let dateAjd = new Date();

	// Formatage de la data pour un format correct
	let dateFormate = dateAjd.getFullYear() + "-";

	// Si le mois est < 10 il s'écrira "2" hors nous cherchons à avoir "02"
	(dateAjd.getMonth() + 1) < 10 ? dateFormate += "0" + (dateAjd.getMonth() + 1) : dateFormate += (dateAjd.getMonth() + 1);

	dateFormate += "-" + dateAjd.getDate();

	return dateFormate;
}

function getTauxCapture ()
{
	let random = Math.floor(Math.random() * 100 );
	let tauxCapture = -1;

	console.log(random);
	
	if      (random <  40)                { tauxCapture = 40; } 
	else if (random >= 40 && random < 70) { tauxCapture = 30; } 
	else if (random >= 70 && random < 90) { tauxCapture = 20; } 
	else if (random >= 90 && random < 95) { tauxCapture =  5; } 
	else if (random >= 95 && random < 98) { tauxCapture =  3; } 
	else if (random >= 98)                { tauxCapture  = 2; } 
	else  								  { tauxCapture = -1; }

	return tauxCapture;
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
		"title": `Félictations ${nomUser} tu as capturé un ${nom_Pokemon} (N°${id_Pokemon}) !`,
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