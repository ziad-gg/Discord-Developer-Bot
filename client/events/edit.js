const { Events, ChatInputCommandInteraction, ButtonInteraction } = require('discord.js');
const { EventBuilder } = require('handler.djs');

const database = require('@database');
const session = require('@/src/Sessions.js');
const manager = require('@/src/Manager.js');
const utils = require('@/src/Utils.js');

EventBuilder.$N`${Events.InteractionCreate}`.$E(Execution).$L();

/**
 * @param {ChatInputCommandInteraction | ButtonInteraction} interaction 
 */
async function Execution(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('edit')) return;

    const [undefined, credentialId, accountId, botId] = interaction.customId.split('-');
    const currentUserSession = session.getUserCredentials(interaction.user.id);
    if (currentUserSession != credentialId) return interaction.reply({ content: '❌ You are not logged in.', ephemeral: true });

    const credentials = await database.credentials.findFirst({ where: { id: credentialId } });
    if (!credentials) return interaction.reply({ content: `> ❌ Credentials was deleted`, ephemeral: true });

    const account = credentials.accounts.find(acc => acc.id == accountId);
    if (!account) return interaction.reply({ content: `> ❌ Account wasn't found`, ephemeral: true });

    const bot = await manager.getBotById(botId, account.token);
    if (!bot) return interaction.reply({ content: `> ❌ Bot wasn't found`, ephemeral: true });

    return interaction.reply({content: `This feature is currently in development mode. We appreciate your patience and understanding as we work to bring you the best experience possible. Thank you for your support.`, ephemeral: true });

    if (interaction.customId.endsWith('username')) {
        const UsernameDislog = await utils.Dialog(interaction, 'Username');
        if (UsernameDislog.type == 'error') return;

        const username = UsernameDislog.value;
        const Modification = await manager.EditBot(botId, account.token, { username });

        console.log(Modification);
    }

};
