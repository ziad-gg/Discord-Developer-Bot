const { Events, AnySelectMenuInteraction, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EventBuilder } = require('handler.djs');
const { default: axios } = require('axios');

const database = require('@database');
const manager = require('@/src/Manager.js');
const session = require('@/src/Sessions.js');

EventBuilder.$N`${Events.InteractionCreate}`.$E(Execution).$L();

/**
 * @param {AnySelectMenuInteraction} interaction 
 */
async function Execution(interaction) {
    if (!interaction.isAnySelectMenu()) return;
    if (!interaction.customId.startsWith('controller')) return;

    await interaction.deferReply({ ephemeral: true });

    if (interaction.customId.includes('accounts')) {
        const [credentialId, accoutnId] = interaction.values[0].split('-');
        const currentUserSession = session.getUserCredentials(interaction.user.id);
        if (currentUserSession != credentialId) return interaction.editReply('❌ You are not logged in.');

        const credentials = await database.credentials.findFirst({ where: { id: credentialId } });
        if (!credentials) return interaction.editReply(`> ❌ Credentials was deleted`);

        const account = credentials.accounts.find(acc => acc.id == accoutnId);
        if (!account) return interaction.editReply(`> ❌ Account wasn't found`);

        const Applications = await manager.GetApplication(account.token);
        if (!Applications) return interaction.editReply('> ❌ Something went wrong.');

        const Embed = new EmbedBuilder().setColor('Red').setTitle('❌ You dont have any registered account');
        if (Applications == 0) interaction.editReply({ embeds: [Embed] });

        const menu = new StringSelectMenuBuilder()
            .setCustomId('controller-bots')
            .setPlaceholder('Select a bot!');

        for (const App of Applications) {
            menu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${App.bot.username}`)
                    .setDescription(`${App.bot.username} Bot Account`)
                    .setValue(`${credentialId}-${accoutnId}-${App.bot.id}`)
            );
        };

        const row = new ActionRowBuilder().addComponents(menu);
        const embed = new EmbedBuilder().setColor('Red').setTitle(`Found ${Applications.length} application`);

        interaction.editReply({ embeds: [embed], components: [row] });
    }

    if (interaction.customId.includes('bots')) {
        const [credentialId, accountId, botId] = interaction.values[0].split('-');
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

        let avatar = `https://cdn.discordapp.com/app-icons/${bot.bot.id}/${bot.bot.avatar}.png?size=512`
        avatar = await axios.get(avatar).catch(err => null) ? avatar : `https://ui-avatars.com/api/?background=494d54&uppercase=false&color=dbdcdd&size=128&font-size=0.33&name=${bot.bot.username}`;

        const key = `mod-${credentialId}-${accountId}-${botId}`;

        const Embed = new EmbedBuilder()
            .setColor('DarkButNotBlack')
            .setTitle(bot.bot.username)
            .setURL(`https://discord.com/developers/applications/${bot.bot.id}`)
            .setImage(encodeURI(avatar))
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(key.concat('-token')).setLabel('🎟️ Token').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('delete'.concat('-', key)).setLabel('🗑️ delete').setStyle(ButtonStyle.Danger),
        );

        interaction.editReply({ embeds: [Embed], components: [row] });
    }
};