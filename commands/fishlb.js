import { EmbedBuilder } from '@fluxerjs/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fishFile = path.join(__dirname, '../data/fish/fish.json');

const PAGE_SIZE = 10;

export default {
  name: 'fishlb',
  description: 'Show the top fishers in the server!',
  category: 'Fun',
  async execute(message, args, client) {
    const guildId = message.guildId;
    const fishData = fs.existsSync(fishFile) ? JSON.parse(fs.readFileSync(fishFile)) : {};

    if (!fishData[guildId] || Object.keys(fishData[guildId]).length === 0)
      return message.channel.send({ content: 'No fish caught yet in this server! 🎣' });

    const guild = client.guilds.get(guildId);
    const leaderboard = Object.entries(fishData[guildId])
      .map(([id, points]) => ({ id, points }))
      .sort((a, b) => b.points - a.points);

    const totalPages = Math.ceil(leaderboard.length / PAGE_SIZE);
    let currentPage = 0;

    function buildEmbed(page) {
      const start   = page * PAGE_SIZE;
      const entries = leaderboard.slice(start, start + PAGE_SIZE);
      const desc = entries.map(({ id, points }, i) => {
        const member = guild?.members?.get?.(id);
        const name   = member?.user?.username ?? `<@${id}>`;
        return `**${start + i + 1}. ${name}** — ${points} coins`;
      }).join('\n');

      return new EmbedBuilder()
        .setTitle(`🎣 Fish Leaderboard — ${guild?.name ?? 'Server'}`)
        .setDescription(desc || 'No entries on this page.')
        .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
        .setColor(6086089)
        .setTimestamp(new Date());
    }

    // Send first page (pagination requires button support; Fluxer may differ from discord.js)
    await message.channel.send({ embeds: [buildEmbed(currentPage)] });

    // Note: Interactive pagination buttons are not implemented here as Fluxer's
    // component/collector API may differ. Use i>fishlb with args for future pages
    // if the platform supports button components.
  },
};
