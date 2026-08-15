import { EmbedBuilder } from '@fluxerjs/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fishFile     = path.join(__dirname, '../../data/fish/fish.json');
const cooldownFile = path.join(__dirname, '../../data/fish/fishCooldowns.json');

function ensureDir(f) {
  const d = path.dirname(f);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  if (!fs.existsSync(f)) fs.writeFileSync(f, '{}');
}
ensureDir(fishFile);
ensureDir(cooldownFile);

let fishData  = JSON.parse(fs.readFileSync(fishFile));
let cooldowns = JSON.parse(fs.readFileSync(cooldownFile));

const COOLDOWN = 60 * 60 * 1000; // 1 hour

const fishes = [
  { name: '🐟 Common Fish',   min: 1,  max: 20,  weight: 50 },
  { name: '🐠 Tropical Fish', min: 21, max: 40,  weight: 30 },
  { name: '🐡 Pufferfish',    min: 41, max: 60,  weight: 15 },
  { name: '🐙 Octopus',       min: 61, max: 80,  weight: 4  },
  { name: '🦈 Shark',         min: 81, max: 100, weight: 1  },
];

function getRandomFish() {
  const total = fishes.reduce((s, f) => s + f.weight, 0);
  let rng = Math.random() * total;
  for (const fish of fishes) {
    if (rng < fish.weight) return fish;
    rng -= fish.weight;
  }
  return fishes[0];
}

export default {
  name: 'fish',
  description: 'Go fishing and try to catch the most rare fish!',
  category: 'Fun',
  async execute(message) {
    const guildId = message.guildId;
    const userId  = message.author.id;
    const now     = Date.now();

    if (!cooldowns[guildId]) cooldowns[guildId] = {};
    const lastFish = cooldowns[guildId][userId] || 0;

    if (now - lastFish < COOLDOWN) {
      const rem = COOLDOWN - (now - lastFish);
      const h = Math.floor(rem / 3600000);
      const m = Math.floor((rem % 3600000) / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      return message.reply(`⏳ You need to wait **${h}h ${m}m ${s}s** before fishing again.`);
    }

    const caught = getRandomFish();
    const points = Math.floor(Math.random() * (caught.max - caught.min + 1)) + caught.min;

    if (!fishData[guildId]) fishData[guildId] = {};
    if (!fishData[guildId][userId]) fishData[guildId][userId] = 0;
    fishData[guildId][userId] += points;
    fs.writeFileSync(fishFile, JSON.stringify(fishData, null, 2));

    cooldowns[guildId][userId] = now;
    fs.writeFileSync(cooldownFile, JSON.stringify(cooldowns, null, 2));

    const embed = new EmbedBuilder()
      .setTitle(`${message.author.username} went fishing! 🎣`)
      .setDescription(
        `You caught a **${caught.name}**!\nCoins Earned: **${points}**\nTotal Coins Earned: **${fishData[guildId][userId]}**`
      )
      .setColor(6086089)
      .setTimestamp(new Date());

    await message.channel.send({ embeds: [embed] });
  },
};
