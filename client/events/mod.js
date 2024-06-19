const { Events, MessageComponentInteraction, codeBlock, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { EventBuilder, CommandBuilder } = require('handler.djs');

const database = require('@database');
const manager = require('@/src/Manager.js');
const session = require('@/src/Sessions.js');
const utils = require('@/src/Utils.js');

EventBuilder.$N`${Events.InteractionCreate}`.$E(Execution).$L();

/**
 * @param {MessageComponentInteraction} interaction 
 */
async function Execution(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('mod')) return;

    await interaction.deferReply({ ephemeral: true });

    if (interaction.customId.endsWith('token')) {
        const [undefined, credentialId, accountId, botId] = interaction.customId.split('-');
        const currentUserSession = session.getUserCredentials(interaction.user.id);
        if (currentUserSession != credentialId) return interaction.editReply({ content: '❌ You are not logged in.', ephemeral: true });

        const credentials = await database.credentials.findFirst({ where: { id: credentialId } });
        if (!credentials) return interaction.editReply(`> ❌ Credentials was deleted`);

        const account = credentials.accounts.find(acc => acc.id == accountId);
        if (!account) return interaction.editReply(`> ❌ Account wasn't found`);

        const Applications = await manager.GetApplication(account.token);
        if (!Applications) return interaction.editReply('> ❌ Something went wrong.');

        const bot = Applications.find(app => app.bot.id == botId);
        if (!bot) return interaction.editReply(`> ❌ Bot wasn't found`);

        const BotAccount = await database.bot.findFirst({ where: { id: bot.id } });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`verify-${credentialId}-${accountId}-${botId}`).setLabel('Verify').setStyle(ButtonStyle.Primary)
        );

        if (BotAccount) {
            const isValid = await manager.CheckToken(BotAccount.token, true);
            if (!isValid) return interaction.editReply({ components: [row] });

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`refresh-${credentialId}-${accountId}-${botId}`).setLabel('Refresh Token').setStyle(ButtonStyle.Danger)
            );

            interaction.editReply({ content: codeBlock(BotAccount.token), components: [row2] });
        } else {
            interaction.editReply({ components: [row] });
        };

    }
}

CommandBuilder.$N`verify`.$B(async (interaction) => {
    const [undefined, credentialId, accountId, botId] = interaction.customId.split('-');

    const currentUserSession = session.getUserCredentials(interaction.user.id);
    if (currentUserSession != credentialId) return interaction.reply({ content: '❌ You are not logged in.', ephemeral: true });

    const PasswordDialog = await utils.PasswordDialog(interaction);
    const password = PasswordDialog.value;
    if (PasswordDialog.type == 'error') return;

    const credentials = await database.credentials.findFirst({ where: { id: credentialId } });
    if (!credentials) return interaction.followUp({ content: `> ❌ Credentials was deleted`, ephemeral: true });

    const account = credentials.accounts.find(acc => acc.id == accountId);
    if (!account) return interaction.followUp({ content: `> ❌ Account wasn't found`, ephemeral: true });

    const bot = await manager.getBotById(botId, account.token);
    if (!bot) return interaction.followUp({ content: `> ❌ Bot wasn't found`, ephemeral: true });

    const mfa = await manager.ResetToken(botId, account.token);
    if (mfa.type == 'done') return interaction.followUp({ content: '> ❌ Unhandled', ephemeral: true });

    const verfication = await manager.verificaiton(account.token, password, mfa.token);
    if (!verfication) return interaction.followUp({ content: '> ❌ Invalid Password.', ephemeral: true });

    const ResetToken = await manager.ResetToken(botId, account.token, verfication.token);

    interaction.editReply({ content: codeBlock(ResetToken.token), components: [] });

    const Bot = await database.bot.findFirst({ where: { id: bot.bot.id } });

    if (Bot) {
        await database.bot.update({
            where: { id: bot.bot.id },
            data: { token: ResetToken.token }
        });
    } else {
        await database.bot.create({
            data: {
                id: bot.bot.id,
                token: ResetToken.token,
                username: bot.bot.username
            }
        })
    };

    // interaction.editReply({ content: '> ❌ Timed out.', components: [] });
});

CommandBuilder.$N`delete`.$B(async (interaction) => {
    const [, , credentialId, accountId, botId] = interaction.customId.split('-');

    const currentUserSession = session.getUserCredentials(interaction.user.id);
    if (currentUserSession != credentialId) return interaction.reply({ content: '❌ You are not logged in.', ephemeral: true });

    const PasswordDialog = await utils.PasswordDialog(interaction);
    const password = PasswordDialog.value;
    if (PasswordDialog.type == 'error') return;

    const credentials = await database.credentials.findFirst({ where: { id: credentialId } });
    if (!credentials) return interaction.followUp({ content: `> ❌ Credentials was deleted`, ephemeral: true });

    const account = credentials.accounts.find(acc => acc.id == accountId);
    if (!account) return interaction.followUp({ content: `> ❌ Account wasn't found`, ephemeral: true });

    const bot = await manager.getBotById(botId, account.token);
    if (!bot) return interaction.followUp({ content: `> ❌ Bot wasn't found`, ephemeral: true });

    const mfa = await manager.deleteBotById(botId, account.token);
    if (mfa.type == 'done') return interaction.followUp({ content: '> ❌ Unhandled', ephemeral: true });

    const verfication = await manager.verificaiton(account.token, password, mfa.token);
    if (!verfication) return interaction.followUp({ content: '> ❌ Invalid Password.', ephemeral: true });

    const _delete = await manager.deleteBotById(botId, account.token, verfication.token);
    if (_delete.type != 'done') return interaction.followUp({ content: '> ❌ Unhandled', ephemeral: true });

    const Embed = new EmbedBuilder().setColor('Red').setTitle('🗑️ Bot deleted.')
    interaction.editReply({ embeds: [Embed], components: [] });
});

CommandBuilder.$N`refresh`.$B(async (interaction) => {
    const [undefined, credentialId, accountId, botId] = interaction.customId.split('-');

    const currentUserSession = session.getUserCredentials(interaction.user.id);
    if (currentUserSession != credentialId) return interaction.reply({ content: '❌ You are not logged in.', ephemeral: true });

    const PasswordDialog = await utils.PasswordDialog(interaction);
    const password = PasswordDialog.value;
    if (PasswordDialog.type == 'error') return;

    const credentials = await database.credentials.findFirst({ where: { id: credentialId } });
    if (!credentials) return interaction.followUp({ content: `> ❌ Credentials was deleted`, ephemeral: true });

    const account = credentials.accounts.find(acc => acc.id == accountId);
    if (!account) return interaction.followUp({ content: `> ❌ Account wasn't found`, ephemeral: true });

    const bot = await manager.getBotById(botId, account.token);
    if (!bot) return interaction.followUp({ content: `> ❌ Bot wasn't found`, ephemeral: true });

    const mfa = await manager.ResetToken(botId, account.token);
    if (mfa.type == 'done') return interaction.followUp({ content: '> ❌ Unhandled', ephemeral: true });

    const verfication = await manager.verificaiton(account.token, password, mfa.token);
    if (!verfication) return interaction.followUp({ content: '> ❌ Invalid Password.', ephemeral: true });

    const ResetToken = await manager.ResetToken(botId, account.token, verfication.token);

    interaction.editReply({ content: codeBlock(ResetToken.token) });

    const Bot = await database.bot.findFirst({ where: { id: bot.bot.id } });

    if (Bot) {
        await database.bot.update({
            where: { id: bot.bot.id },
            data: { token: ResetToken.token }
        });
    } else {
        await database.bot.create({
            data: {
                id: bot.bot.id,
                token: ResetToken.token,
                username: bot.bot.username
            }
        })
    };

    // interaction.editReply({ content: '> ❌ Timed out.', components: [] });
});