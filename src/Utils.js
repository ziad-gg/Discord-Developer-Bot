const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChatInputCommandInteraction } = require('discord.js');

/**
 * 
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
            resolve({ type: 'timeout' });
        });
    });
};

module.exports.Validate = async (interaction) => {};