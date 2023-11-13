/**
 * @author Astyell
 * @version 1.0 - 10/11/2023
 * @creation 10/11/2023 
 * @description Permet de faire évoluer un pokémon que l'on possède en double
 */

const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require ("../index.js");

module.exports = {
    partials: [],
    intents: []
}

module.exports.create = () => 
{
	db.query(`SELECT COUNT(*) AS totalPKM FROM Pokemon;`, function (err, totalPokemon, fields) 
	{
		client.application.commands.create
		({
			"name": "evoluer", //Nom sensible à la casse, pas de majuscule
			"description": "Permet de faire évoluer un pokémon",
			options:
			[
				{
					name: "id_pokemon",
					description: "Donne l'ID du pokémon que tu veux faire évoluer",
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
	/* ------------------------------------------------- */
	/*             Mise en place interaction             */
	/* ------------------------------------------------- */

	await interaction.deferReply({ ephemeral: true });

	/* ------------------------------------------------- */
	/*             Récupérations des données             */
	/* ------------------------------------------------- */

	let pokemonID   = interaction.options.getInteger('id_pokemon');
	let utilisateur = interaction.user;

	/* ------------------------------------------------- */
	/*               Envoie de la réponse                */
	/* ------------------------------------------------- */

	// Vérification que la personne possède bien ce pokémon

	db.query(`SELECT * FROM PC WHERE Id_DresseurAct = ${utilisateur.id} AND Id_Pokemon = ${pokemonID} AND estShiny = 0`, function (err, resultat, fields) 
	{
		if (err) { console.error(err); }

		// Verification de la longueur des résultat

		if (resultat.length <= 0) 
		{
			interaction.editReply({ content: "Erreur, tu ne possède pas ce pokemon (Les shiny ne sont pas pris en compte)."});
			return;
		}

		if (resultat.length >= 1) 
		{
			// Vérification du fait que le pokémon a bien une évolution

			db.query(`SELECT * FROM Evolution WHERE id_Pokemon_Evoluant = ${pokemonID}`, function (err, resultatEvolution, fields) 
			{
				if (err) { console.error(err); }
				
				if (resultatEvolution.length <= 0) 
				{
					interaction.editReply({ content: "Erreur, ce pokémon ne peut pas évoluer (seul la première génération a été mise en place)."});
					return;
				}

				if (resultatEvolution.length >= 1) 
				{	
					console.log (resultatEvolution);

					if (resultatEvolution.length > 1)
					{
						interaction.editReply({ content: "Il a plusieurs évolutions."});
						return;
					}
					if (resultatEvolution.length = 1)
					{
						interaction.editReply({ content: "Il a une évolution."});
						return;
					}
					
				}

			});
		}

	});
}