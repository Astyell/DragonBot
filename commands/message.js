/**
 * @author Astyell
 * @version 1.0 - 05/11/2023
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
	channel.send
	(
		{
			content:`|| <@&${pingID}> ||`, 
			embeds:
			[
				{
					"type": "rich",
					"title": `Petite liste du taux de drop de chacun pokémons`,
					"description": `Vous vous demandiez peut-être combien quelle était la probabilité de trouver ce roucool. Voici les probabilités de trouver un pokémon selon son taux d'apparition !`,
					"color": 0x00005a,
					"fields": [
					  {
						"name": `zqe`,
						"value": `grzq`
					  }
					]
				  }
		  	], 
			ephemeral:true
		}
	);

	interaction.reply({content:'Message envoyé !', embeds:[], ephemeral:true}); // True si je veux que seul la personne qui a activé la command le voi
}