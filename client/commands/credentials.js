const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { CommandBuilder } = require('handler.djs');

const session = require('@/src/Sessions.js');

CommandBuilder.$N`signup`.$I(async (interaction) => {
    const modal = new ModalBuilder()
        .setCustomId('credentials-signup')
        .setTitle('Sign Up');

    const usernameInput = new TextInputBuilder()
        .setCustomId('username')
        .setLabel("Don't use real name")
        .setStyle(TextInputStyle.Short);

    const passwordInput = new TextInputBuilder()
        .setCustomId('password')
        .setLabel("At least 8 characters")
        .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder().addComponents(usernameInput);
    const secondActionRow = new ActionRowBuilder().addComponents(passwordInput);

    modal.addComponents(firstActionRow, secondActionRow);

    interaction.showModal(modal);
}).$D('Setup new account').$S(new SlashCommandBuilder());

CommandBuilder.$N`login`.$I(async (interaction) => {
    const modal = new ModalBuilder()
        .setCustomId('credentials-login')
        .setTitle('login');

    const usernameInput = new TextInputBuilder()
        .setCustomId('username')
        .setLabel("Username/Id")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const passwordInput = new TextInputBuilder()
        .setCustomId('password')
        .setLabel("Password")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(usernameInput);
    const secondActionRow = new ActionRowBuilder().addComponents(passwordInput);

    modal.addComponents(firstActionRow, secondActionRow);

    interaction.showModal(modal);
}).$D('Login in').$S(new SlashCommandBuilder());

CommandBuilder.$N`current`.$I(async (interaction) => {
    const currentUserSession = session.getUserCredentials(interaction.user.id);
    if (!currentUserSession) return interaction.reply({ content: '❌ You are not logged in.', ephemeral: true });

    interaction.reply({ content: `> ✅ You are logged in as \`${currentUserSession}\``, ephemeral: true });
}).$D('Current Session').$S(new SlashCommandBuilder());