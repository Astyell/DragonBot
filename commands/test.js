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
		interaction.editReply ({ content: `Tu n'as pas encore joué :D !` });
		return;
	}

}