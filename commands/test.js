/**
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
	/* ----------------------------------------------- */
	/*           Initialisation des données            */
	/* ----------------------------------------------- */

	const user = interaction.user;
	const date = getDateFormate();
	const taux = getTauxCapture();

	/* ----------------------------------------------- */
	/*           Test des conditions de jeu            */
	/* ----------------------------------------------- */

	// On vient voir si c'est la première participation du joueur

	const infoUser = await executeQuery(`SELECT * FROM Utilisateur WHERE Id_Discord = ?`, [user.id]);

	if (infoUser.length <= 0)
	{
		await executeQuery (`INSERT INTO Utilisateur VALUES (?, ?, ?)`, [user.id, user.username, 200]);
	}

}