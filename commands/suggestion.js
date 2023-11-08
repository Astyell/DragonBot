/**
 * @author Astyell
 * @version 1.0 - 08/11/2023
 * @creation 08/11/2023
 * @description Permet aux utilisateurs d'envoyer une suggestion pour améliorer le bot
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
		"name": "suggestion", //Nom sensibleà la casse, pas de majuscule
		"description": "Permet d'envoyer une suggestion ou de signaler un bug aux développeurs",
		options:
		[
			{
				name: "message",
				description: "Le message que tu veux envoyer au développeur",
				required: true,
				type: 3
			}
		]

	}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	const channel = client.channels.cache.get(config.channelLog);
	let message = interaction.options.getString('message');

	channel.send
	({
		content:`Hey boss <@${config.devID}> ! Un nouveau message pour toi !`, 
		embeds:[
			{
			"type": "rich",
			"title": `Suggestion ou signalement de bug !`,
			"description": `${message}`,
			"color": 0xab0808
			}
		]
	});

	interaction.reply({content:'Message bien envoyé, merci pour ton aide !', embeds:[], ephemeral:true}); // True si je veux que seul la personne qui a activé la command le voi
}