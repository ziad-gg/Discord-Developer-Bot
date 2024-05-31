const { Client, Events } = require('discord.js');
const { EventBuilder } = require('handler.djs');

const database = require('@database');

EventBuilder.$N`${Events.ClientReady}`.$E(Execution).$O().$L();

/**
 * @param {Client} client 
 */
async function Execution(client) {
    const count = await database.credentials.count();
    console.log(`Client Is Ready (${client.user.username}) [credentials: ${count}]`);
};