/** fctAux.js
 * @author Astyell
 * @version 1.0.0 - 02/06/2024
 * @date 02/06/2024 
 * @description Fonction utilisée dans plusieurs commandes différentes
 */

const { client, config, db } = require("../index.js");

module.exports = 
{
	getDateFormate,
	getTauxCapture,
	executeQuery
};

function getDateFormate() 
{
	// Date au format AAAA-MM-JJ
	let dateAjd = new Date();

	// Formatage de la data pour un format correct
	let dateFormate = dateAjd.getFullYear() + "-";

	// Si le mois est < 10 il s'écrira "2" hors nous cherchons à avoir "02"
	(dateAjd.getMonth() + 1) < 10 ? dateFormate += "0" + (dateAjd.getMonth() + 1) : dateFormate += (dateAjd.getMonth() + 1);

	dateFormate += "-" + dateAjd.getDate();
	
	return dateFormate;
}

function getTauxCapture() 
{
	let random = Math.floor(Math.random() * 100 );
	let tauxCapture = -1;
	
	if      (random <  40)                { tauxCapture = 40; } 
	else if (random >= 40 && random < 70) { tauxCapture = 30; } 
	else if (random >= 70 && random < 90) { tauxCapture = 20; } 
	else if (random >= 90 && random < 95) { tauxCapture =  5; } 
	else if (random >= 95 && random < 98) { tauxCapture =  3; } 
	else if (random >= 98)                { tauxCapture  = 2; } 
	else                                  { tauxCapture = -1; }

	return tauxCapture;
}

function executeQuery(query, params)
{
    return new Promise((resolve, reject) => 
	{
        db.query(query, params, (err, results) => 
		{
            if (err) 
			{
                reject(err);
            } 
			else 
			{
                resolve(results);
            }
        });
    });
}