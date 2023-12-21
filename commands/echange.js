/**
 * @author Astyell, Kinton
 * @version 1.0 - 13/11/2023
 * @creation 18/10/2023 
 * @description Permet de faire un échange de deux pokémons entre deux utilisateurs
 */

const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require("../index.js");


module.exports = {
	partials: [],
	intents: []
}

module.exports.create = () => {
	db.query(`SELECT COUNT(*) AS totalPKM FROM Pokemon;`, function (err, totalPokemon, fields) {
		client.application.commands.create
			({
				"name": "echange", //Nom sensible à la casse, pas de majuscule
				"description": "Permet d'échanger son pokémon avec quelqu'un d'autre",
				options:
					[
						{
							name: "utilisateur",
							description: "La personne avec qui tu veux faire un échange",
							required: true,
							type: 6
						},
						{
							name: "idpokemonechange",
							description: "id du Pokemon que tu veux ECHANGER (Oui c'est chiant, mais cherche sur wikipédia)",
							required: true,
							type: 4,
							min_value: 1,
							max_value: totalPokemon[0].totalPKM
						},
						{
							name: "idpokemonrecu",
							description: "id du Pokemon que tu vas RECEVOIR (Oui c'est chiant, mais cherche sur wikipédia)",
							required: true,
							type: 4,
							min_value: 1,
							max_value: totalPokemon[0].totalPKM
						},
						{
							name: "message",
							description: "Envoyez un petit mot d'amour pour accompagner votre demande",
							required: false,
							type: 3,
						}
					]

			}, config.guildId)
	})
};

module.exports.run = async (interaction) => {

	if (interaction.isCommand()) {
		await interaction.deferReply({ ephemeral: true })

		let commanditaire = interaction.user;
		let cible = interaction.options.getUser('utilisateur');
		let pokemonEchange = interaction.options.getInteger('idpokemonechange');
		let pokemonRecu = interaction.options.getInteger('idpokemonrecu');

		let message = interaction.options.getString('message');

		console.log (message);

		if (message == null) 
			message = "Salut Bg !";

		// si une des id est mauvaises

		db.query(`SELECT COUNT(*) AS totalPKM FROM Pokemon;`, function (err, totalPokemon, fields) {
			if (err) { console.error(err); }

			totalPokemon = totalPokemon[0].totalPKM;

			if (pokemonEchange <= 0 || pokemonEchange > totalPokemon || pokemonRecu <= 0 || pokemonRecu > totalPokemon) {
				interaction.editReply({ content: 'Renseignez une ID de pokémon valide', embeds: [] });
				return;
			}

			db.query(`SELECT Id_Pokemon FROM PC WHERE Id_DresseurAct = ${commanditaire.id} AND Id_Pokemon = ${pokemonEchange} AND estShiny = 0`, function (err, resultAPokemon, fields) {
				if (err) { console.error(err); }

				if (!resultAPokemon[0]) 
				{
					interaction.editReply({ content: 'Vous ne possédez pas le pokémon que vous voulez échanger !', embeds: [] });
					return;
				}

				db.query(`SELECT Id_Pokemon FROM PC WHERE Id_DresseurAct = ${cible.id} AND Id_Pokemon = ${pokemonRecu} AND estShiny = 0`, function (err, resultAPokemon, fields) 
				{
					if (err) { console.error(err); }

					if (!resultAPokemon[0]) 
					{
						interaction.editReply({ content: "Votre partenaire d'échange ne possède pas ce pokémon.", embeds: [] });
						return;
					}

					db.query(`SELECT nom_Pokemon FROM Pokemon WHERE Id_Pokemon = ${pokemonEchange}`, function (err, resultPKME, fields) 
					{
						if (err) { console.error(err); }

						nomPokemonE = resultPKME[0].nom_Pokemon;

						db.query(`SELECT nom_Pokemon FROM Pokemon WHERE Id_Pokemon = ${pokemonRecu}`, function (err, resultPKMR, fields) 
						{

							if (err) { console.error(err); }

							nomPokemonR = resultPKMR[0].nom_Pokemon;

							cible.send({ content: `${message}`, embeds: genererEmbed(commanditaire.username, nomPokemonE, nomPokemonR), components: genererBouton(commanditaire.id, commanditaire.username, cible.id, cible.username, pokemonEchange, nomPokemonE, pokemonRecu, nomPokemonR) });

							interaction.editReply({ content: `Message bien envoyé à ${cible.username} !`, embeds: [], ephemeral : true});
							return;

						});

					});


				});

			});

		});
	}
	if (interaction.isButton()) 
	{
		let ensArgs = interaction.customId.split("_");
		// echange_accepter_${commanditaireID}_${commanditaireName}_${cibleID}__${pokemonEchangeID}_${pokemonEchangeName}_${pokemonRecuID}_${pokemonRecuName}

		// Je récupère tous dans des variables pour me simplifier la vie
		let commanditaireID = ensArgs[2];
		let cibleID = ensArgs[4];

		let pkmcommanditaireID = ensArgs[5];
		let pkmcibleID = ensArgs[7];

		//Je récupère la date d'aujourd'hui

		// Date au format AAAA-MM-JJ
		let dateAjd = new Date();

		// Formatage de la data pour un format correct
		let dateFormate = dateAjd.getFullYear() + "-";
		// Si le mois est < 10 il s'écrira "2" hors nous cherchons à avoir "02"
		(dateAjd.getMonth() + 1) < 10 ? dateFormate += "0" + (dateAjd.getMonth() + 1) : dateFormate += (dateAjd.getMonth() + 1);
		dateFormate += "-" + dateAjd.getDate();

		console.log(dateFormate);

		// On update le message envoyé
		interaction.update({ content: '', embeds: genererEmbedReponse(ensArgs[3], ensArgs[6], ensArgs[8], ensArgs[1]), components: genererButtonReponse() })

		if (ensArgs[1] == "refuser") {
			client.users.fetch(ensArgs[2], { force: true }).then(commanditaire => 
			{
				client.users.fetch(ensArgs[4], { force: true }).then(cible => 
				{
					const channel = client.channels.cache.get(config.channelLog);
					channel.send(`${cible.username} a refusé d'échanger son ${ensArgs[8]} avec le ${ensArgs[6]} de ${commanditaire.username}.`);

					commanditaire.send({ content: '', embeds: genererEmbedRefus(cible.username, ensArgs[6], ensArgs[8]) })
				})
			})
		}
		else
		{
			client.users.fetch(ensArgs[2], { force: true }).then(commanditaire => 
			{
				client.users.fetch(ensArgs[4], { force: true }).then(cible => 
				{
					commanditaire.send({ content: '', embeds: genererEmbedOui(cible.username, ensArgs[6], ensArgs[8]) })
				})
			})
			
			// console.log("==================================================================================")
			// console.log(cibleID)
			// console.log(commanditaireID)
			// console.log("==================================================================================")
			db.query(`SELECT * FROM PC WHERE Id_DresseurAct = ${cibleID} AND id_Pokemon = ${pkmcibleID} AND estShiny = 0;`, function (err, resultPKMCible, fields) 
			{
				if (err) { console.error(err); }

				//console.log(resultPKMCible);
				
				db.query(`SELECT * FROM PC WHERE Id_DresseurAct = ${commanditaireID} AND id_Pokemon = ${pkmcommanditaireID} AND estShiny = 0;`, function (err, resultPKMComm, fields) 
				{
					if (err) { console.error(err); }
					
					//console.log(resultPKMComm);

					let cibleDO = resultPKMCible[0].Id_DresseurOri;
					let commDO  = resultPKMComm [0].Id_DresseurOri;

					console.log ("cible DO : " + cibleDO + " comm : " + commDO);

					// Insertion dans le commanditaire donc du pokémon cible
					db.query(`INSERT INTO Echange (Id_Pokemon, Id_DA, Id_DO, dateEchange, estShiny) VALUES (${pkmcibleID}, ${commanditaireID}, ${cibleDO}, '${dateFormate}', ${resultPKMCible[0].estShiny})`, function (err, rinsertComm, fields) 
					{
						if (err) { console.error(err); }

						else 
						{
							// Insertion dans la base de la cible
							db.query(`INSERT INTO Echange (Id_Pokemon, Id_DA, Id_DO, dateEchange, estShiny) VALUES (${pkmcommanditaireID}, ${cibleID}, ${commDO}, '${dateFormate}', ${resultPKMComm[0].estShiny})`, function (err, rinsertCible, fields) 
							{
								if (err) { console.error(err); }

								else
								{
									db.query(`DELETE FROM PC WHERE PC_Id = ${resultPKMComm[0].PC_Id} ;`, function (err, rinsertComm, fields) 
									{
										if (err) { console.error(err); }
										
										//Ensuite on est censé les delete dans le pc de la cible
										db.query(`DELETE FROM PC WHERE PC_Id = ${resultPKMCible[0].PC_Id} ;`, function (err, rinsertComm, fields) 
										{
											if (err) { console.error(err); }
											
											client.users.fetch(ensArgs[2], { force: true }).then(commanditaire => 
											{
												client.users.fetch(ensArgs[4], { force: true }).then(cible => 
												{
													const channel = client.channels.cache.get(config.channelLog);
													channel.send(`${cible.username} a accepté d'échanger son ${ensArgs[8]} avec le ${ensArgs[6]} de ${commanditaire.username}.`);
												})
											})

											return;

										});


									});
								}
							});
						}
						
					});

				});

			});
		}
	}

}

function genererEmbed(commanditaire, idPokemonE, idPokemonR) {

	let embeds =
		[
			{
				"type": "rich",
				"title": `${commanditaire} voudrait t'échanger son ${idPokemonE} contre ton ${idPokemonR} !`,
				"description": `Tu as le droit d'accepter ou de refuser cette demande. \nAttention, en cas de missclick, les administrateurs ne pourront rien y faire. \nCe sera à toi de redemander un échange. \nPour consulter les pokémons que tu as : https://m104.ovh/Dragonbot/index.php`,
				"color": 0x013654
			}
		];

	return embeds;
}

function genererEmbedRefus(cible, PokemonE, PokemonR) {

	let embeds =
		[
			{
				"type": "rich",
				"title": `${cible} a refusé ta demande d'échange de ton ${PokemonE} contre son ${PokemonR}!`,
				"description": `Tant pis, une autre fois peut-être !`,
				"color": 0xDB4B48
			}
		];

	return embeds;
}

function genererEmbedOui(cible, PokemonE, PokemonR) {

	let embeds =
		[
			{
				"type": "rich",
				"title": `${cible} a accepté ta demande d'échange de ton ${PokemonE} contre son ${PokemonR}!`,
				"description": `N'hésites pas à utiliser la commande /stat ou à aller voir sur le site : https://m104.ovh/Dragonbot/`,
				"color": 0xA9DB42
			}
		];

	return embeds;
}

function genererEmbedReponse(cibleName, pokemonEchange, pokemonRecu, etat) {
	etat == "refuser" ? etat = "refusé" : etat = "accepté";

	let embeds =
		[
			{
				"type": "rich",
				"title": `${cibleName} voudrait t'échanger son ${pokemonEchange} contre ton ${pokemonRecu} !`,
				"description": `Vous avez ` + etat + ` cette demande.`,
				"color": 0x013654
			}
		];

	return embeds;
}

function genererButtonReponse() {
	let components =
		[
			{
				"type": 1,
				"components": [
					{
						"style": 3,
						"label": `Accepter l'échange`,
						"custom_id": `echange_accepter`,
						"disabled": true,
						"emoji": {
							"id": `702628182532161637`,
							"name": `BeeHappy`,
							"animated": false
						},
						"type": 2
					},
					{
						"style": 4,
						"label": `Refuser l'échange`,
						"custom_id": `echange_refuser_`,
						"disabled": true,
						"emoji": {
							"id": `870271800758632539`,
							"name": `BeeSad`,
							"animated": false
						},
						"type": 2
					}
				]
			}
		]

	return components;
}

function genererBouton(commanditaireID, commanditaireName, cibleID, cibleName, pokemonEchangeID, pokemonEchangeName, pokemonRecuID, pokemonRecuName) {
	let components =
		[
			{
				"type": 1,
				"components": [
					{
						"style": 3,
						"label": `Accepter l'échange`,
						"custom_id": `echange_accepter_${commanditaireID}_${commanditaireName}_${cibleID}_${pokemonEchangeID}_${pokemonEchangeName}_${pokemonRecuID}_${pokemonRecuName}`,
						"disabled": false,
						"emoji": {
							"id": `702628182532161637`,
							"name": `BeeHappy`,
							"animated": false
						},
						"type": 2
					},
					{
						"style": 4,
						"label": `Refuser l'échange`,
						"custom_id": `echange_refuser_${commanditaireID}_${commanditaireName}_${cibleID}_${pokemonEchangeID}_${pokemonEchangeName}_${pokemonRecuID}_${pokemonRecuName}`,
						"disabled": false,
						"emoji": {
							"id": `870271800758632539`,
							"name": `BeeSad`,
							"animated": false
						},
						"type": 2
					}
				]
			}
		]

	return components;
}