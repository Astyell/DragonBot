/**
 * @author Astyell
 * @version 1.0 - 27/11/2023
 * @creation 05/11/2023 
 * @description Permet d'envoyer un certain message dans le channel d'annonces
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
		"name": "message", //Nom sensibleà la casse, pas de majuscule
		"description": "Envoyer un message dans le channel annonce"

	}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	const channel = client.channels.cache.get(config.channelLog);
	const pingID  = config.pingRole;
	channel.send //<@&${pingID}>
	(
		{
			content:`# Update Majeur partie 2 : La revanche contre évoli \n 
			||  || 
			\n\n
			Vous en rêviez (probablement pas non plus), nous l'avons fait ! Il est désormais possible de faire évoluer **TOUT** les pokémons.\n\n
			
			## Comment cela fonctionne t-il ?\n\n
			
			Le nécessaire pour évoluer un pokémon dépendra principalement de sa façon d'évoluer, j'en liste ainsi 5 grandes catégories :\n
			- Le Niveau\n
			- Avec un Objet\n
			- Par bonheur\n
			- En apprenant une attaque\n
			- Par échange\n\n
			
			Pour les pokémons par niveau, le tout se fera en utilisant plusieurs pokémons pour les faires évoluer en un seul et beau grand pokémon.\n
			Selon la difficulté à faire évoluer le pokémons, cela demandera plus ou moins d'exemplaire de pokémons.\n
			
			`,  
			ephemeral:false
		}
	);

	interaction.reply({content:'Message envoyé !', embeds:[], ephemeral:true}); // True si je veux que seul la personne qui a activé la command le voi
}