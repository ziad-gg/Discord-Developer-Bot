const { Client } = require('discord.js');
const { Application } = require('handler.djs');

const client = new Client({
    intents: 3276799
});

new Application(client, {
    commands: __dirname.concat('/client/commands'),
    events: __dirname.concat('/client/events'),
});

require('module-alias')();
require('dotenv').config();

client.Application.build();

client.login(process.env.BOT_TOKEN);