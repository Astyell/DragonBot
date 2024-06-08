/** profile.js
 * @author Astyell, Kinton
 * @version 2.0.0 - 08/06/2024
 * @creation 17/10/2023 
 * @description Affiche les statistiques d'un utilisateur
 */


const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require ("../index.js");
const { executeQuery } = require ("../fctAux.js");

module.exports = 
{
    partials: [],
    intents: []
}

module.exports.create = () => 
{
	client.application.commands.create
	({
		"name": "test",
		"description": "Renvoie les statistiques d'un joueur.",
		options:
		[
			{
				name:"utilisateur",
				description:"La personne dont tu veux voir les statistiques !",
				required:false,
				type:6
			}
		]

	}, config.guildId)

	/// Faire clique droit sur un utilisateur pour executer la meme commande :
	client.application.commands.create
	({
		"name": "test",
		type:2

	}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	/* ------------------------------------------------- */
	/*             Mise en place interaction             */
	/* ------------------------------------------------- */

	await interaction.deferReply({ ephemeral: false});

	/* ----------------------------------------------- */
	/*           Initialisation des données            */
	/* ----------------------------------------------- */

	let user = interaction.options.getUser('utilisateur') || interaction.targetUser || interaction.user;

	/* ----------------------------------------------- */
	/*            Exécution de la commande             */
	/* ----------------------------------------------- */

	// On vient tester si l'utilisateurs a déjà joué

	const infoUser = await executeQuery(`SELECT * FROM Utilisateur WHERE Id_Discord = ?`, [user.id]);

	if (infoUser.length <= 0)
	{
		interaction.editReply({ content: "Ce joueur n'existe pas ou n'a jamais joué !", ephemeral: false });
		return;
	}
	else
	{
		const nbPokemon     = await executeQuery(`SELECT Count(*) AS nbPKM FROM Pokemon`, []);
		const nbPokemonDiff = await executeQuery(`SELECT COUNT(Distinct id_Pokemon) AS totalPKMDiff FROM PC WHERE Id_DresseurAct = ?`, [user.id]);
											
		interaction.editReply({ embeds : genererEmbed(user, infoUser[0].monnaie, nbPokemon, nbPokemonDiff), ephemeral: false });
		return;
	}				
}

function genererEmbed (user, monnaie, nbPokemon, nbPokemonDiff)
{
	const embed =
	[
		{
			"type": "rich",
		    "title": `Profile de ${user.username}`,
		    "color": 0x2ba3a3,
		    thumbnail:
			{
				url:cible.displayAvatarURL()
			},
		
		    "description": `**Pokémons uniques :** ${nbPokemonDiff} / ${nbPokemon} \n**Porte-monnaie :** ${monnaie}`
		}
	]

	return embed;
}