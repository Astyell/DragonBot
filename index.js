/**
 * @author Kinton, Astyell
 * @version 2.2.1 - 28/11/2023
 * @date 12/10/2023 
 * @description This is the main file of the application.
 */

/* ----------------------------------------------- */
/*           Intialisation des requires            */
/* ----------------------------------------------- */

const DISCORD = require("discord.js");
const CONFIG = require('./config.json');
const db = require('./lib/database/init.js');
const { readdirSync } = require('fs');
let commandsfile = readdirSync("./commands");
let commandsfileRP = readdirSync("./commandRP");
const cron = require("node-cron")


/* ----------------------------------------------- */
/*               Création du client                */
/* ----------------------------------------------- */

//creation du client avec intents et partials selon les commands
let client = {};
let partials = [];
let intents = [];

commandsfile.forEach(files => 
{ 
    partials.push(require(`./commands/${files}`)?.partials)
    intents.push(require(`./commands/${files}`)?.intents)
    delete require.cache[require.resolve(`./commands/${files}`)]
});
commandsfile = readdirSync("./commands")

commandsfileRP.forEach(files => 
{ 
    partials.push(require(`./commandRP/${files}`)?.partials)
    intents.push(require(`./commandRP/${files}`)?.intents)
    delete require.cache[require.resolve(`./commandRP/${files}`)]
});
commandsfileRP = readdirSync("./commandRP")

/* On définit toutes les informations que l'on veut récupérer de discord */

client = new DISCORD.Client({
    intents: [
        DISCORD.GatewayIntentBits.DirectMessages,
        DISCORD.GatewayIntentBits.Guilds,
        DISCORD.GatewayIntentBits.GuildMembers,
        DISCORD.GatewayIntentBits.GuildMessages,
        DISCORD.GatewayIntentBits.MessageContent
    ]
})

// Récupération du token 
client.login(require("../../tokens.json").bot.discord.ali.dragonBot)


// On définit tous les modules que l'on va exporte dans d'autres fichiers
module.exports = { discordClient: client, client, db, config: CONFIG }

/* Supprimer une commande */

// const { REST, Routes } = require('discord.js');

// const rest = new REST().setToken(CONFIG.token);

// rest.delete(Routes.applicationGuildCommand(CONFIG.clientId, CONFIG.guildId, '1171836096645177376'))
// 	.then(() => console.log('Successfully deleted guild command'))
// 	.catch(console.error);

// Lorsque le bot démarre il envoie deux trois messages de vérification dans la console
client.once('ready', c => {
    console.log(`${Date(Date.now()).toLocaleString('fr-FR')} | ${client.user.username} | ${client.guilds.cache.size} guilds`)
    console.log(`wesh`)
    commandsfile.forEach(files => 
    {
        require(`./commands/${files}`)?.create()
        console.log(`commande ${files} créée`)
    })

    commandsfileRP.forEach(files => 
    {
        require(`./commandRP/${files}`)?.create()
        console.log(`commande ${files} créée`)
    })

    client.user.setActivity('Pokémon HearthGold et SoulSilver !');

    cron.schedule('0 19 * * *', () => 
    {
        pingNonJoueur()
    });
})

// Création des commandes qui sont dans le dossier "commands"
client.on("interactionCreate", async (interaction) => 
{
    //console.log(interaction.customId.split("_"))
    if (interaction.isCommand() || interaction.isContextMenuCommand()) 
    {
        // console.log(interaction?.command?.name); console.log(interaction?.commandName);
        try 
        {
            require('./commands/' + interaction.commandName).run(interaction)
        } 
        catch (error) 
        {
            require('./commandRP/' + interaction.commandName).run(interaction)
        }
        
    }
    if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) 
    {
        require('./commands/' + interaction.customId.split("_")[0]).run(interaction)
    }
})

// Vérification des DMs du bot pour éviter de le faire planter
client.on('messageCreate', message => 
{
    //message.content = 'say bonjour comment va tu ?'

    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;

    let args = message.content.split(' ')
    //[say, bonjour, comment, va, tu]
    let command = args.shift().toLowerCase()
    let prefix = command.slice(0, 1)
    if (prefix !== CONFIG.prefix) return;

    if (command == '/test') {
        message.reply(require('./lib/test.js'))
    }
})

// Ca je sais pas ce que c'est mais ça doit être cool
const fs = require('node:fs');



function pingNonJoueur() 
{
    // Channel où le ping aura lieu
    const channel = client.channels.cache.get(CONFIG.channelJeu);

    // Récupération de la date du jour au format mySQL
	let dateAjd = new Date();
	let dateFormate = dateAjd.getFullYear() + "-";
	(dateAjd.getMonth() + 1) < 10 ? dateFormate += "0" + (dateAjd.getMonth() + 1) : dateFormate += (dateAjd.getMonth() + 1);
	dateFormate += "-" + dateAjd.getDate();

    //Récupéré tous les joueurs n'ayant pas encore joué

    let query = `SELECT Id_Discord, nom_utilisateur FROM Utilisateur u WHERE NOT EXISTS ( SELECT 1 FROM Capture c WHERE c.Id_Discord = u.Id_Discord AND c.date_capture = '${dateFormate}');`

    db.query(query, function (err, resultat, fields)
	{
        let message = "";

        resultat.forEach(element => 
		{
			message += `- **${element.nom_utilisateur}**\n`;
		})


        // Envoie du message

        channel.send({content : `||<@&${CONFIG.pingRole}>||\nPetit rappel quotidien pour ceux n'ayant pas encore joué !`, 
                      embeds   :  [
                        {
                        "type": "rich",
                        "title": `Listes des dresseurs n'ayant pas encore joué !`,
                        "description": `${message}`,
                        "color": 0x344c72,
                        "url": `https://m104.ovh/Dragonbot/Hmmmmm.html`
                        }
                        ]
                    });
        return;
        
    });

}
