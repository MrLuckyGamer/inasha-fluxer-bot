import { EmbedBuilder, PermissionFlags } from '@fluxerjs/core';
import { pool } from '../db.js';

function renderDate(ts) {
  if (!ts) return 'Unknown date';
  return `<t:${ts}:f>`;
}

export default {
  name: 'warn',
  description: 'Warn, view, or delete warnings for users.',
  category: 'Moderation',
  usage: '<@user> <reason> | view <@user> | delete <@user> <warnID>',
  async execute(message, args, client) {
    const guild  = client.guilds.get(message.guildId);
    const member = await guild?.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.ManageMessages))
      return message.reply('You need **Manage Messages** permission to use this command.');

    if (!args.length)
      return message.reply('Usage: `i>warn <@user> <reason>` | `i>warn view <@user>` | `i>warn delete <@user> <warnID>`');

    const guildId = message.guildId;
    const sub     = args[0].toLowerCase();

    // ── VIEW ──────────────────────────────────────────────────────────────────
    if (sub === 'view') {
      const target = message.mentions?.[0];
      if (!target) return message.reply('Please mention a user to view their warnings.');

      const { rows } = await pool.query(
        `SELECT id, moderator_tag, reason, warned_at
         FROM warnings
         WHERE guild_id=$1 AND user_id=$2
         ORDER BY warned_at ASC`,
        [guildId, target.id]
      );

      if (rows.length === 0) return message.reply(`${target.username} has no warnings.`);

      const embed = new EmbedBuilder()
        .setTitle(`Warnings for ${target.username}`)
        .setColor('Orange')
        .setDescription(
          rows.map((w, i) =>
            `**#${i + 1}** (ID: ${w.id}) — by ${w.moderator_tag}\n**Reason:** ${w.reason}\n*${renderDate(w.warned_at)}*`
          ).join('\n\n')
        )
        .setTimestamp(new Date());

      return message.channel.send({ embeds: [embed] });
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    if (sub === 'delete') {
      const target = message.mentions?.[0];
      if (!target) return message.reply('Please mention a user to delete their warning.');

      const warnId = parseInt(args[2]);
      if (isNaN(warnId)) return message.reply('Please specify a valid warning ID to delete.');

      const { rowCount, rows } = await pool.query(
        `DELETE FROM warnings
         WHERE id=$1 AND guild_id=$2 AND user_id=$3
         RETURNING reason, warned_at`,
        [warnId, guildId, target.id]
      );

      if (rowCount === 0) return message.reply('That warning was not found for this user.');

      return message.reply(
        `Removed warning #${warnId} for ${target.username} (Reason: ${rows[0].reason}) — ${renderDate(rows[0].warned_at)}.`
      );
    }

    // ── ADD WARNING ───────────────────────────────────────────────────────────
    const target = message.mentions?.[0];
    if (!target) return message.reply('Please mention a user to warn.');

    const reason = args.slice(1).join(' ');
    if (!reason) return message.reply('Please provide a reason for the warning.');

    const warnedAt = Math.floor(Date.now() / 1000);

    const { rows: inserted } = await pool.query(
      `INSERT INTO warnings (guild_id, user_id, moderator_id, moderator_tag, reason, warned_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [guildId, target.id, message.author.id, message.author.username, reason, warnedAt]
    );

    const embed = new EmbedBuilder()
      .setTitle('User Warned')
      .setColor('Orange')
      .addFields(
        { name: 'User',      value: target.username,         inline: true },
        { name: 'Warned By', value: message.author.username, inline: true },
        { name: 'Reason',    value: reason },
        { name: 'When',      value: renderDate(warnedAt),    inline: true },
        { name: 'Warn ID',   value: String(inserted[0].id),  inline: true },
      )
      .setTimestamp(new Date());

    await message.channel.send({ embeds: [embed] });
  },
};
