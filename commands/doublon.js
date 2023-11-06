/**
 * @author Astyell
 * @version 1.1 - 06/11/2023
 * @creation 24/10/2023 
 * @description Permet d'afficher toutes les personnes ayant deux fois le même pokémons non shiny
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
		"name": "doublon", //Nom sensibleà la casse, pas de majuscule
		"description": "Renvoie les personnes qui ont des doublons"

	}, config.guildId)
};

module.exports.run = async (interaction) => 
{

	db.query(`SELECT PC.Id_DresseurAct, U.nom_utilisateur, PC.Id_Pokemon, p.nom_Pokemon, COUNT(PC.Id_Pokemon) as occurrences FROM PC JOIN Utilisateur U ON PC.Id_DresseurAct = U.Id_Discord JOIN Pokemon p ON p.Id_Pokemon = PC.Id_Pokemon WHERE PC.estShiny = 0 AND nom_utilisateur != 'astyell2' GROUP BY PC.Id_DresseurAct, PC.Id_Pokemon HAVING COUNT(PC.Id_Pokemon) > 1;`, function (err, result, fields)
	{
		if (err) { console.error(err); }

		
		let message = "";
		result.forEach(element => 
		{
			message += `- **${element.nom_utilisateur}** possède ${element.occurrences} ${element.nom_Pokemon} (ID : **__${element.Id_Pokemon}__**).\n`;	
		}),

		interaction.reply({ content: 'Chef, oui chef !', 
		embeds: 
		[
			{
				"type": "rich",
				"title": `Listes des personnes ayant des doublons `,
				"description": `${message}`,
				"color": 0x005a5a
			}
		  ]
		}); 
	
		return;
	});
}