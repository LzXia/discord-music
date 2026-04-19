const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('📋 Muestra la cola de reproducción actual'),

    async execute(interaction, client) {
        const queue = client.queues.get(interaction.guildId);
        if (!queue || !queue.songs.length) {
            return interaction.reply({ content: '📭 La cola está vacía.', ephemeral: true });
        }

        const list = queue.songs.map((s, i) => {
            const marker = i === queue.currentIndex ? '▶️' : `${i + 1}.`;
            return `${marker} **${s.title}** — ${s.duration}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('🎵 Cola de reproducción')
            .setDescription(list.length > 4000 ? list.slice(0, 4000) + '...' : list)
            .setColor(0x9B59B6)
            .setFooter({ text: `${queue.songs.length} canciones en cola` });

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
