/**
 * @author Astyell, Kinton
 * @version 1.1 - 25/10/2023
 * @creation 17/10/2023 
 * @description Affiche les statistiques d'un utilisateur
 */


const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require ("../index.js");


module.exports = {
    partials: [],
    intents: []
}

/// https://discord.com/developers/docs/interactions/application-commands#slash-commands
/// https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command-json-params
/// https://old.discordjs.dev/#/docs/discord.js/main/class/CommandInteractionOptionResolver
module.exports.create = () => {
	client.application.commands.create
	({
		"name": "stat",
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
		"name": "stat",
		type:2

	}, config.guildId)
};

module.exports.run = async (interaction) => 
{
	await interaction.deferReply({ ephemeral: false})
	let cible = interaction.options.getUser('utilisateur') || interaction.targetUser || interaction.user;

	// On vient tester si l'utilisateurs a déjà joué

	db.query(`SELECT * FROM Utilisateur WHERE Id_Discord = ${cible.id}`, function (err, result, fields) 
	{
		if (err) { console.error(err); }

		if (!result[0]) 
		{
			interaction.editReply({ content: "Ce joueur n'existe pas ou n'a jamais joué !", ephemeral: false });
			return;
		}

		if(result.length >= 1)
		{
			db.query(`SELECT count(*) AS totalPKMCap FROM PC WHERE Id_DresseurAct = ${cible.id};`, function (err, totalPokemonCap, fields) 
			{
				if (err) { console.error(err); }
				
				totalPokemonCap = totalPokemonCap[0].totalPKMCap;
				console.log("Nombre de pokemon capturé par l'utilisateurs : " + totalPokemonCap);

				db.query(`SELECT COUNT(Distinct id_Pokemon) AS totalPKMDiff FROM PC WHERE Id_DresseurAct = ${cible.id};`, function (err, totalPokemonDiff, fields) 
				{
					if (err) { console.error(err); }

					totalPokemonDiff = totalPokemonDiff[0].totalPKMDiff;
					console.log("Nombre de pokémon capturés différents : " + totalPokemonDiff);
					
					db.query(`SELECT COUNT(*) AS totalPKMShiny FROM PC WHERE Id_DresseurAct = ${cible.id} AND estShiny = 1;`, function (err, totalPokemonShiny, fields) 
					{
						if (err) { console.error(err); }

						totalPokemonShiny = totalPokemonShiny[0].totalPKMShiny;
						console.log("Nombre de pokémon capturés shiny : " + totalPokemonShiny);
							

						db.query(`SELECT COUNT(*) AS totalPKMLeg FROM PC c JOIN Pokemon p ON c.Id_Pokemon = p.Id_Pokemon WHERE Id_DresseurAct = ${cible.id} AND (p.estLegendaire = 1 OR p.estFabuleux = 1)`, function (err, totalPokemonLeg, fields) 
						{ //AND (p.estLegendaire = 1 OR p.estFabuleux = 1)
							if (err) { console.error(err); }

							totalPokemonLeg = totalPokemonLeg[0].totalPKMLeg;
							console.log("Nombre de pokémon capturés Leg : " + totalPokemonLeg);
								
							db.query(`SELECT COUNT(*) AS totalPKM FROM Pokemon;`, function (err, totalPokemon, fields) 
							{
								if (err) { console.error(err); }

								totalPokemon = totalPokemon[0].totalPKM;
								console.log("Nombre de pokémon total : " + totalPokemon);
								
								db.query(`SELECT monnaie FROM Utilisateur WHERE Id_Discord = ${cible.id};`, function (err, totalMonnaie, fields) 
								{
									if (err) { console.error(err); }

									monnaie = totalMonnaie[0].monnaie;
									console.log("Total argent : " + monnaie);
										
									interaction.editReply({ embeds : genererEmbed(totalPokemonCap, totalPokemonDiff, totalPokemonLeg, totalPokemonShiny, totalPokemon, cible, monnaie), ephemeral: false });
									return;
										
								});
									
							});
								
						});
					});

				});		
		
			});
		}

	});
}

function genererEmbed (totalPokemonCap, totalPokemonDiff, totalPokemonLeg, totalPokemonShiny, totalPokemon, cible, monnaie)
{
	let embed;

	embed = 
	[
		{
		"type": "rich",
		"title": `Statistiques de ${cible.displayName}`,
		"description": "",
		"color": 0x2ba3a3,
		"fields": [
			{
			"name": `Nombre de pokémon total :`,
			"value": `${totalPokemonCap}`,
			"inline": true
			},
			{
			"name": `Nombre de pokémon différents :`,
			"value": `${totalPokemonDiff} / ${totalPokemon}`,
			"inline": false
			},
			{
			"name": `Nombre de shiny :`,
			"value": `${totalPokemonShiny}`
			},
			{
			"name": `Nombre de légendaire et fabuleux :`,
			"value": `${totalPokemonLeg}`,
			"inline": false
			},
			{
			"name": `Compte en banque :`,
			"value": `${monnaie} Pokédollars`,
			"inline": false
			} 
		],
		thumbnail:{
			url:cible.displayAvatarURL()
		}
		}
	];

	return embed;
}