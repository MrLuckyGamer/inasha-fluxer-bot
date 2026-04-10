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

// === Load Commands ===
async function loadCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await loadCommands(filePath);
    } else if (file.endsWith('.js')) {
      const mod = await import(pathToFileURL(filePath).href);
      const command = mod.default ?? mod;
      if (command?.name) {
        client.commands.set(command.name, command);
      }
    }
  }
}

const commandsPath = path.join(__dirname, 'commands');
await loadCommands(commandsPath);

// === Ready Event ===
client.on(Events.Ready, async () => {
  const totalUsers = [...client.guilds.values()].reduce((sum, g) => sum + (g.memberCount ?? 0), 0);
  console.log('==========================');
  console.log(`Logged in as ${client.user.username}`);
  console.log(`Serving in ${client.guilds.size} servers`);
  console.log(`Watching over ${totalUsers} users`);
  console.log('==========================');
});

// === Guild member join/leave for serverstats ===
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

  // === Prefix Commands ===
  if (lower.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (command) {
      try {
        await command.execute(message, args, client);
      } catch (error) {
        console.error(error);
        await message.reply('There was an error executing that command.');
      }
    }
    return;
  }

  // === Fun Cat Responses ===
  if (lower.includes('meow')) {
    const responses = [
      'Meow! 🐱', '😺 Meow meow!', 'Mew~', 'Purr~ 😻', 'Nya~ ✨',
      '*eepy meow...* 💤', 'MEOW!!', '🐾 *pounces on you* meow!',
    ];
    return message.reply(responses[Math.floor(Math.random() * responses.length)]);
  }

  // === Dog Responses ===
  const dogWords = ['woof', 'bark', 'bork', 'ruff', 'arf'];
  if (dogWords.some(word => lower.includes(word))) {
    const responses = [
      'Woof! 🐶', 'Bark bark! 🐾', 'bork bork!', 'Ruff~ 🐕',
      '*wags tail excitedly*', '🐶 *gives you a slobbery kiss*',
    ];
    return message.reply(responses[Math.floor(Math.random() * responses.length)]);
  }
});

// === Guild join/leave logging ===
client.on(Events.GuildCreate, (guild) => {
  console.log('====================================');
  console.log(`Added to: ${guild.name} (ID: ${guild.id})`);
  console.log(`Members: ${guild.memberCount ?? 'unknown'}`);
  console.log(`Total Servers: ${client.guilds.size}`);
  console.log('====================================');
});

client.on(Events.GuildDelete, (guild) => {
  console.log('====================================');
  console.log(`Removed from: ${guild.name} (ID: ${guild.id})`);
  console.log(`Total Servers: ${client.guilds.size}`);
  console.log('====================================');
});

// === Login ===
await client.login(config.token);
