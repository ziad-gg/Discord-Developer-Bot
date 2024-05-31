const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChatInputCommandInteraction } = require('discord.js');
const { default: axios } = require('axios');

/**
 * @param {ChatInputCommandInteraction} interaction 
 * @returns {Promise<{ type: 'done' | 'error', value: string }>}
 */
module.exports.PasswordDialog = (interaction) => {
    return new Promise(async (resolve) => {
        const key = `password-dialog-${interaction.user.id}`;

        const modal = new ModalBuilder()
            .setCustomId(key)
            .setTitle('Multi-Factor Authentication');

        const passwordInput = new TextInputBuilder()
            .setCustomId('password')
            .setLabel("Discord Account Password")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(passwordInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);

        const filter = (i) => i.customId === key;

        interaction.awaitModalSubmit({ filter, time: 60_000 }).then(async i => {
            await i.deferUpdate({ ephemeral: true });
            const password = i.fields.getTextInputValue('password');
            resolve({ type: 'done', value: password });
        }).catch(() => {
            resolve({ type: 'error' });
        });
    });
};

/**
 * @param {ChatInputCommandInteraction} interaction 
 * @returns {Promise<{ type: 'done' | 'error', value: string }>}
 */
module.exports.BotBuilderDialog = (interaction) => {
    return new Promise(async (resolve) => {
        const key = `bot-builder-dialog-${interaction.user.id}`;

        const modal = new ModalBuilder()
            .setCustomId(key)
            .setTitle('General Information');

        const usernameInput = new TextInputBuilder()
            .setCustomId('username')
            .setLabel("Bot Username")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(usernameInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
        const filter = (i) => i.customId === key;

        interaction.awaitModalSubmit({ filter, time: 60_000 }).then(async i => {
            await i.deferUpdate({ ephemeral: true });
            const username = i.fields.getTextInputValue('username');
            resolve({ type: 'done', value: username });
        }).catch(() => {
            resolve({ type: 'error' });
        });
    });
};

/**
 * @param {ChatInputCommandInteraction} interaction 
 * @param {string} name
 * @returns {Promise<{ type: 'done' | 'error', value: string }>}
 */
module.exports.Dialog = (interaction, name) => {
    return new Promise(async (resolve) => {
        const key = `custom-dialog-${interaction.user.id}`;

        const modal = new ModalBuilder()
            .setCustomId(key)
            .setTitle('General Information');

        const Input = new TextInputBuilder()
            .setCustomId(name)
            .setLabel(`${name} input`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(Input);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
        const filter = (i) => i.customId === key;

        interaction.awaitModalSubmit({ filter, time: 60_000 }).then(async i => {
            await i.deferUpdate({ ephemeral: true });
            const input = i.fields.getTextInputValue(name);
            resolve({ type: 'done', value: input });
        }).catch(() => {
            resolve({ type: 'error' });
        });
    })
};

module.exports.Validate = async (interaction) => { };

module.exports.getRandomAvatar = async () => {
    try {
        const randomString = Math.random().toString(36).substring(7);
        const avatarUrl = `https://robohash.org/${randomString}.png`;

        const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');

        return `data:image/png;base64,${base64Image}`;
    } catch (error) {
        console.error('Error fetching avatar:', error);
        return null;
    }
};