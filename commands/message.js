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
	const channel = client.channels.cache.get(config.channelAnnonce);
	const pingID  = config.pingRole;
	channel.send //<@&${pingID}>
	(
		{
			content:"[**29/11/2023**] boutique.js -> `V1.0.1 - BugFix : Insertion des objets dans la base de donnée`, trouvé par <@611244296737390605>.",  
			ephemeral:false
		}
	);

	interaction.reply({content:'Message envoyé !', embeds:[], ephemeral:true}); // True si je veux que seul la personne qui a activé la command le voi
}