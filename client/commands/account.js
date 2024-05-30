const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const { CommandBuilder } = require('handler.djs');

const database = require('@database');
const manager = require('@/src/Manager.js');
const session = require('@/src/Sessions.js');

CommandBuilder.$N`accounts`.$I(async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const credentialId = session.getUserCredentials(interaction.user.id);
    if (!credentialId) return interaction.editReply('> ❌ You are not logged in.');

    const credentials = await database.credentials.findFirst({ where: { id: credentialId } });
    if (!credentials) return interaction.editReply(`> ❌ Credentials was deleted`)

    const Embed = new EmbedBuilder().setColor('Red').setTitle('❌ You dont have any registered account');
    if (credentials.accounts.length == 0) interaction.editReply({ embeds: [Embed] });

    const Embeds = [];
    const Invalid = [];

    const menu = new StringSelectMenuBuilder()
        .setCustomId('controller-accounts')
        .setPlaceholder('Select an account!')

    for (const account of credentials.accounts) {
        const User = await manager.CheckToken(account.token);

        if (!User) {
            Invalid.push(account.id);
            continue;
        }

        const icon_url = `https://cdn.discordapp.com/avatars/${User.id}/${User.avatar}.png?size=512`;
        Embeds.push(new EmbedBuilder().setColor(User.accent_color).setAuthor({ name: User.username, iconURL: icon_url }));

        menu.addOptions(
            new StringSelectMenuOptionBuilder().setLabel(`${User.username} Bots`).setDescription(`${User.username} Account Bots`).setValue(`${credentialId}-${User.id}`)
        )
    };

    menu.addOptions(
        new StringSelectMenuOptionBuilder().setLabel(`reset 🔃`).setDescription(`reset 🔃`).setValue(`reset`)
    );

    const row = new ActionRowBuilder().addComponents(menu);
    interaction.editReply({ embeds: Embeds, components: [row] });

    const filtered = credentials.accounts.filter(acc => !Invalid.includes(acc.id));

    database.credentials.update({
        where: { id: credentialId },
        data: {
            accounts: filtered
        }
    }).catch(e => null)

}).$D('Get credential accounts').$S(new SlashCommandBuilder());

const SlashBuilder = new SlashCommandBuilder().addStringOption(op =>
    op.setName('token').setDescription('Account Token').setRequired(true)
);

CommandBuilder.$N`account_add`.$I(async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const credentialId = session.getUserCredentials(interaction.user.id);
    if (!credentialId) return interaction.editReply('> ❌ You are not logged in.');

    const Token = interaction.options.getString('token');
    const User = await manager.CheckToken(Token);
    if (!User) return interaction.editReply('> ❌ Invalid token.');

    const Applications = await manager.GetApplication(Token);
    if (!Applications) return interaction.editReply('> ❌ Something went wrong.');

    const credentials = await database.credentials.findFirst({ where: { id: credentialId } });
    if (!credentials) return interaction.editReply(`> ❌ Credentials was deleted`)

    database.credentials.update({
        where: { id: credentialId },
        data: {
            accounts: {
                push: { token: Token, username: User.username, id: User.id }
            }
        }
    }).then(() => {
        interaction.editReply('> ✅ Account added.');
    }).catch(() => {
        interaction.editReply('> ❌ Something went wrong.');
    })

}).$D('Add credential accounts').$S(SlashBuilder);