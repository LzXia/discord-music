# 🎵 Discord Music Bot

Bot de música para Discord con botones coloridos e interactivos.

## ✨ Características

- 🎵 Reproducción desde YouTube (URL o búsqueda por nombre)
- ⏸ Pausar / Reanudar
- ⏭ Siguiente canción
- ⏮ Canción anterior
- 🔂 Loop de canción
- 🔁 Loop de cola completa
- 📋 Ver playlist / cola
- ⏹ Desconectar bot
- 🎨 Botones coloridos interactivos en Discord

## 📋 Comandos

| Comando | Descripción |
|---------|-------------|
| `/play <canción>` | Reproduce una canción (URL o búsqueda) |
| `/queue` | Muestra la cola de reproducción |
| `/skip` | Salta la canción actual |
| `/stop` | Detiene y desconecta el bot |
| `/nowplaying` | Muestra la canción actual con controles |

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/LzXia/discord-music
cd discord-music
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env`:
```env
DISCORD_TOKEN=tu_token_aquí
```

4. Inicia el bot:
```bash
npm start
```

## ⚙️ Requisitos

- Node.js 18+
- FFmpeg instalado en el sistema (`apt install ffmpeg` en Linux)
- Un bot de Discord con los intents: `Guilds`, `GuildMessages`, `MessageContent`, `GuildVoiceStates`

## 🔑 Configuración del Bot en Discord

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Crea una aplicación y un bot
3. En **Bot** → activa `Message Content Intent` y `Server Members Intent`
4. En **OAuth2 → URL Generator**: selecciona `bot` + `applications.commands`
5. Permisos necesarios: `Connect`, `Speak`, `Send Messages`, `Embed Links`, `Read Message History`
6. Copia el token y ponlo en `.env`

## 🛠️ Stack

- [discord.js v14](https://discord.js.org/)
- [@discordjs/voice](https://github.com/discordjs/voice)
- [ytdl-core](https://github.com/fent/node-ytdl-core)
- [ytsr](https://github.com/TimeForANinja/node-ytsr)
