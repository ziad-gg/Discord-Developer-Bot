const { EmbedBuilder, ContextMenuCommandBuilder } = require('discord.js');
const { CommandBuilder } = require('handler.djs');

CommandBuilder.$N`uptime`.$CM(new ContextMenuCommandBuilder()).$M(Execution).$CME(Execution);
CommandBuilder.$N`ping`.$CM(new ContextMenuCommandBuilder()).$M(PingExecution).$CME(PingExecution);

const startTime = Date.now();

function Execution(message) {
    const currentTime = Date.now();
    const uptime = currentTime - startTime;
    const uptimeString = formatUptime(uptime);

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Bot Uptime')
        .setDescription(`🕒 **Uptime:** ${uptimeString}`)
        .setTimestamp();

    message.replyNoMention({ embeds: [embed] });
}

function PingExecution(message) {
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Ping')
        .setDescription(`🏓 Pong! Latency is ${Date.now() - message.createdTimestamp}ms.`)
        .setTimestamp();

    message.replyNoMention({ embeds: [embed] });
}

/**
 * @param {number} uptime 
 * @returns {string}
 */
function formatUptime(uptime) {
    const seconds = Math.floor((uptime / 1000) % 60);
    const minutes = Math.floor((uptime / (1000 * 60)) % 60);
    const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

    return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
};