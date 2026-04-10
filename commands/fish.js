import { EmbedBuilder } from '@fluxerjs/core';
import { pool } from '../db.js';

const COOLDOWN = 60 * 60 * 1000; // 1 hour in ms

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

    // Check cooldown
    const { rows: cdRows } = await pool.query(
      'SELECT last_fished FROM fish_cooldowns WHERE guild_id=$1 AND user_id=$2',
      [guildId, userId]
    );
    const lastFish = cdRows[0]?.last_fished ?? 0;

    if (now - lastFish < COOLDOWN) {
      const rem = COOLDOWN - (now - lastFish);
      const h = Math.floor(rem / 3600000);
      const m = Math.floor((rem % 3600000) / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      return message.reply(`⏳ You need to wait **${h}h ${m}m ${s}s** before fishing again.`);
    }

    const caught = getRandomFish();
    const points = Math.floor(Math.random() * (caught.max - caught.min + 1)) + caught.min;

    // Upsert score
    const { rows: scoreRows } = await pool.query(
      `INSERT INTO fish_scores (guild_id, user_id, score)
       VALUES ($1, $2, $3)
       ON CONFLICT (guild_id, user_id)
       DO UPDATE SET score = fish_scores.score + $3
       RETURNING score`,
      [guildId, userId, points]
    );
    const totalScore = scoreRows[0].score;

    // Upsert cooldown
    await pool.query(
      `INSERT INTO fish_cooldowns (guild_id, user_id, last_fished)
       VALUES ($1, $2, $3)
       ON CONFLICT (guild_id, user_id)
       DO UPDATE SET last_fished = $3`,
      [guildId, userId, now]
    );

    const embed = new EmbedBuilder()
      .setTitle(`${message.author.username} went fishing! 🎣`)
      .setDescription(
        `You caught a **${caught.name}**!\nCoins Earned: **${points}**\nTotal Coins Earned: **${totalScore}**`
      )
      .setColor(6086089)
      .setTimestamp(new Date());

    await message.channel.send({ embeds: [embed] });
  },
};
