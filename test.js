const mysql = require('mysql2');
const config = require('./config.json');

const connection = mysql.createConnection(config.sql);

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connecté à la base de données');

    // Ajoutez ici une requête de test pour vérifier que la base de données fonctionne
    connection.query('SELECT * FROM Utilisateur', (error, results, fields) => {
        if (error) {
            console.error('Erreur lors de l\'exécution de la requête:', error);
            return;
        }
        console.log('Le résultat de la requête est:', results[0]);

        // Fermez la connexion après avoir vérifié la requête
        connection.end((err) => {
            if (err) {
                console.error('Erreur lors de la fermeture de la connexion:', err);
            } else {
                console.log('Connexion fermée avec succès');
            }
        });
    });
});
