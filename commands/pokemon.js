/** pokemon.js
 * @author Astyell, Kinton
 * @version 2.0.0 - 03/06/2024
 * @creation 14/10/2023 
 * @description Permet de capturer un pokémon selon un taux de capture défini dans la base de donnée
 */

const { getDateFormate, getTauxCapture, executeQuery } = require ("../fctAux.js");

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
	/* ------------------------------------------------- */
	/*             Mise en place interaction             */
	/* ------------------------------------------------- */

		await interaction.deferReply({ ephemeral: false });

	/* ----------------------------------------------- */
	/*           Initialisation des données            */
	/* ----------------------------------------------- */

	const user = interaction.user;
	const date = getDateFormate();
	const taux = getTauxCapture();

	/* ----------------------------------------------- */
	/*           Test des conditions de jeu            */
	/* ----------------------------------------------- */

	// On ajoute l'utilisateur dans la base de données s'il n'a jamais joué

	const infoUser = await executeQuery(`SELECT * FROM Utilisateur WHERE Id_Discord = ?`, [user.id]);

	if (infoUser.length <= 0)
	{
		await executeQuery (`INSERT INTO Utilisateur VALUES (?, ?, ?)`, [user.id, user.username, 200]);
	}

	// On vient tester si le joueur a déjà joué aujourd'hui

	const aJouer = await executeQuery(`SELECT nom_Pokemon FROM Capture c JOIN Pokemon p ON c.Id_Pokemon = p.Id_Pokemon WHERE Id_Discord = ? AND date_Capture = ? `, [user.id, date]);

	//console.table(aJouer); //debug

	if (aJouer.length >= 1) // Il a déjà joué aujourd'hui
	{
		interaction.editReply ({ content: `Tu as déjà capturé un **${aJouer[0].nom_Pokemon}** aujourd'hui ! Retentes ta chance dès demain !` });
		return;
	}
	else // Il n'a pas encore joué
	{
		// On prend tous les pokémons qui ont le taux de capture
		const ensPokemon = await executeQuery (`SELECT * FROM Pokemon WHERE tauxCapture = ?`, [taux])
		
		// On en choisit un au hasard
		const pokemon = ensPokemon[Math.floor(Math.random() * ensPokemon.length )];

		// On vérifie s'il est shiny ou non
		const estShiny = Math.floor(Math.random() * 4096 + 1) == 2 ? 1 : 0;

		// On ajoute le pokémons capturé
		await executeQuery (`INSERT INTO Capture VALUES (?, ?, ?, ?)`, [pokemon.Id_Pokemon, user.id, date, estShiny]);

		// On envoie les logs de capture
		const channel = client.channels.cache.get(config.channelLog);
		channel.send(`${user.username} as capturé un ` + pokemon.nom_Pokemon + `.`);

		console.log (`${user.username} a capturé un ${pokemon.nom_Pokemon} {Taux : ${taux}}`);

		// On répond avec l'embed
		let idSearch;

		// Gestion des easteregg
		if (pokemon.Id_Pokemon == 132 || pokemon.Id_Pokemon == 570 || pokemon.Id_Pokemon == 571) {idSearch = Math.floor(Math.random() * 1025);}
		else                                                                                     {idSearch = pokemon.Id_Pokemon              ;}

		// Réponse avec un embed
		snekfetch.get(`https://pokeapi.co/api/v2/pokemon/${idSearch}/`).then (captureData => 
		{
			interaction.editReply ({ content: ``, embeds : genererEmbed(pokemon, estShiny, captureData) });
			return;
		});

	}

}

function genererEmbed (pokemon, estShiny, captureData)
{
	let embed;

	captureData = captureData.body;

	const shiny = estShiny == 1 ? "Oui" : "Non";

	let nomPokemonURL = pokemon.nom_Pokemon.replace(" ", "_");

	embed = 
	[{
		"type": "rich",
		"title": `Félictations ! Tu as capturé un ${pokemon.nom_Pokemon} (N°${pokemon.Id_Pokemon}) !`,
		"url": `https://www.pokepedia.fr/${nomPokemonURL}`,
		"description": "",
		"color": 0x1b5280,
		"fields": 
		[
			{
			"name": `Est-il shiny ?`,
			"value": `${shiny}`,
			"inline": false
			},
			{
			"name": `Rareté du pokémon ?`,
			"value": `${pokemon.tauxCapture} %`,
			"inline": false
			}
		],
		"thumbnail":
		{
			"url": `${captureData.sprites[`front_${estShiny ? "shiny" : "default"}`]}`	
		},
	}]

	return embed;
}