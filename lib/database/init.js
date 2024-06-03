try 
{
	const mysql = require('mysql2');
	const { sql, sqltest } = require('../../config.json');

	let sqlPool = mysql.createPool(sql);

	module.exports = sqlPool;
}
catch (Exception)
{
	console.error("Erreur de connexion à la base de données. : " + Exception);
}

