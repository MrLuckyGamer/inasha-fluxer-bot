import { EmbedBuilder } from '@fluxerjs/core';
import { pool } from '../db.js';

export default {
  name: 'family',
  description: 'Manage & view family tree (add/remove, parent/child).',
  category: 'Fun',
  async execute(message, args) {
    const guildId = message.guildId;
    const userId  = message.author.id;

    const sub      = args[0]?.toLowerCase();
    const relation = args[1]?.toLowerCase();
    const target   = message.mentions?.[0];

    // ── SHOW OWN TREE ─────────────────────────────────────────────────────────
    if (!sub) {
      const { rows } = await pool.query(
        `SELECT target_id, relation FROM family WHERE guild_id=$1 AND user_id=$2`,
        [guildId, userId]
      );

      const parents  = rows.filter(r => r.relation === 'parent').map(r => `<@${r.target_id}>`);
      const children = rows.filter(r => r.relation === 'child').map(r => `<@${r.target_id}>`);

      // Siblings: users who share at least one parent with me
      const parentIds = rows.filter(r => r.relation === 'parent').map(r => r.target_id);
      let siblings = [];
      if (parentIds.length > 0) {
        const { rows: sibRows } = await pool.query(
          `SELECT DISTINCT user_id FROM family
           WHERE guild_id=$1 AND relation='parent' AND target_id=ANY($2) AND user_id<>$3`,
          [guildId, parentIds, userId]
        );
        siblings = sibRows.map(r => `<@${r.user_id}>`);
      }

      const embed = new EmbedBuilder()
        .setTitle(`${message.author.username}'s Family Tree`)
        .addFields(
          { name: '👨‍👩‍👧 Parents',  value: parents.join('\n')  || 'None' },
          { name: '🧑‍🤝‍🧑 Siblings', value: siblings.join('\n') || 'None' },
          { name: '👶 Children',  value: children.join('\n') || 'None' },
        )
        .setColor(6086089)
        .setTimestamp(new Date())
        .setFooter({ text: 'Family Tree System' });

      return message.channel.send({ embeds: [embed] });
    }

    if (!target) return message.reply('You must mention a user for this command.');

    // ── ADD ───────────────────────────────────────────────────────────────────
    if (sub === 'add') {
      if (relation !== 'parent' && relation !== 'child')
        return message.reply('Usage: `i>family add parent|child @user`');

      const inverse = relation === 'parent' ? 'child' : 'parent';

      // Insert both sides (ignore conflicts)
      await pool.query(
        `INSERT INTO family (guild_id, user_id, target_id, relation)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [guildId, userId, target.id, relation]
      );
      await pool.query(
        `INSERT INTO family (guild_id, user_id, target_id, relation)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [guildId, target.id, userId, inverse]
      );

      return message.reply(`✅ Added <@${target.id}> as your ${relation}.`);
    }

    // ── REMOVE ────────────────────────────────────────────────────────────────
    if (sub === 'remove') {
      if (relation !== 'parent' && relation !== 'child')
        return message.reply('Usage: `i>family remove parent|child @user`');

      const inverse = relation === 'parent' ? 'child' : 'parent';

      await pool.query(
        `DELETE FROM family WHERE guild_id=$1 AND user_id=$2 AND target_id=$3 AND relation=$4`,
        [guildId, userId, target.id, relation]
      );
      await pool.query(
        `DELETE FROM family WHERE guild_id=$1 AND user_id=$2 AND target_id=$3 AND relation=$4`,
        [guildId, target.id, userId, inverse]
      );

      return message.reply(`✅ Removed <@${target.id}> as your ${relation}.`);
    }

    await message.reply('Invalid command. Usage: `i>family`, `i>family add/remove parent|child @user`');
  },
};
