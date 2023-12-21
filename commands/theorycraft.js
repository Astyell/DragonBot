/**
 * @author Astyell
 * @version 1.1.1 - 21/12/2023
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
	if (interaction.isCommand()) {

		let cible = interaction.options.getUser('utilisateur') || interaction.targetUser || interaction.user;
		let requete = `SELECT DISTINCT U.Id_Discord, U.nom_utilisateur, PC.Id_Pokemon, P.nom_Pokemon FROM Utilisateur U JOIN PC ON U.Id_Discord = PC.Id_DresseurAct JOIN Pokemon P ON PC.Id_Pokemon = P.Id_Pokemon  JOIN ( SELECT Id_Pokemon, Id_DresseurAct, COUNT(*) AS occurrences FROM PC GROUP BY Id_Pokemon, Id_DresseurAct HAVING COUNT(*) > 1 ) AS PokemonOccurrence ON PC.Id_Pokemon = PokemonOccurrence.Id_Pokemon AND U.Id_Discord = PokemonOccurrence.Id_DresseurAct WHERE U.Id_Discord != ${cible.id} AND NOT EXISTS ( SELECT 1 FROM PC AS PC2 WHERE PC2.Id_Pokemon = PC.Id_Pokemon AND PC2.Id_DresseurAct = ${cible.id} );`;

		db.query(requete, function (err, result, fields) 
		{
			if (err) { console.error(err); }

			//console.log(result);

			if (result.length >= 1)
			{
				let message = "";

				let min = 0;
				let max = 20;

				for (let i = min; i < max && i < result.length; i++)
				{
					console.log(result[i]);
					message += `- **${result[i].nom_utilisateur}** possède plusieurs ${result[i].nom_Pokemon} (ID : **__${result[i].Id_Pokemon}__**).\n`;
				}

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
						],
					components: 
					[
							{
							"type": 1,
							"components": [
								{
								"style": 4,
								"label": `Précédent `,
								"custom_id": `theorycraft_${cible.id}_${min-20}_${max-20}`,
								"disabled": false,
								"emoji": {
									"id": null,
									"name": `⬅`
								},
								"type": 2
								},
								{
								"style": 3,
								"label": `Suivant`,
								"custom_id": `theorycraft_${cible.id}_${min+20}_${max+20}`,
								"disabled": false,
								"emoji": {
									"id": null,
									"name": `➡`
								},
								"type": 2
								}
							]
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
	if (interaction.isButton()) 
	{
		let ensArgs = interaction.customId.split("_");

		let cibleID = ensArgs[1];
		let min     = ensArgs[2] <=  0 ?  0 : parseInt(ensArgs[2]);
		let max     = ensArgs[3] <= 20 ? 20 : parseInt(ensArgs[3]);

		console.log("min : " + min + " max : " + max);

		client.users.fetch(cibleID, { force: true }).then(user => 
		{	
			let requete = `SELECT DISTINCT U.Id_Discord, U.nom_utilisateur, PC.Id_Pokemon, P.nom_Pokemon FROM Utilisateur U JOIN PC ON U.Id_Discord = PC.Id_DresseurAct JOIN Pokemon P ON PC.Id_Pokemon = P.Id_Pokemon  JOIN ( SELECT Id_Pokemon, Id_DresseurAct, COUNT(*) AS occurrences FROM PC GROUP BY Id_Pokemon, Id_DresseurAct HAVING COUNT(*) > 1 ) AS PokemonOccurrence ON PC.Id_Pokemon = PokemonOccurrence.Id_Pokemon AND U.Id_Discord = PokemonOccurrence.Id_DresseurAct WHERE U.Id_Discord != ${user.id} AND NOT EXISTS ( SELECT 1 FROM PC AS PC2 WHERE PC2.Id_Pokemon = PC.Id_Pokemon AND PC2.Id_DresseurAct = ${user.id} );`;
			
			db.query(requete, function (err, result, fields) 
			{
				if (err) { console.error(err); }

				//console.log(result);

				if (result.length >= 1)
				{
					let message = "";

					console.log("result taille : " + result.length)

					for (let i = min; i < max && i < result.length; i++)
					{
						message += `- **${result[i].nom_utilisateur}** possède plusieurs ${result[i].nom_Pokemon} (ID : **__${result[i].Id_Pokemon}__**).\n`;
					}

					let minSui = min + 20;
					let maxSui = max + 20;
					let minPre = min - 20;
					let maxPre = min - 20;

					interaction.update 
					({
						content: 'Cela pourrait peut-être vous intéresser !',
						embeds:
							[
								{
									"type": "rich",
									"title": `Listes des doublons que ${user.username} n'a pas encore ! `,
									"description": `${message}`,
									"color": 0x87A6FF
								}
							],
						components: 
						[
								{
								"type": 1,
								"components": [
									{
									"style": 4,
									"label": `Précédent `,
									"custom_id": `theorycraft_${user.id}_${minPre}_${maxPre}`,
									"disabled": false,
									"emoji": {
										"id": null,
										"name": `⬅`
									},
									"type": 2
									},
									{
									"style": 3,
									"label": `Suivant`,
									"custom_id": `theorycraft_${user.id}_${minSui}_${maxSui}`,
									"disabled": false,
									"emoji": {
										"id": null,
										"name": `➡`
									},
									"type": 2
									}
								]
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
		});

	}

}