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

// ✅ FIXED READY EVENT (works with Fluxer)
client.on('ready', () => {
  console.log(`✅ Bot is online! Logged in as ${client.user?.username}`);
});

// === EXTRA DEBUG EVENTS ===
client.on('debug', (msg) => {
  console.log('🐛 DEBUG:', msg);
});

client.on('error', (err) => {
  console.error('❌ CLIENT ERROR:', err);
});

client.on('warn', (msg) => {
  console.warn('⚠️ WARN:', msg);
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
        console.log(`⚡ Executing command: ${commandName}`);
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

// === GLOBAL ERROR LOGGING ===
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled promise rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught exception:', err);
});

// === LOGIN ===
console.log('🔐 Attempting to log in...');
console.log('Token present:', !!config.token);

try {
  await client.login(config.token);
  console.log('📡 Login request sent');
} catch (err) {
  console.error('❌ Login failed hard:', err);
}