const { Client, Events } = require('discord.js');
const { EventBuilder } = require('handler.djs');

EventBuilder.$N`${Events.ClientReady}`.$E(Execution).$O().$L();

/**
 * @param {Client} client 
 */
function Execution(client) {
    console.log(`Client Is Ready (${client.user.username})`);
};