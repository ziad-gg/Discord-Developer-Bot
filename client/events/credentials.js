const { Events, ModalSubmitInteraction } = require('discord.js');
const { EventBuilder } = require('handler.djs');

const database = require('@database');
const session = require('@/src/Sessions.js');

EventBuilder.$N`${Events.InteractionCreate}`.$E(Execution).$L();

/**
 * @param {ModalSubmitInteraction} interaction 
 */
async function Execution(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith('credentials')) return;

    await interaction.deferReply({ ephemeral: true });

    if (interaction.customId.includes('signup')) {
        const username = interaction.fields.getTextInputValue('username');
        const password = interaction.fields.getTextInputValue('password');

        const credential = await database.credentials.findFirst({ where: { username } });
        if (credential) return interaction.editReply('> ❌ This username is already in use.');

        await database.credentials.create({
            data: {
                username: username,
                password: password
            }
        }).then(() => {
            interaction.editReply('> ✅ credentials created.');
        }).catch(() => {
            interaction.editReply('> ❌ Something went wrong.');
        });
    }

    if (interaction.customId.includes('login')) {
        const username = interaction.fields.getTextInputValue('username');
        const password = interaction.fields.getTextInputValue('password');

        const credential = await database.credentials.findFirst({ where: { username, password } });
        if (!credential) return interaction.editReply('> ❌ Incorrect username or password.');

        session.add(interaction.user.id, credential.id)

        await interaction.editReply('> ✅ Login successful');
        interaction.followUp({ content: '> ⏲️ You will need to log in again after 5 minutes.', ephemeral: true });
    }

};