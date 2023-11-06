/**
 * @author Kinton, Astyell
 * @version 2.0 
 * @date 12/10/2023 
 * @description This is the main file of the application.
 */

//github shinaningans
/* ----------------------------------------------- */
/*           Intialisation des requires            */
/* ----------------------------------------------- */

const DISCORD = require("discord.js");
const CONFIG = require('./config.json');
const db = require('./lib/database/init.js');
const { readdirSync } = require('fs');
let commandsfile = readdirSync("./commands");


/* ----------------------------------------------- */
/*               Création du client                */
/* ----------------------------------------------- */

//creation du client avec intents et partials selon les commands
let client = {};
let partials = [];
let intents = [];
commandsfile.forEach(files => {
    partials.push(require(`./commands/${files}`)?.partials)
    intents.push(require(`./commands/${files}`)?.intents)
    delete require.cache[require.resolve(`./commands/${files}`)]
});
commandsfile = readdirSync("./commands")

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

// Lorsque le bot démarre il envoie deux trois messages de vérification dans la console
client.once('ready', c => {
    console.log(`${Date(Date.now()).toLocaleString('fr-FR')} | ${client.user.username} | ${client.guilds.cache.size} guilds`)
    console.log(`wesh`)
    commandsfile.forEach(files => {
        require(`./commands/${files}`)?.create()
        console.log(`commande ${files} créée`)
    })

    client.user.setActivity('pokémons !', {
        type: 'WATCHING'
    });
})

// Création des commandes qui sont dans le dossier "commands"
client.on("interactionCreate", async (interaction) => {
    //console.log(interaction.customId.split("_"))
    if (interaction.isCommand() || interaction.isContextMenuCommand()) {
        // console.log(interaction?.command?.name); console.log(interaction?.commandName);
        require('./commands/' + interaction.commandName).run(interaction)
    }
    if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
        require('./commands/' + interaction.customId.split("_")[0]).run(interaction)
    }
})

// Vérification des DMs du bot pour éviter de le faire planter
client.on('messageCreate', message => {
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
