const { Client } = require('discord.js');
const { Application } = require('handler.djs');

const client = new Client({
    intents: 3276799
});

const prefix = process.env.RAILWAY_ENVIRONMENT_NAME ? '!' : '-';

new Application(client, {
    prefix: prefix,
    commands: __dirname.concat('/client/commands'),
    events: __dirname.concat('/client/events'),
});

require('module-alias')();
require('dotenv').config();
require('@/src/Monitor.js');
client.Application.build();

client.login(process.env.BOT_TOKEN);