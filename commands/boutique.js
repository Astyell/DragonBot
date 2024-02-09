/**
 * @author Astyell
 * @version 1.1.0 - 09/02/2024
 * @creation 13/11/2023 
 * @description Permet d'envoyer le message de la boutique
 */

const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require ("../index.js");

module.exports = {
    partials: [],
    intents: []
}

module.exports.create = () => 
{
	client.application.commands.create
	({
		"name": "boutique", //Nom sensibleà la casse, pas de majuscule
		"description": "Permet d'envoyer le message de la boutique"

	}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	if (interaction.isCommand()) 
	{
		const channel = client.channels.cache.get(config.channelTest);

		db.query(`SELECT * FROM Objet`, function (err, resultat, fields) 
		{
			if (err) { console.error(err); }

			channel.send({embeds: genererEmbed(resultat), components : genererButton() , ephemeral:false});
			interaction.reply({content:'Message envoyé !', embeds:[], ephemeral:true});
			return;
				
		})
	}
	if (interaction.isButton()) 
	{
		/* ------------------------------------------------- */
		/*             Récupérations des données             */
		/* ------------------------------------------------- */

		const channelLog = client.channels.cache.get(config.channelLog);
		let commanditaire = interaction.user;
		let ensArgs = interaction.customId.split("_");
		let objet;

		if (ensArgs[2] == null)
		{
			objet = ensArgs[1];
		}
		else
		{
			objet = ensArgs[1] + " " + ensArgs[2];
		}

		console.log(objet);

		/* ------------------------------------------------- */
		/*               Envoie de la réponse                */
		/* ------------------------------------------------- */

		db.query(`SELECT monnaie FROM Utilisateur WHERE Id_Discord = ${commanditaire.id};`, function (err, totalMonnaie, fields) 
		{
			if (err) { console.error(err); }

			db.query(`SELECT * FROM Objet WHERE nomObjet = '${objet}';`, function (err, selectObjet, fields) 
			{
				if (err) { console.error(err); }

				if (totalMonnaie[0].monnaie < selectObjet[0].prix)
				{
					interaction.reply ({content: `Tu n'as pas assez d'argent pour achete ${objet}.`, ephemeral: true});
					return;
				}
				else
				{
					db.query(`SELECT * FROM Possede WHERE Id_Objet = ${selectObjet[0].Id_Objet} AND Id_Discord = ${commanditaire.id};`, function (err, resultObjet, fields) 
					{
						if (err) { console.error(err); }

						console.log(resultObjet);

						db.query(`UPDATE Utilisateur SET monnaie = monnaie - ${selectObjet[0].prix} WHERE Id_Discord = '${commanditaire.id}';`, function (err, updateMonnaie, fields) 
						{
							if (err) { console.error(err); }

							if (resultObjet.length <= 0) 
							{
								db.query(`INSERT INTO Possede VALUES ('${commanditaire.id}', ${selectObjet[0].Id_Objet}, 1)`, function (err, insertObjet, fields) 
								{
									if (err) { console.error(err); }

									channelLog.send ({content: `${commanditaire.username} a acheté ${ensArgs[1]} ${ensArgs[2]}.`});

									interaction.reply ({content: `Tu viens d'acheter ${objet}.`, ephemeral: true});
									return;
									
								});
							}
							else
							{
								db.query(`UPDATE Possede SET quantite = quantite + 1 WHERE Id_Discord = '${commanditaire.id}' AND Id_Objet = ${selectObjet[0].Id_Objet};`, function (err, insertObjet, fields) 
								{
									if (err) { console.error(err); }

									channelLog.send ({content: `${commanditaire.username} a acheté ${ensArgs[1]} ${ensArgs[2]}.`});

									interaction.reply ({content: `Tu viens d'acheter ${objet}.`, ephemeral: true});
									return;
								});
							}
						});

						

					});
					
				}
				
			});
					
										
		});

		// channelLog.send ({content: `${commanditaire.username} a acheté ${ensArgs[1]} ${ensArgs[2]}.`});


		// 			interaction.reply ({content: `Tu viens d'acheter ${objet}.`, ephemeral: true});
		// 			return;

		// channelLog.send ({content: `${commanditaire.username} a acheté ${ensArgs[1]} ${ensArgs[2]}`});
		// return;
	}

}

function genererEmbed (resultat)
{
	let description;

	let message = "";

	resultat.forEach(element => 
	{
		message += `**${element.nomObjet}** - ${element.prix} P\n`;
	});

	let embed = 
	[
		{
		  "type": "rich",
		  "title": `Boutique pokémon !`,
		  "description": `Liste des articles disponibles :\n\n ${message}`,
		  "color": 0x1b61e3,
		  "thumbnail": {
			"url": `https://www.pokepedia.fr/images/7/77/Boutique_RFVF.png`,
			"height": 0,
			"width": 0
		  }
		}
	]

	return embed;
}

function genererButton ()
{
	let button = [
    {
      "type": 1,
      "components": [
        {
          "style": 2,
          "label": `Pierre Eau`,
          "custom_id": `boutique_Pierre_Eau`,
          "disabled": false,
          "emoji": {
            "id": `1173607541910028298`,
            "name": `Pierre_Eau`,
            "animated": false
          },
          "type": 2
        },
        {
          "style": 2,
          "label": `Pierre Feu`,
          "custom_id": `boutique_Pierre_Feu`,
          "disabled": false,
          "emoji": {
            "id": `1173607553008160839`,
            "name": `Pierre_Feu`,
            "animated": false
          },
          "type": 2
        },
        {
          "style": 2,
          "label": `Pierre Foudre`,
          "custom_id": `boutique_Pierre_Foudre`,
          "disabled": false,
          "emoji": {
            "id": `1173607562281758770`,
            "name": `Pierre_Foudre`,
            "animated": false
          },
          "type": 2
        },
        {
          "style": 2,
          "label": `Pierre Lune`,
          "custom_id": `boutique_Pierre_Lune`,
          "disabled": false,
          "emoji": {
            "id": `1173607572712980521`,
            "name": `Pierre_Lune`,
            "animated": false
          },
          "type": 2
        },
        {
          "style": 2,
          "label": `Pierre Plante`,
          "custom_id": `boutique_Pierre_Plante`,
          "disabled": false,
          "emoji": {
            "id": `1173607585065222226`,
            "name": `Pierre_Plante`,
            "animated": false
          },
          "type": 2
        }
      ]
    },
    {
      "type": 1,
      "components": [
		{
			"style": 2,
			"label": `Pierre Soleil`,
			"custom_id": `boutique_Pierre_Soleil`,
			"disabled": false,
			"emoji": {
			  "id": `1205524832838615170`,
			  "name": `Pierre_Soleil`,
			  "animated": false
			},
			"type": 2
		},
		{
			"style": 2,
			"label": `Cable Link`,
			"custom_id": `boutique_Cable_Link`,
			"disabled": false,
			"emoji": {
			  "id": `1173607528563748934`,
			  "name": `Cable_Link`,
			  "animated": false
			},
			"type": 2
		},
		{
			"style": 2,
			"label": `Noeud Destin`,
			"custom_id": `boutique_Noeud_Destin`,
			"disabled": false,
			"emoji": {
			  "id": `1205539093832794122`,
			  "name": `Noeud_Destin`,
			  "animated": false
			},
			"type": 2
		},
		{
			"style": 2,
			"label": `Roche Royale`,
			"custom_id": `boutique_Roche_Royale`,
			"disabled": false,
			"emoji": {
			  "id": `1205524852916748308`,
			  "name": `Roche_Royale`,
			  "animated": false
			},
			"type": 2
		},
		{
			"style": 2,
			"label": `Peau Metal`,
			"custom_id": `boutique_Peau_Metal`,
			"disabled": false,
			"emoji": {
			  "id": `1205524804409499708`,
			  "name": `Peau_Metal`,
			  "animated": false
			},
			"type": 2
		}
      ]
    },
	{
		"type": 1,
		"components": [
		  {
			"style": 2,
			"label": `Ameliorator`,
			"custom_id": `boutique_Ameliorator`,
			"disabled": false,
			"emoji": {
			  "id": `1205524765729619998`,
			  "name": `Ameliorator`,
			  "animated": false
			},
			"type": 2
		  },
		  {
			  "style": 2,
			  "label": `Ecaille Draco`,
			  "custom_id": `boutique_Ecaille_Draco`,
			  "disabled": false,
			  "emoji": {
				"id": `1205524719542079538`,
				"name": `Ecaille_Draco`,
				"animated": false
			  },
			  "type": 2
		  }
		]
	  }
	
  ]

  return button;
}