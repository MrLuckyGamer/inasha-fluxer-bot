import { EmbedBuilder } from '@fluxerjs/core';
import { pool } from '../db.js';

const PAGE_SIZE = 10;

export default {
  name: 'fishlb',
  description: 'Show the top fishers in the server!',
  category: 'Fun',
  async execute(message, args, client) {
    const guildId = message.guildId;

    const { rows } = await pool.query(
      `SELECT user_id, score
       FROM fish_scores
       WHERE guild_id = $1
       ORDER BY score DESC`,
      [guildId]
    );

    if (rows.length === 0)
      return message.channel.send({ content: 'No fish caught yet in this server! 🎣' });

    const guild      = client.guilds.get(guildId);
    const page       = Math.max(0, (parseInt(args[0]) || 1) - 1);
    const totalPages = Math.ceil(rows.length / PAGE_SIZE);
    const currentPage = Math.min(page, totalPages - 1);

    const start   = currentPage * PAGE_SIZE;
    const entries = rows.slice(start, start + PAGE_SIZE);

    const desc = entries.map(({ user_id, score }, i) => {
      const member = guild?.members?.get?.(user_id);
      const name   = member?.user?.username ?? `<@${user_id}>`;
      return `**${start + i + 1}. ${name}** — ${score} coins`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`🎣 Fish Leaderboard — ${guild?.name ?? 'Server'}`)
      .setDescription(desc || 'No entries on this page.')
      .setFooter({ text: `Page ${currentPage + 1} of ${totalPages} • Use i>fishlb <page> to navigate` })
      .setColor(6086089)
      .setTimestamp(new Date());

    await message.channel.send({ embeds: [embed] });
  },
};
