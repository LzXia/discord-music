const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const { connectAndPlay } = require('../player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('🎵 Reproduce una canción desde YouTube')
        .addStringOption(opt =>
            opt.setName('cancion')
                .setDescription('Nombre o URL de la canción')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const query = interaction.options.getString('cancion');
        let url = query;
        let info;

        try {
            if (!ytdl.validateURL(query)) {
                const results = await ytsr(query, { limit: 5 });
                const videos = results.items.filter(i => i.type === 'video');
                if (!videos.length) {
                    return interaction.editReply('❌ No encontré resultados para esa búsqueda.');
                }
                url = videos[0].url;
            }

            info = await ytdl.getInfo(url);
        } catch (err) {
            console.error('Error buscando canción:', err);
            return interaction.editReply('❌ No pude obtener información de esa canción. Intenta con otra.');
        }

        const details = info.videoDetails;
        const song = {
            title: details.title,
            url: details.video_url,
            duration: formatDuration(details.lengthSeconds),
            thumbnail: details.thumbnails?.slice(-1)[0]?.url,
            requestedBy: interaction.user.username,
        };

        await connectAndPlay(interaction, client, song);
    }
};

function formatDuration(seconds) {
    const s = parseInt(seconds, 10);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const mm = m % 60;
    const ss = s % 60;
    if (h > 0) return `${h}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    return `${mm}:${String(ss).padStart(2, '0')}`;
}
