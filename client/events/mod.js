const { Events, MessageComponentInteraction, codeBlock, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputStyle, TextInputBuilder, ModalBuilder } = require('discord.js');
const { EventBuilder, CommandBuilder } = require('handler.djs');

const database = require('@database');
const manager = require('@/src/Manager.js');
const session = require('@/src/Sessions.js');

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
        if (currentUserSession != credentialId) return interaction.editReply('❌ You are not logged in.');

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
        )

        if (BotAccount) {
            const isValid = await manager.CheckToken(BotAccount.token, true);
            if (!isValid) return interaction.editReply({ components: [row] });
            interaction.editReply(codeBlock(BotAccount.token));
        } else {
            interaction.editReply({ components: [row] });
        };

    }
}

CommandBuilder.$N`verify`.$B((interaction) => {
    const [undefined, credentialId, accountId, botId] = interaction.customId.split('-');

    const currentUserSession = session.getUserCredentials(interaction.user.id);
    if (currentUserSession != credentialId) return interaction.reply('❌ You are not logged in.');

    const modal = new ModalBuilder()
        .setCustomId(`verify-${credentialId}-${accountId}-${botId}`)
        .setTitle('Multi-Factor Authentication');

    const passwordInput = new TextInputBuilder()
        .setCustomId('password')
        .setLabel("Discord Account Password")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(passwordInput);
    modal.addComponents(firstActionRow);

    interaction.showModal(modal);

    const filter = (i) => i.customId === `verify-${credentialId}-${accountId}-${botId}`;

    interaction.awaitModalSubmit({ filter, time: 60_000 }).then(async i => {
        await i.deferUpdate({ ephemeral: true });

        const password = i.fields.getTextInputValue('password');

        const credentials = await database.credentials.findFirst({ where: { id: credentialId } });
        if (!credentials) return i.editReply({ content: `> ❌ Credentials was deleted`, components: [] });

        const account = credentials.accounts.find(acc => acc.id == accountId);
        if (!account) return i.editReply({ content: `> ❌ Account wasn't found`, components: [] });

        const Applications = await manager.GetApplication(account.token);
        if (!Applications) return i.editReply({ content: '> ❌ Something went wrong.', components: [] });

        const bot = Applications.find(app => app.bot.id == botId);
        if (!bot) return i.editReply({ content: `> ❌ Bot wasn't found`, components: [] });

        const mfa = await manager.ResetToken(botId, account.token);
        if (mfa.type != 'verfication') return i.editReply({ content: '> ❌ Unhandled', components: [] });

        const verfication = await manager.verificaiton(account.token, password, mfa.token);
        if (!verfication) return i.editReply({ content: '> ❌ Invalid Password.', components: [] });

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

    }).catch((e) => {
        console.log(e);
        interaction.editReply({ content: '> ❌ Timed out.', components: [] });
    });
});