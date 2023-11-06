const mysql = require("./lib/database/init").test


mysql.query(`SELECT * FROM PC WHERE Id_DresseurAct = 826900077120978996 AND id_Pokemon = 1 AND estShiny = 0;`, (err, cb) => {
    console.error(err)
    console.log(cb)
    process.exit()
})