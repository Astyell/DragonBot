const mysql = require('mysql');
const { sql, sqltest } = require('../../config.json')

let sqlPool = mysql.createPool(sql);

module.exports = sqlPool;
module.exports.test = mysql.createPool(sqltest)

try 
{
	sql.connect();
}
catch (Exception)
{
	console.error("Erreur de connexion à la base de données.");
}

