const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { buildPlayerEmbed, buildPlayerButtons } = require('./ui');

function getQueue(client, guildId) {
    if (!client.queues.has(guildId)) {
        client.queues.set(guildId, {
            songs: [],
            currentIndex: 0,
            loop: false,
            loopQueue: false,
            player: null,
            connection: null,
            textChannel: null,
            playerMessage: null,
        });
    }
    return client.queues.get(guildId);
}

async function playSong(queue, song) {
    if (!song) {
        if (queue.connection) {
            queue.connection.destroy();
            queue.connection = null;
        }
        if (queue.playerMessage) {
            await queue.playerMessage.edit({ content: '✅ Cola vacía. ¡Hasta luego!', embeds: [], components: [] }).catch(() => {});
        }
        return;
    }

    try {
        const stream = ytdl(song.url, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
        });

        const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
        });

        queue.player.play(resource);

        const embed = buildPlayerEmbed(song, queue);
        const buttons = buildPlayerButtons(queue);

        if (queue.playerMessage) {
            await queue.playerMessage.edit({ embeds: [embed], components: buttons }).catch(() => {});
        } else if (queue.textChannel) {
            queue.playerMessage = await queue.textChannel.send({ embeds: [embed], components: buttons }).catch(() => null);
        }
    } catch (err) {
        console.error('Error playing song:', err);
        if (queue.textChannel) {
            queue.textChannel.send('❌ Error reproduciendo esa canción. Saltando...').catch(() => {});
        }
        skipSong(queue);
    }
}

function skipSong(queue) {
    if (queue.loop) {
        playSong(queue, queue.songs[queue.currentIndex]);
    } else if (queue.loopQueue) {
        queue.currentIndex = (queue.currentIndex + 1) % queue.songs.length;
        playSong(queue, queue.songs[queue.currentIndex]);
    } else {
        queue.currentIndex++;
        if (queue.currentIndex < queue.songs.length) {
            playSong(queue, queue.songs[queue.currentIndex]);
        } else {
            playSong(queue, null);
        }
    }
}

async function connectAndPlay(interaction, client, song) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
        return interaction.reply({ content: '❌ Debes estar en un canal de voz.', ephemeral: true });
    }

    const queue = getQueue(client, interaction.guildId);
    queue.textChannel = interaction.channel;
    queue.songs.push(song);

    if (!queue.connection) {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        queue.player = player;
        queue.connection = connection;

        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            skipSong(queue);
        });

        player.on('error', err => {
            console.error('Player error:', err);
            skipSong(queue);
        });

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch {
                connection.destroy();
                client.queues.delete(interaction.guildId);
            }
        });

        queue.currentIndex = queue.songs.length - 1;

        await interaction.reply({ content: `🎵 Conectado a **${voiceChannel.name}** y reproduciendo...`, ephemeral: true });
        playSong(queue, song);
    } else {
        await interaction.reply({ content: `✅ **${song.title}** añadida a la cola (#${queue.songs.length}).`, ephemeral: true });
        if (queue.player.state.status === AudioPlayerStatus.Idle) {
            queue.currentIndex = queue.songs.length - 1;
            playSong(queue, song);
        }
    }
}

async function handleButton(interaction, client) {
    const queue = client.queues.get(interaction.guildId);
    const buttonId = interaction.customId;

    if (!queue) {
        return interaction.reply({ content: '❌ No hay nada reproduciéndose.', ephemeral: true });
    }

    await interaction.deferUpdate().catch(() => {});

    switch (buttonId) {
        case 'btn_pause': {
            const status = queue.player?.state?.status;
            if (status === AudioPlayerStatus.Playing) {
                queue.player.pause();
            } else if (status === AudioPlayerStatus.Paused) {
                queue.player.unpause();
            }
            break;
        }
        case 'btn_skip': {
            queue.loop = false;
            skipSong(queue);
            break;
        }
        case 'btn_prev': {
            if (queue.currentIndex > 0) {
                queue.loop = false;
                queue.currentIndex -= 2;
                skipSong(queue);
            }
            break;
        }
        case 'btn_loop': {
            queue.loop = !queue.loop;
            queue.loopQueue = false;
            const embed = buildPlayerEmbed(queue.songs[queue.currentIndex], queue);
            const buttons = buildPlayerButtons(queue);
            if (queue.playerMessage) {
                await queue.playerMessage.edit({ embeds: [embed], components: buttons }).catch(() => {});
            }
            break;
        }
        case 'btn_loopqueue': {
            queue.loopQueue = !queue.loopQueue;
            queue.loop = false;
            const embed = buildPlayerEmbed(queue.songs[queue.currentIndex], queue);
            const buttons = buildPlayerButtons(queue);
            if (queue.playerMessage) {
                await queue.playerMessage.edit({ embeds: [embed], components: buttons }).catch(() => {});
            }
            break;
        }
        case 'btn_stop': {
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
            break;
        }
        case 'btn_playlist': {
            const songs = queue.songs;
            if (!songs.length) {
                await interaction.followUp({ content: '📭 La cola está vacía.', ephemeral: true }).catch(() => {});
                return;
            }
            const list = songs.map((s, i) => {
                const marker = i === queue.currentIndex ? '▶️' : `${i + 1}.`;
                return `${marker} **${s.title}** — ${s.duration}`;
            }).join('\n');
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
                .setTitle('🎵 Cola de reproducción')
                .setDescription(list.length > 4000 ? list.slice(0, 4000) + '...' : list)
                .setColor(0x9B59B6);
            await interaction.followUp({ embeds: [embed], ephemeral: true }).catch(() => {});
            break;
        }
    }

    if (['btn_pause'].includes(buttonId) && queue.songs[queue.currentIndex]) {
        const embed = buildPlayerEmbed(queue.songs[queue.currentIndex], queue);
        const buttons = buildPlayerButtons(queue);
        if (queue.playerMessage) {
            await queue.playerMessage.edit({ embeds: [embed], components: buttons }).catch(() => {});
        }
    }
}

module.exports = { connectAndPlay, handleButton, getQueue, playSong };
