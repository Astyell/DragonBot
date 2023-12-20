/**
 * @author Astyell
 * @version 1.0 - 20/12/2023
 * @creation 20/12/2023 
 * @description Envoie les doublons que l'utilisateur demandé n'a pas
 */

const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require ("../index.js");

module.exports = {
    partials: [],
    intents: []
}

module.exports.create = () => {
	client.application.commands.create
	({
		"name": "theorycraft",
		"description": "Renvoie la liste des doublons que l'utilisateur n'a pas.",
		options:
		[
			{
				name:"utilisateur",
				description:"La personne dont tu veux voir le theorycraft",
				required: false,
				type:6
			}
		]

	}, config.guildId)

	/// Faire clique droit sur un utilisateur pour executer la meme commande :
	client.application.commands.create
	({
		"name": "theorycraft",
		type:2

	}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	let cible = interaction.options.getUser('utilisateur') || interaction.targetUser || interaction.user;

	let requete = `SELECT U.Id_Discord, U.nom_utilisateur, PC.Id_Pokemon, P.nom_Pokemon FROM Utilisateur U JOIN PC ON U.Id_Discord = PC.Id_DresseurAct JOIN Pokemon P ON PC.Id_Pokemon = P.Id_Pokemon  JOIN ( SELECT Id_Pokemon, Id_DresseurAct, COUNT(*) AS occurrences FROM PC GROUP BY Id_Pokemon, Id_DresseurAct HAVING COUNT(*) > 1 ) AS PokemonOccurrence ON PC.Id_Pokemon = PokemonOccurrence.Id_Pokemon AND U.Id_Discord = PokemonOccurrence.Id_DresseurAct WHERE U.Id_Discord != ${cible.id} AND NOT EXISTS ( SELECT 1 FROM PC AS PC2 WHERE PC2.Id_Pokemon = PC.Id_Pokemon AND PC2.Id_DresseurAct = ${cible.id} );`;

	db.query(requete, function (err, result, fields) 
	{
		if (err) { console.error(err); }

		console.log(result);

		if (result.length >= 1)
		{
			let message = "";

			result.forEach(element => 
			{
				message += `- **${element.nom_utilisateur}** possède plusieurs ${element.nom_Pokemon} (ID : **__${element.Id_Pokemon}__**).\n`;
			});
		
			interaction.reply
			({
				content: 'Cela pourrait peut-être vous intéresser !',
				embeds:
					[
						{
							"type": "rich",
							"title": `Listes des doublons que ${cible.username} n'a pas encore ! `,
							"description": `${message}`,
							"color": 0x87A6FF
						}
					]
			});

			return;

			}
			else
			{
				interaction.reply({content: `Il n'y a pas de doublons intéressant pour ${cible.username} pour le moment !`, ephemeral : false});
				return;
			}
	});

}