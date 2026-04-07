import { EmbedBuilder } from '@fluxerjs/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '../data/familytree/family.json');

if (!fs.existsSync(path.dirname(FILE))) fs.mkdirSync(path.dirname(FILE), { recursive: true });
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '{}');

function load() { return JSON.parse(fs.readFileSync(FILE)); }
function save(data) { fs.writeFileSync(FILE, JSON.stringify(data, null, 2)); }

function ensureUser(data, guildId, userId) {
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = { parents: [], children: [] };
}

export default {
  name: 'family',
  description: 'Manage & view family tree (add/remove, parent/child).',
  category: 'Fun',
  async execute(message, args) {
    const guildId = message.guildId;
    const userId  = message.author.id;
    const data    = load();

    ensureUser(data, guildId, userId);

    const sub      = args[0]?.toLowerCase();
    const relation = args[1]?.toLowerCase();
    const target   = message.mentions?.[0];

    // Show own family tree
    if (!sub) {
      const family   = data[guildId][userId];
      const parents  = family.parents.length  ? family.parents.map(id => `<@${id}>`).join('\n')  : 'None';
      const children = family.children.length ? family.children.map(id => `<@${id}>`).join('\n') : 'None';

      const siblings = Object.entries(data[guildId])
        .filter(([uid, info]) => uid !== userId && info.parents.some(p => family.parents.includes(p)))
        .map(([uid]) => `<@${uid}>`);
      const siblingsStr = siblings.length ? siblings.join('\n') : 'None';

      const embed = new EmbedBuilder()
        .setTitle(`${message.author.username}'s Family Tree`)
        .addFields(
          { name: '👨‍👩‍👧 Parents',       value: parents   },
          { name: '🧑‍🤝‍🧑 Siblings',      value: siblingsStr },
          { name: '👶 Children',       value: children  },
        )
        .setColor(6086089)
        .setTimestamp(new Date())
        .setFooter({ text: 'Family Tree System' });

      return message.channel.send({ embeds: [embed] });
    }

    if (!target) return message.reply('You must mention a user for this command.');

    ensureUser(data, guildId, target.id);
    const targetData = data[guildId][target.id];
    const userData   = data[guildId][userId];

    if (sub === 'add') {
      if (relation === 'parent') {
        if (!userData.parents.includes(target.id))    userData.parents.push(target.id);
        if (!targetData.children.includes(userId))    targetData.children.push(userId);
        save(data);
        return message.reply(`✅ Added <@${target.id}> as your parent.`);
      }
      if (relation === 'child') {
        if (!userData.children.includes(target.id))   userData.children.push(target.id);
        if (!targetData.parents.includes(userId))     targetData.parents.push(userId);
        save(data);
        return message.reply(`✅ Added <@${target.id}> as your child.`);
      }
      return message.reply('Usage: `i>family add parent|child @user`');
    }

    if (sub === 'remove') {
      if (relation === 'parent') {
        userData.parents     = userData.parents.filter(id => id !== target.id);
        targetData.children  = targetData.children.filter(id => id !== userId);
        save(data);
        return message.reply(`✅ Removed <@${target.id}> as your parent.`);
      }
      if (relation === 'child') {
        userData.children    = userData.children.filter(id => id !== target.id);
        targetData.parents   = targetData.parents.filter(id => id !== userId);
        save(data);
        return message.reply(`✅ Removed <@${target.id}> as your child.`);
      }
      return message.reply('Usage: `i>family remove parent|child @user`');
    }

    await message.reply('Invalid command. Usage: `i>family`, `i>family add/remove parent|child @user`');
  },
};
