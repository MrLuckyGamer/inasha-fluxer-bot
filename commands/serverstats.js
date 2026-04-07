import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    const memberCount = guild.memberCount ?? 0;

    // Try to count bots from cached members; skip heavy fetch if not needed
    const cachedBots  = [...(guild.members?.values?.() ?? [])].filter(m => m.user?.bot).length;
    const bots        = cachedBots;
    const users       = Math.max(0, memberCount - bots);
    const channels    = [...(client?.channels?.values?.() ?? [])]
      .filter(c => c.guildId === guild.id).length;

    const rename = async (id, name) => {
      const ch = client?.channels?.get?.(id);
      if (ch?.setName) await ch.setName(name).catch(() => {});
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
    if (!member?.permissions.has('ManageGuild'))
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
          permission_overwrites: [{ id: guild.id, type: 0, deny: '1048576' }], // deny Connect
        });

      const usersChannel    = await makeVoice('👥 Users: 0');
      const botsChannel     = await makeVoice('🤖 Bots: 0');
      const channelsChannel = await makeVoice('💬 Channels: 0');

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
