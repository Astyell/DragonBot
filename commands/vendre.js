/**
 * @author Astyell
 * @version 1.0.0 - 10/02/2024
 * @creation 10/02/2024
 * @description Permet de vendre un pokémon
 */

const { SlashCommandBuilder } = require('discord.js');
const { client, config, db } = require ("../index.js");

// récapitulatif des prix
const TAUX_PRIX = 
{
    40:  250,
    30:  400,
    20: 1000,
    5:  2000,
    3:  4000,
    2:  8000,
};

// tableaux des acheteurs potentiels

const ACHSPE = ["Professeur Chen"          , "Chef de la team rocket Giovanni", "Maître de la ligue Sacha", "Maîtresse de la ligue Cynthia", "Maître de la ligue Red", "Professeur Sorbier",
                "Leader Team Aqua Arthur"  , "Leader Team Magma Max"          , "Dresseuse Amaryllis"     , "Dresseur Timmy"               , "Dresseur René"         , "Dresseuse Bianca",  
			    "Sir Bidoof the third"     , "Dévoreur de monde Cthulhu"      ];

const ACHTITRE = ["Dresseur / Dresseuse", "Gamin / Filette"    , "Montagnard(e)"             , "Marin(ette)", "Pêcheur / Pêcheuse", "Ranger", "Éleveur / Éleveuse", "Journaliste", 
                  "Pokéfan"             , "Écolier / Écolière" , "TopDresseur / TopDresseuse", "Star"       , "Nomade"            , "Expert(e)"                   , "Clown"      ];

const ACHNOM = ["Robert", "Farouk", "Sylvie", "Eric", "Manami", "Lorenzo", "Masuda", "Erin", "Kyle", "Julien", "Clara", "Franck", "Gérald", "Alex", "Lylia", "Jay", "Marcel",
                "Philippe", "Ricky", "Charlotte", "Achille", "Dixie", "Eve", "Lynn", "Carla", "Abdel", "Raymond", "Trystan", "Stéphane", "Émilie", "Ava", "Aya"];

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
			"name": "vendre", //Nom sensible à la casse, pas de majuscule
			"description": "Permet de vendre un pokémon",
			options:
			[
				{
					name: "id_pokemon",
					description: "Donne l'ID du pokémon que tu veux vendre",
					required: true,
					type: 4,
					min_value: 1,
					max_value: totalPokemon[0].totalPKM
				},
				{
					name: "quantite",
					description: "Donne le nombre de pokémon que tu veux vendre",
					required: true,
					type: 4,
					min_value: 1,
					max_value: 10
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
	let quantite    = interaction.options.getInteger('quantite');

	// Récupération de la date du jour
	let dateAjd = new Date();
	let dateFormate = dateAjd.getFullYear() + "-";
	(dateAjd.getMonth() + 1) < 10 ? dateFormate += "0" + (dateAjd.getMonth() + 1) : dateFormate += (dateAjd.getMonth() + 1);
	dateFormate += "-" + dateAjd.getDate();

	/* ------------------------------------------------- */
	/*               Envoie de la réponse                */
	/* ------------------------------------------------- */

	db.query(`SELECT PC_Id, p.Id_Pokemon, tauxCapture, nom_Pokemon FROM PC JOIN Pokemon p ON PC.Id_Pokemon = p.Id_pokemon WHERE Id_DresseurAct = ${utilisateur.id} AND p.Id_Pokemon = ${pokemonID} AND estShiny = 0`, function (err, resultat, fields) 
	{
		// Gestion de l'erreur
		if (err) { console.error(err); }

		//Gestion si le nombre de réponse est inférieur à la quantité
		if (resultat.length < quantite)
		{
			interaction.editReply({content:`Vous n'avez pas assez de pokemon n°${pokemonID} pour en vendre ${quantite} !`, embeds:[], ephemeral:false});
			return;
		}
		else
		{
			let random = Math.floor(Math.random() * 100 );
			let prix = TAUX_PRIX[resultat[0].tauxCapture] * quantite;

			if (random < 10) { prix *= 2; }

			console.table ("Random = " + random + " prix = " + prix);

			db.query(`INSERT INTO Vend (Id_Vendeur, Id_Pokemon, dateVente, quantite, prix) VALUES (${utilisateur.id}, ${pokemonID}, '${dateFormate}', ${quantite}, ${prix})`, function (err, resultatInsert, fields) 
			{
				if (err) { console.error(err); }

				db.query(`UPDATE Utilisateur SET monnaie = monnaie + ${prix} WHERE Id_Discord = ${utilisateur.id}`, function (err, resultatMonnaie, fields) 
				{
					if (err) { console.error(err); }
					
					for (let i = 0; i < quantite; i++)
					{
						//console.table(resultat[i]); //debug
						db.query(`DELETE FROM PC WHERE PC_Id = ${resultat[i].PC_Id} ;`, function (err, rdelete, fields)
						{
							if (err) { console.error(err); }

						});
					}

					let channelLog = client.channels.cache.get(config.channelLog);

					//Intéraction spéciale
					if (random < 10)
					{
						let rencontre = ACHSPE[Math.floor(Math.random() * ACHSPE.length )];

						channelLog.send({content:`${rencontre} a acheté ${quantite} ${resultat[0].nom_Pokemon} de ${utilisateur.username} pour la modique somme de ${prix} Pokédollars.`});

						interaction.editReply({content:`${rencontre} a acheté ${quantite} de vos ${resultat[0].nom_Pokemon} pour la modique somme de ${prix} Pokédollars.`});
						return;
					}
					else
					{
						let rencontre = ACHTITRE[Math.floor(Math.random() * ACHTITRE.length )] + " " + ACHNOM[Math.floor(Math.random() * ACHNOM.length )];

						channelLog.send({content:`${rencontre} a acheté ${quantite} ${resultat[0].nom_Pokemon} de ${utilisateur.username} pour la modique somme de ${prix} Pokédollars.`});

						interaction.editReply({content:`${rencontre} a acheté ${quantite} de vos ${resultat[0].nom_Pokemon} pour la modique somme de ${prix} Pokédollars.`});
						return;
					}	

				});
			});
		}
	});

}