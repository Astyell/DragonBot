/**
 * @author Astyell
 * @version 1.0 - 27/11/2023
 * @creation 10/11/2023
 * @description Permet de faire évoluer un pokémon que l'on possède en double
 */

const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require ("../index.js");

module.exports = {
    partials: [],
    intents: []
}

module.exports.create = () =>
{
	db.query(`SELECT COUNT(*) AS totalPKM FROM Pokemon;`, function (err, totalPokemon, fields)
	{
		client.application.commands.create
		({
			"name": "evoluer", //Nom sensible à la casse, pas de majuscule
			"description": "Permet de faire évoluer un pokémon",
			options:
			[
				{
					name: "id_pokemon",
					description: "Donne l'ID du pokémon que tu veux faire évoluer",
					required: true,
					type: 4,
					min_value: 1,
					max_value: totalPokemon[0].totalPKM
				}
			]

		}, config.guildId)
	})
};

module.exports.run = async (interaction) =>
{
	if (interaction.isCommand()) 
	{
		/* ------------------------------------------------- */
		/*             Mise en place interaction             */
		/* ------------------------------------------------- */

		await interaction.deferReply({ ephemeral: true });

		/* ------------------------------------------------- */
		/*             Récupérations des données             */
		/* ------------------------------------------------- */

		let pokemonID   = interaction.options.getInteger('id_pokemon');
		let utilisateur = interaction.user;

		// Récupération de la date du jour
		let dateAjd = new Date();
		let dateFormate = dateAjd.getFullYear() + "-";
		(dateAjd.getMonth() + 1) < 10 ? dateFormate += "0" + (dateAjd.getMonth() + 1) : dateFormate += (dateAjd.getMonth() + 1);
		dateFormate += "-" + dateAjd.getDate();

		/* ------------------------------------------------- */
		/*               Envoie de la réponse                */
		/* ------------------------------------------------- */

		// Vérification que la personne possède bien ce pokémon

		db.query(`SELECT * FROM PC WHERE Id_DresseurAct = ${utilisateur.id} AND Id_Pokemon = ${pokemonID} AND estShiny = 0`, function (err, resultat, fields)
		{
			if (err) { console.error(err); }

			console.log(resultat);

			// Verification de la longueur des résultat

			if (resultat.length <= 0)
			{
				interaction.editReply({ content: "Erreur, tu ne possède pas ce pokemon (Les shiny ne sont pas pris en compte)."});
				return;
			}

			if (resultat.length >= 1)
			{
				// Vérification du fait que le pokémon a bien une évolution

				db.query(`
				SELECT id_Pokemon_Evoluant, id_Pokemon_Evolue, stade_Evolution, t.Id_Type_Evolution, p1.nom_Pokemon AS "nom_Evoluant", p2.nom_Pokemon AS "nom_Evolue", nom_Type_Evolution
				FROM Evolution e JOIN Pokemon p1 ON e.id_Pokemon_Evoluant = p1.Id_Pokemon
								JOIN Pokemon p2 ON e.id_Pokemon_Evolue = p2.Id_Pokemon
								JOIN Type_Evolution t ON t.Id_Type_Evolution = e.Id_Type_Evolution
				WHERE id_Pokemon_Evoluant = ${pokemonID};`, function (err, resultatEvolution, fields)
				{
					if (err) { console.error(err); }

					console.log(resultatEvolution);

					if (resultatEvolution.length <= 0)
					{
						interaction.editReply({ content: "Erreur, ce pokémon ne peut pas évoluer (seul la première génération a été mise en place)."});
						return;
					}
					if (resultatEvolution.length > 1)
					{
						interaction.editReply({embeds : genererEmbedEvolution(resultatEvolution), components : genererComponentEvolution(resultatEvolution, pokemonID)});
						
						return;
					}
					if (resultatEvolution.length == 1)
					{
						if (resultatEvolution[0].Id_Type_Evolution == 1)
						{
							let nbPokemonNecessaire = (resultatEvolution[0].stade_Evolution) + 1;

							if (resultat.length < nbPokemonNecessaire)
							{
								interaction.editReply({ content: "Erreur, tu ne possède pas assez de fois ce pokemon, il t'en faut " + nbPokemonNecessaire + " pour le faire évoluer."});
								return;
							}
							else
							{
								db.query(`INSERT INTO Evolue (pokemon_Evoluant, pokemon_Evolue, id_Utilisateur, dateEvolution) VALUES (${pokemonID}, ${resultatEvolution[0].id_Pokemon_Evolue}, ${utilisateur.id}, '${dateFormate}');`, function (err, insertEvolue, fields)
								{
									if (err) { console.error(err); }

									for (let i = 0; i < nbPokemonNecessaire; i++)
									{
										db.query(`DELETE FROM PC WHERE PC_Id = ${resultat[i].PC_Id} ;`, function (err, rdelete, fields)
										{
											if (err) { console.error(err); }


										});
									}

									const channel = client.channels.cache.get(config.channelLog);
									channel.send(`${utilisateur.username} a fait évoluer ${nbPokemonNecessaire} ${resultatEvolution[0].nom_Evoluant} en ${resultatEvolution[0].nom_Evolue}`);

									interaction.editReply({ content: `Vos ${nbPokemonNecessaire} ${resultatEvolution[0].nom_Evoluant} ont évolué en un(e) ${resultatEvolution[0].nom_Evolue}.`});
									return;

								});
							}
						}
						else
						{
							db.query(`SELECT p.Id_Objet, o.nomObjet, p.quantite FROM Possede p JOIN Objet o ON p.Id_Objet = o.Id_Objet WHERE o.Id_Type_Evolution = ${resultatEvolution[0].Id_Type_Evolution} AND p.Id_Discord = ${utilisateur.id};`, function (err, selectPossession, fields)
							{
								if (err) { console.error(err); }

								if (selectPossession.length <= 0 || selectPossession[0].quantite <= 0)
								{
									interaction.editReply({ content: `Vous ne possédez pas l'objet nécessaire pour faire évoluer ce pokémon.` });
									return;
								}
								else
								{

									db.query(`INSERT INTO Evolue (pokemon_Evoluant, pokemon_Evolue, id_Utilisateur, dateEvolution) VALUES (${pokemonID}, ${resultatEvolution[0].id_Pokemon_Evolue}, ${utilisateur.id}, '${dateFormate}')`, function (err, insertPKM, fields)
									{
										if (err) { console.error(err); }

										db.query(`DELETE FROM PC WHERE PC_Id = ${resultat[0].PC_Id} ;`, function (err, rdelete, fields)
										{
											if (err) { console.error(err); }
											
											db.query(`UPDATE Possede SET quantite = quantite - 1 WHERE Id_Discord = ${utilisateur.id} AND Id_Objet = ${selectPossession[0].Id_Objet}`, function (err, UpdateQuantite, fields)
											{
												if (err) { console.error(err); }
												
												const channel = client.channels.cache.get(config.channelLog);
												channel.send(`${utilisateur.username} a fait évoluer ${resultatEvolution[0].nom_Evoluant} en ${resultatEvolution[0].nom_Evolue} à l'aide d'un(e) ${selectPossession[0].nomObjet}`);

												interaction.editReply({ content: `Votre ${resultatEvolution[0].nom_Evoluant} a évolué en un(e) ${resultatEvolution[0].nom_Evolue} à l'aide d'un(e) ${selectPossession[0].nomObjet}.`});
												return;
											});

										});
									});
								}

							});
						}
							
					}

				});
			}

		});
	}
	if (interaction.isButton()) 
	{
		/* ------------------------------------------------- */
		/*             Mise en place interaction             */
		/* ------------------------------------------------- */

		await interaction.deferReply({ ephemeral: true });

		/* ------------------------------------------------- */
		/*             Récupérations des données             */
		/* ------------------------------------------------- */

		// Récupération avec l'ID du bouton
		let ensArgs = interaction.customId.split("_");

		let pkmEvolueID   = ensArgs[2];
		let pkmEvoluantID = ensArgs[1];

		let utilisateur = interaction.user;

		//console.log ("PKM evoluant : " + pkmEvoluantID + " PKM EvolueID : " + pkmEvolueID + " user : " + utilisateur.username); // Debug

		// Récupération de la date du jour
		let dateAjd = new Date();
		let dateFormate = dateAjd.getFullYear() + "-";
		(dateAjd.getMonth() + 1) < 10 ? dateFormate += "0" + (dateAjd.getMonth() + 1) : dateFormate += (dateAjd.getMonth() + 1);
		dateFormate += "-" + dateAjd.getDate();

		/* ------------------------------------------------- */
		/*                MAJ Message Envoyé                 */
		/* ------------------------------------------------- */

		// On update le message envoyé
		interaction.update({content: 'Ta demande a bien été prise en compte :D', embed : [], components : [] });

		/* ------------------------------------------------- */
		/*                  Vérifications                    */
		/* ------------------------------------------------- */

		db.query(`SELECT * FROM PC WHERE Id_DresseurAct = ${utilisateur.id} AND Id_Pokemon = ${pkmEvoluantID} AND estShiny = 0`, function (err, resultat, fields)
		{
			if (err) { console.error(err); }

			// Verification de la longueur des résultat

			if (resultat.length <= 0)
			{
				interaction.editReply({ content: "Erreur, tu ne possède plus ce pokemon (Les shiny ne sont pas pris en compte)."});
				return;
			}
			else
			{
				let query = `SELECT id_Pokemon_Evoluant, id_Pokemon_Evolue, stade_Evolution, t.Id_Type_Evolution, p1.nom_Pokemon AS "nom_Evoluant", p2.nom_Pokemon AS "nom_Evolue", nom_Type_Evolution FROM Evolution e JOIN Pokemon p1 ON e.id_Pokemon_Evoluant = p1.Id_Pokemon JOIN Pokemon p2 ON e.id_Pokemon_Evolue = p2.Id_Pokemon JOIN Type_Evolution t ON t.Id_Type_Evolution = e.Id_Type_Evolution WHERE id_Pokemon_Evoluant = ${pkmEvoluantID} AND id_Pokemon_Evolue = ${pkmEvolueID};`
				
				db.query(query, function (err, resultatEvolution, fields)
				{
					if (err) { console.error(err); }

					if (resultatEvolution[0].Id_Type_Evolution == 1)
					{
						let nbPokemonNecessaire = (resultatEvolution[0].stade_Evolution) + 1;

						if (resultat.length < nbPokemonNecessaire)
						{
							interaction.editReply({ content: "Erreur, tu ne possède pas assez de fois ce pokemon, il t'en faut " + nbPokemonNecessaire + " pour le faire évoluer."});
							return;
						}
						else
						{
							db.query(`INSERT INTO Evolue (pokemon_Evoluant, pokemon_Evolue, id_Utilisateur, dateEvolution) VALUES (${pkmEvoluantID}, ${resultatEvolution[0].id_Pokemon_Evolue}, ${utilisateur.id}, '${dateFormate}');`, function (err, insertEvolue, fields)
							{
								if (err) { console.error(err); }

								for (let i = 0; i < nbPokemonNecessaire; i++)
								{
									db.query(`DELETE FROM PC WHERE PC_Id = ${resultat[i].PC_Id} ;`, function (err, rdelete, fields)
									{
											if (err) { console.error(err); }


									});
								}

								const channel = client.channels.cache.get(config.channelLog);
								channel.send(`${utilisateur.username} a fait évoluer ${nbPokemonNecessaire} ${resultatEvolution[0].nom_Evoluant} en ${resultatEvolution[0].nom_Evolue}`);

								interaction.editReply({ content: `Vos ${nbPokemonNecessaire} ${resultatEvolution[0].nom_Evoluant} ont évolué en un(e) ${resultatEvolution[0].nom_Evolue}.`});
								return;

							});
						}
					}
					else
					{
						db.query(`SELECT p.Id_Objet, o.nomObjet, p.quantite FROM Possede p JOIN Objet o ON p.Id_Objet = o.Id_Objet WHERE o.Id_Type_Evolution = ${resultatEvolution[0].Id_Type_Evolution} AND p.Id_Discord = ${utilisateur.id};`, function (err, selectPossession, fields)
						{
							if (err) { console.error(err); }

							if (selectPossession.length <= 0 || selectPossession[0].quantite <= 0)
							{
								interaction.editReply({ content: `Vous ne possédez pas l'objet nécessaire pour faire évoluer ce pokémon.` });
								return;
							}
							else
							{

								db.query(`INSERT INTO Evolue (pokemon_Evoluant, pokemon_Evolue, id_Utilisateur, dateEvolution) VALUES (${pkmEvoluantID}, ${resultatEvolution[0].id_Pokemon_Evolue}, ${utilisateur.id}, '${dateFormate}')`, function (err, insertPKM, fields)
								{
									if (err) { console.error(err); }

									db.query(`DELETE FROM PC WHERE PC_Id = ${resultat[0].PC_Id} ;`, function (err, rdelete, fields)
									{
										if (err) { console.error(err); }
											
										db.query(`UPDATE Possede SET quantite = quantite - 1 WHERE Id_Discord = ${utilisateur.id} AND Id_Objet = ${selectPossession[0].Id_Objet}`, function (err, UpdateQuantite, fields)
										{
											if (err) { console.error(err); }
												
											const channel = client.channels.cache.get(config.channelLog);
											channel.send(`${utilisateur.username} a fait évoluer ${resultatEvolution[0].nom_Evoluant} en ${resultatEvolution[0].nom_Evolue} à l'aide d'un(e) ${selectPossession[0].nomObjet}`);

											interaction.editReply({ content: `Votre ${resultatEvolution[0].nom_Evoluant} a évolué en un(e) ${resultatEvolution[0].nom_Evolue} à l'aide d'un(e) ${selectPossession[0].nomObjet}.`});
											return;
										});

									});
								});
							}

						});
					}

				});
			}
		});

	}
}




function genererEmbedEvolution (resultatEvolution)
{
	/* ------------------------------------------------- */
	/*             Récupérations des données             */
	/* ------------------------------------------------- */

	let nom = resultatEvolution[0].nom_Evoluant;
	let nb  = resultatEvolution.length;

	let description = "";

	resultatEvolution.forEach(evolution => 
	{
		let nomEvo = evolution.nom_Type_Evolution;
		
		description += "- " + evolution.nom_Evolue + " (**" + nomEvo.replace("_", ' ') + "**) \n";
	});


	/* ------------------------------------------------- */
	/*               Génération de l'embed               */
	/* ------------------------------------------------- */

	let embed = 
	[
		{
		"type": "rich",
		"title": `Choisis ton évolution !`,
		"description": `**${nom}** possède un total de ${nb} évolutions : \n\n ${description}`,
		"color": 0x90d5d5,
		"url": `https://www.pokepedia.fr/${nom}`
		}
	];

	return embed;

}

function genererComponentEvolution(resultatEvolution, pokemonID) 
{
	let components = [];
  
	resultatEvolution.forEach(evolution => 
	{
		let newComponent = 
		{
			"type": 2,
			"style": 3,
			"label": `${evolution.nom_Evolue}`,
			"custom_id": `evoluer_${pokemonID}_${evolution.id_Pokemon_Evolue}`,
			"disabled": false,
			"emoji": 
			{
			"id": `718859190956982394`,
			"name": `pokeball`,
			"animated": false
			}
		};
  
	  	components.push(newComponent);
	});
  
	return [{"type": 1, "components": components}];
  }
