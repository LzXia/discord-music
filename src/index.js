const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

client.commands = new Collection();
client.queues = new Map();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log(`✅ Bot listo como ${client.user.tag}`);
    registerSlashCommands(client);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            const msg = { content: '❌ Ocurrió un error ejecutando este comando.', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(msg).catch(() => {});
            } else {
                await interaction.reply(msg).catch(() => {});
            }
        }
    } else if (interaction.isButton()) {
        const { handleButton } = require('./player');
        await handleButton(interaction, client);
    }
});

async function registerSlashCommands(client) {
    const { REST, Routes } = require('discord.js');
    const commands = [];
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        const cmd = require(path.join(__dirname, 'commands', file));
        commands.push(cmd.data.toJSON());
    }
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ Slash commands registrados globalmente.');
    } catch (err) {
        console.error('Error registrando commands:', err);
    }
}

client.login(process.env.DISCORD_TOKEN);
