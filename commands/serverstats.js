import { PermissionFlags } from '@fluxerjs/core';
import { pool } from '../db.js';

// ── Update stat channel names ─────────────────────────────────────────────────
export async function updateStats(guild, client) {
  const { rows } = await pool.query(
    'SELECT users_id, bots_id, channels_id FROM serverstats WHERE guild_id=$1',
    [guild.id]
  );
  if (rows.length === 0) return;
  const cfg = rows[0];

  try {
    const members = await guild.members.fetch({ limit: 1000 }).catch(() => [...guild.members.values()]);
    const allMembers = members.length > 0 ? members : [...guild.members.values()];

    const bots  = allMembers.filter(m => m.user?.bot).length;
    const users = Math.max(0, allMembers.length - bots);

    await guild.fetchChannels().catch(() => {});
    const channels = guild.channels.size;

    const rename = async (id, name) => {
      const ch = guild.channels.get(id) ?? client?.channels?.get?.(id);
      if (ch?.edit) await ch.edit({ name }).catch(() => {});
    };

    await rename(cfg.users_id,    `👥 Users: ${users}`);
    await rename(cfg.bots_id,     `🤖 Bots: ${bots}`);
    await rename(cfg.channels_id, `💬 Channels: ${channels}`);
  } catch (err) {
    console.error(`Stats update error for ${guild.name}:`, err);
  }
}

// ── Command ───────────────────────────────────────────────────────────────────
export default {
  name: 'serverstats',
  description: 'Enable or disable server statistics channels.',
  category: 'Utility',
  async execute(message, args, client) {
    const guild = client.guilds.get(message.guildId);
    if (!guild) return;

    const member = await guild.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.ManageGuild))
      return message.reply('You need **Manage Server** permission to use this command.');

    const sub = args[0]?.toLowerCase();

    // ── ENABLE ────────────────────────────────────────────────────────────────
    if (sub === 'enable') {
      const { rows } = await pool.query(
        'SELECT 1 FROM serverstats WHERE guild_id=$1',
        [guild.id]
      );
      if (rows.length > 0) return message.reply('Stats are already enabled in this server.');

      const category = await guild.createChannel({ type: 4, name: '📊 Server Stats 📊' });

      const makeVoice = (name) =>
        guild.createChannel({
          type: 2,
          name,
          parent_id: category.id,
          permission_overwrites: [{ id: guild.id, type: 0, deny: '1048576' }],
        });

      const usersChannel    = await makeVoice('👥 Users: 0');
      const botsChannel     = await makeVoice('🤖 Bots: 0');
      const channelsChannel = await makeVoice('💬 Channels: 0');

      await guild.setChannelPositions([
        { id: category.id,        position: 0 },
        { id: usersChannel.id,    position: 0, parent_id: category.id },
        { id: botsChannel.id,     position: 1, parent_id: category.id },
        { id: channelsChannel.id, position: 2, parent_id: category.id },
      ]).catch(() => {});

      await pool.query(
        `INSERT INTO serverstats (guild_id, category_id, users_id, bots_id, channels_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [guild.id, category.id, usersChannel.id, botsChannel.id, channelsChannel.id]
      );

      await updateStats(guild, client);
      return message.reply('Server stats have been enabled! Stats will update shortly.');
    }

    // ── DISABLE ───────────────────────────────────────────────────────────────
    if (sub === 'disable') {
      const { rows } = await pool.query(
        'SELECT category_id, users_id, bots_id, channels_id FROM serverstats WHERE guild_id=$1',
        [guild.id]
      );
      if (rows.length === 0) return message.reply('Stats are not enabled in this server.');

      const cfg = rows[0];
      for (const id of [cfg.users_id, cfg.bots_id, cfg.channels_id, cfg.category_id]) {
        const ch = client.channels.get(id);
        if (ch?.delete) await ch.delete().catch(() => {});
      }

      await pool.query('DELETE FROM serverstats WHERE guild_id=$1', [guild.id]);
      return message.reply('Server stats have been disabled and removed.');
    }

    await message.reply('Usage: `i>serverstats enable` or `i>serverstats disable`');
  },
};
