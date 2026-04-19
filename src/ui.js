const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AudioPlayerStatus } = require('discord.js');

function buildPlayerEmbed(song, queue) {
    const isPlaying = queue.player?.state?.status === AudioPlayerStatus.Playing;
    const loopIcon = queue.loop ? '🔂' : queue.loopQueue ? '🔁' : '▶️';
    const statusIcon = isPlaying ? '▶️' : '⏸️';

    const embed = new EmbedBuilder()
        .setTitle(`${statusIcon} Reproduciendo ahora`)
        .setDescription(`**[${song.title}](${song.url})**`)
        .setColor(0x1DB954)
        .addFields(
            { name: '⏱️ Duración', value: song.duration || 'Desconocida', inline: true },
            { name: '👤 Pedido por', value: song.requestedBy || 'Desconocido', inline: true },
            { name: '🎵 En cola', value: `${queue.currentIndex + 1} / ${queue.songs.length}`, inline: true },
            { name: '🔁 Modo', value: queue.loop ? 'Loop canción' : queue.loopQueue ? 'Loop cola' : 'Normal', inline: true },
        )
        .setFooter({ text: `Music Bot 🎵 | Usa los botones para controlar la música` })
        .setTimestamp();

    if (song.thumbnail) {
        embed.setThumbnail(song.thumbnail);
    }

    return embed;
}

function buildPlayerButtons(queue) {
    const isPlaying = queue.player?.state?.status === AudioPlayerStatus.Playing;
    const hasPrev = queue.currentIndex > 0;
    const hasNext = queue.currentIndex < queue.songs.length - 1;

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('btn_prev')
            .setLabel('⏮ Anterior')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!hasPrev),

        new ButtonBuilder()
            .setCustomId('btn_pause')
            .setLabel(isPlaying ? '⏸ Pausar' : '▶️ Reanudar')
            .setStyle(isPlaying ? ButtonStyle.Secondary : ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId('btn_skip')
            .setLabel('⏭ Siguiente')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!hasNext && !queue.loopQueue),
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('btn_loop')
            .setLabel(queue.loop ? '🔂 Loop ON' : '🔂 Loop OFF')
            .setStyle(queue.loop ? ButtonStyle.Success : ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('btn_loopqueue')
            .setLabel(queue.loopQueue ? '🔁 Cola ON' : '🔁 Cola OFF')
            .setStyle(queue.loopQueue ? ButtonStyle.Success : ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('btn_playlist')
            .setLabel('📋 Playlist')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId('btn_stop')
            .setLabel('⏹ Desconectar')
            .setStyle(ButtonStyle.Danger),
    );

    return [row1, row2];
}

module.exports = { buildPlayerEmbed, buildPlayerButtons };
