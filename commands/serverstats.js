import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PermissionFlags } from '@fluxerjs/core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '../data/serverstats/serverstats.json');

if (!fs.existsSync(path.dirname(FILE))) fs.mkdirSync(path.dirname(FILE), { recursive: true });
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '{}');

function loadStats() { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
function saveStats(data) { fs.writeFileSync(FILE, JSON.stringify(data, null, 2)); }

// ── Update stat channel names ─────────────────────────────────────────────────
export async function updateStats(guild, client) {
  const data = loadStats();
  const cfg  = data[guild.id];
  if (!cfg) return;

  try {
    // Fetch all members so we get an accurate count (guild.memberCount is null on Fluxer)
    const members = await guild.members.fetch({ limit: 1000 }).catch(() => [...guild.members.values()]);
    const allMembers = members.length > 0 ? members : [...guild.members.values()];

    const bots  = allMembers.filter(m => m.user?.bot).length;
    const users = Math.max(0, allMembers.length - bots);

    // Fetch channels so guild.channels is populated
    await guild.fetchChannels().catch(() => {});
    const channels = guild.channels.size;

    // Rename stat channels using .edit({ name }) — Fluxer has no .setName()
    const rename = async (id, name) => {
      const ch = guild.channels.get(id) ?? client?.channels?.get?.(id);
      if (ch?.edit) await ch.edit({ name }).catch(() => {});
    };

    await rename(cfg.users,    `👥 Users: ${users}`);
    await rename(cfg.bots,     `🤖 Bots: ${bots}`);
    await rename(cfg.channels, `💬 Channels: ${channels}`);
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
    const guild  = client.guilds.get(message.guildId);
    if (!guild) return;

    const member = await guild.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.ManageGuild))
      return message.reply('You need **Manage Server** permission to use this command.');

    const data = loadStats();
    const sub  = args[0]?.toLowerCase();

    // ── ENABLE ────────────────────────────────────────────────────────────────
    if (sub === 'enable') {
      if (data[guild.id]) return message.reply('Stats are already enabled in this server.');

      // Create category
      const category = await guild.createChannel({ type: 4, name: '📊 Server Stats 📊' });

      const makeVoice = async (name) =>
        guild.createChannel({
          type: 2,
          name,
          parent_id: category.id,
          permission_overwrites: [{
            id: guild.id,
            type: 0,
            allow: '0',
            deny: PermissionFlags.Connect.toString(),
          }],
        });

      const usersChannel    = await makeVoice('👥 Users: 0');
      const botsChannel     = await makeVoice('🤖 Bots: 0');
      const channelsChannel = await makeVoice('💬 Channels: 0');

      // Move the category (and its children) to the very top of the server
      await guild.setChannelPositions([
        { id: category.id,       position: 0 },
        { id: usersChannel.id,   position: 0, parentId: category.id },
        { id: botsChannel.id,    position: 1, parentId: category.id },
        { id: channelsChannel.id, position: 2, parentId: category.id },
      ]).catch(() => {});

      data[guild.id] = {
        category: category.id,
        users:    usersChannel.id,
        bots:     botsChannel.id,
        channels: channelsChannel.id,
      };
      saveStats(data);

      await updateStats(guild, client);
      return message.reply('Server stats have been enabled! Stats will update shortly.');
    }

    // ── DISABLE ───────────────────────────────────────────────────────────────
    if (sub === 'disable') {
      const cfg = data[guild.id];
      if (!cfg) return message.reply('Stats are not enabled in this server.');

      for (const key of ['users', 'bots', 'channels', 'category']) {
        const ch = client.channels.get(cfg[key]);
        if (ch?.delete) await ch.delete().catch(() => {});
      }

      delete data[guild.id];
      saveStats(data);
      return message.reply('Server stats have been disabled and removed.');
    }

    await message.reply('Usage: `i>serverstats enable` or `i>serverstats disable`');
  },
};
