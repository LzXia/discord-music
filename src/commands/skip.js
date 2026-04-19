const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('⏭ Salta a la siguiente canción'),

    async execute(interaction, client) {
        const queue = client.queues.get(interaction.guildId);
        if (!queue || !queue.songs.length) {
            return interaction.reply({ content: '❌ No hay nada reproduciéndose.', ephemeral: true });
        }
        const { skipSong } = require('../player');
        queue.loop = false;
        const { playSong } = require('../player');
        queue.currentIndex++;
        if (queue.currentIndex < queue.songs.length) {
            playSong(queue, queue.songs[queue.currentIndex]);
        } else {
            playSong(queue, null);
        }
        return interaction.reply({ content: '⏭ Canción saltada.', ephemeral: true });
    }
};
