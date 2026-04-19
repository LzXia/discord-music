const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('⏹ Detiene la música y desconecta el bot'),

    async execute(interaction, client) {
        const queue = client.queues.get(interaction.guildId);
        if (!queue) {
            return interaction.reply({ content: '❌ No hay nada reproduciéndose.', ephemeral: true });
        }

        queue.songs = [];
        queue.currentIndex = 0;
        queue.loop = false;
        queue.loopQueue = false;
        queue.player?.stop(true);
        queue.connection?.destroy();
        queue.connection = null;

        if (queue.playerMessage) {
            await queue.playerMessage.edit({ content: '👋 Bot desconectado.', embeds: [], components: [] }).catch(() => {});
            queue.playerMessage = null;
        }

        client.queues.delete(interaction.guildId);
        return interaction.reply({ content: '👋 Bot desconectado y cola limpiada.', ephemeral: true });
    }
};
