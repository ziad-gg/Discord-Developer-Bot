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
    // const currentUserSession = session.getUserCredentials(interaction.user.id);
    // if (currentUserSession != credentialId) return interaction.editReply({ content: '❌ You are not logged in.', ephemeral: true });

    const credentials = await database.credentials.findFirst({ where: { id: credentialId } });
    if (!credentials) return interaction.editReply(`> ❌ Credentials was deleted`);

    const account = credentials.accounts.find(acc => acc.id == accountId);
    if (!account) return interaction.editReply(`> ❌ Account wasn't found`);

    // const bot = await manager.getBotById(botId, account.token);
    // if (!bot) return interaction.editReply(`> ❌ Bot wasn't found`);

    if (interaction.customId.endsWith('username')) {
        const UsernameDislog = await utils.Dialog(interaction, 'Username');
        if (UsernameDislog.type == 'error') return;

        const username = UsernameDislog.value;
        const Modification = await manager.EditBot(botId, account.token, { username });

        console.log(Modification);
    }

};
