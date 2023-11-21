/**
 * @author Astyell
 * @version 1.0 - 10/11/2023
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
			SELECT id_Pokemon_Evoluant, id_Pokemon_Evolue, stade_Evolution, Id_Type_Evolution, p1.nom_Pokemon AS "nom_Evoluant", p2.nom_Pokemon AS "nom_Evolue"
			FROM Evolution e JOIN Pokemon p1 ON e.id_Pokemon_Evoluant = p1.Id_Pokemon
							 JOIN Pokemon p2 ON e.id_Pokemon_Evolue = p2.Id_Pokemon
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
					interaction.editReply({ content: "Il a plusieurs évolutions."});
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