/**
 * @author Astyell
 * @version 2.0.0 - 09/07/2023
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
		"description": "Cette commande vous permet de faire gagner un pokémon.",
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
	/* ------------------------------------------------- */
	/*             Mise en place interaction             */
	/* ------------------------------------------------- */

	await interaction.deferReply({ ephemeral: false });

	/* ----------------------------------------------- */
	/*           Initialisation des données            */
	/* ----------------------------------------------- */

	const user = interaction.options.getUser('utilisateur');
	const date = getDateFormate();
	const taux = 100 - interaction.options.getInteger('tauxcapture');

	/* ----------------------------------------------- */
	/*           Test des conditions de jeu            */
	/* ----------------------------------------------- */

	// On ajoute l'utilisateur dans la base de données s'il n'a jamais joué

	const infoUser = await executeQuery(`SELECT * FROM Utilisateur WHERE Id_Discord = ?`, [user.id]);

	if (infoUser.length <= 0)
	{
		await executeQuery (`INSERT INTO Utilisateur VALUES (?, ?, ?)`, [user.id, user.username, 200]);
	}

	// On prend tous les pokémons qui ont le taux de capture
	const ensPokemon = await executeQuery (`SELECT * FROM Pokemon WHERE tauxCapture = ?`, [taux])
		
	// On en choisit un au hasard
	const pokemon = ensPokemon[Math.floor(Math.random() * ensPokemon.length )];

	// On vérifie s'il est shiny ou non
	const estShiny = Math.floor(Math.random() * 4096 + 1) == 2 ? 1 : 0;

	// On ajoute le pokémons capturé
	await executeQuery (`INSERT INTO Gagne (Id_Pokemon, Id_Discord, date_Gagne, estShiny) VALUES (?, ?, ?, ?)`, [pokemon.Id_Pokemon, user.id, date, estShiny]);

	// On envoie les logs de capture
	const channel = client.channels.cache.get(config.channelLog);
	channel.send(`${user.username} as gagné un ` + pokemon.nom_Pokemon + `.`);

	console.log (`${user.username} a gagné un ${pokemon.nom_Pokemon} {Taux : ${taux}}`);

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

function genererEmbed (pokemon, estShiny, captureData)
{
	let embed;

	captureData = captureData.body;

	const shiny = estShiny == 1 ? "Oui" : "Non";

	let nomPokemonURL = pokemon.nom_Pokemon.replace(" ", "_");

	embed = 
	[{
		"type": "rich",
		"title": `Félictations ! Tu as gagné un ${pokemon.nom_Pokemon} (N°${pokemon.Id_Pokemon}) !`,
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