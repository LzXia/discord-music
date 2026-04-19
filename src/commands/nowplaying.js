const { SlashCommandBuilder } = require('discord.js');
const { buildPlayerEmbed, buildPlayerButtons } = require('../ui');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('🎶 Muestra la canción que se está reproduciendo'),

    async execute(interaction, client) {
        const queue = client.queues.get(interaction.guildId);
        if (!queue || !queue.songs[queue.currentIndex]) {
            return interaction.reply({ content: '❌ No hay nada reproduciéndose.', ephemeral: true });
        }

        const embed = buildPlayerEmbed(queue.songs[queue.currentIndex], queue);
        const buttons = buildPlayerButtons(queue);
        return interaction.reply({ embeds: [embed], components: buttons });
    }
};
