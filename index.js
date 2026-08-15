import { Client, Events, EmbedBuilder } from '@fluxerjs/core';
import { pathToFileURL } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  token: process.env.FLUXER_BOT_TOKEN,
  prefix: process.env.prefix || 'i>',
};

const client = new Client({ intents: 0, suppressIntentWarning: true, waitForGuilds: true });

// === Command Collection ===
client.commands = new Map();

// Ready Event
client.on('ready', async () => {
  console.log(`✅ Bot is online! Logged in as ${client.user?.username}`);

  // Re-sync stat channels for every guild on startup, in case anything changed (members, channels) while the bot was offline.
  try {
    const { updateStats } = await import('./commands/serverstats.js');
    for (const guild of client.guilds.values()) {
      await updateStats(guild, client);
    }
  } catch (e) { console.error(e); }

  // Safety-net refresh: re-sync periodically in case any event is missed.
  setInterval(async () => {
    try {
      const { updateStats } = await import('./commands/serverstats.js');
      for (const guild of client.guilds.values()) {
        await updateStats(guild, client);
      }
    } catch (e) { console.error(e); }
  }, 10 * 60 * 1000); // every 10 minutes
});

// === Load Commands ===
async function loadCommands(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await loadCommands(filePath);
    } else if (file.endsWith('.js')) {
      try {
        const mod = await import(pathToFileURL(filePath).href);
        const command = mod.default ?? mod;

        if (command?.name) {
          client.commands.set(command.name, command);
          console.log(`📦 Loaded command: ${command.name}`);
          for (const alias of command.aliases ?? []) {
            client.commands.set(alias, command);
            console.log(`   ↳ alias: ${alias}`);
          }
        } else {
          console.log(`⚠️ Skipped file (no command): ${file}`);
        }
      } catch (err) {
        console.error(`❌ Failed to load command file: ${file}`);
        console.error(err);
      }
    }
  }
}

const commandsPath = path.join(__dirname, 'commands');
await loadCommands(commandsPath);

// === Guild member join/leave ===
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const { updateStats } = await import('./commands/serverstats.js');
    await updateStats(member.guild, client);
  } catch (e) { console.error(e); }
});

client.on(Events.GuildMemberRemove, async (member) => {
  try {
    const { updateStats } = await import('./commands/serverstats.js');
    await updateStats(member.guild, client);
  } catch (e) { console.error(e); }
});

// === Channel create/delete (keeps the "Channels" stat in sync) ===
client.on(Events.ChannelCreate, async (channel) => {
  try {
    const guild = channel.guild ?? client.guilds.get(channel.guildId);
    if (!guild) return;
    const { updateStats } = await import('./commands/serverstats.js');
    await updateStats(guild, client);
  } catch (e) { console.error(e); }
});

client.on(Events.ChannelDelete, async (channel) => {
  try {
    const guild = channel.guild ?? client.guilds.get(channel.guildId);
    if (!guild) return;
    const { updateStats } = await import('./commands/serverstats.js');
    await updateStats(guild, client);
  } catch (e) { console.error(e); }
});

// === Message Handler ===
client.on(Events.MessageCreate, async (message) => {
  if (message.author?.bot) return;

  const lower = (message.content ?? '').toLowerCase();
  const prefix = config.prefix.toLowerCase();

  if (lower.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (command) {
      try {
        console.log(`⚡ ${message.author.username} ran: ${commandName}`);
        await command.execute(message, args, client);
      } catch (error) {
        console.error(`❌ Error executing command: ${commandName}`);
        console.error(error);
        await message.reply('There was an error executing that command.');
      }
    }
    return;
  }

  if (lower.includes('meow')) {
    const responses = [
      'Meow! 🐱','😺 Meow meow!','Mew~','Purr~ 😻','Nya~ ✨',
      '*eepy meow...* 💤','MEOW!!','🐾 *pounces on you* meow!',
    ];
    return message.reply(responses[Math.floor(Math.random() * responses.length)]);
  }

  const dogWords = ['woof','bark','bork','ruff','arf'];
  if (dogWords.some(word => lower.includes(word))) {
    const responses = [
      'Woof! 🐶','Bark bark! 🐾','bork bork!','Ruff~ 🐕',
      '*wags tail excitedly*','🐶 *gives you a slobbery kiss*',
    ];
    return message.reply(responses[Math.floor(Math.random() * responses.length)]);
  }
});

// === Global Error Logging ===
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled promise rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught exception:', err);
});

// === Login ===
console.log('🔐 Attempting to log in...');
await client.login(config.token);