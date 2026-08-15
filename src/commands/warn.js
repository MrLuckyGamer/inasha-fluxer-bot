import { EmbedBuilder, PermissionFlags } from '@fluxerjs/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WARN_FILE = path.join(__dirname, '../../data/warns/warns.json');

if (!fs.existsSync(path.dirname(WARN_FILE))) {
  fs.mkdirSync(path.dirname(WARN_FILE), { recursive: true });
}
if (!fs.existsSync(WARN_FILE)) {
  fs.writeFileSync(WARN_FILE, '{}');
}

function loadWarns() {
  return JSON.parse(fs.readFileSync(WARN_FILE, 'utf8'));
}

function saveWarns(data) {
  fs.writeFileSync(WARN_FILE, JSON.stringify(data, null, 2));
}

function renderDate(d) {
  if (!d) return 'Unknown date';
  if (typeof d === 'number') return `<t:${d}:f>`;
  return `\`${d}\``;
}

export default {
  name: 'warn',
  description: 'Warn, view, or delete warnings for users.',
  category: 'Moderation',
  usage: '<@user> <reason> | view <@user> | delete <@user> <warnID>',
  async execute(message, args, client) {
    const guild = client.guilds.get(message.guildId);
    const member = await guild?.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.ManageMessages))
      return message.reply('You need **Manage Messages** permission to use this command.');

    if (!args.length)
      return message.reply('Usage: `i>warn <@user> <reason>` | `i>warn view <@user>` | `i>warn delete <@user> <warnID>`');

    const warns = loadWarns();
    const guildId = message.guildId;
    if (!warns[guildId]) warns[guildId] = {};

    const sub = args[0].toLowerCase();

    if (sub === 'view') {
      const target = message.mentions?.[0];
      if (!target) return message.reply('Please mention a user to view their warnings.');

      const userWarns = warns[guildId][target.id] || [];
      if (userWarns.length === 0) return message.reply(`${target.username} has no warnings.`);

      const embed = new EmbedBuilder()
        .setTitle(`Warnings for ${target.username}`)
        .setColor('#FFA500')
        .setDescription(
          userWarns.map((w, i) =>
            `**#${i + 1}** — by ${w.moderatorTag}\n**Reason:** ${w.reason}\n*${renderDate(w.date)}*`
          ).join('\n\n')
        )
        .setTimestamp(new Date());

      return message.channel.send({ embeds: [embed] });
    }

    if (sub === 'delete') {
      const target = message.mentions?.[0];
      if (!target) return message.reply('Please mention a user to delete their warning.');

      const index = parseInt(args[2]);
      if (isNaN(index)) return message.reply('Please specify a valid warning number to delete.');

      const userWarns = warns[guildId][target.id] || [];
      if (index < 1 || index > userWarns.length)
        return message.reply('That warning number does not exist.');

      const removed = userWarns.splice(index - 1, 1);
      warns[guildId][target.id] = userWarns;
      saveWarns(warns);

      return message.reply(
        `Removed warning #${index} for ${target.username} (Reason: ${removed[0].reason}) — ${renderDate(removed[0].date)}.`
      );
    }

    // Default: add a warning
    const target = message.mentions?.[0];
    if (!target) return message.reply('Please mention a user to warn.');

    const reason = args.slice(1).join(' ');
    if (!reason) return message.reply('Please provide a reason for the warning.');

    if (!warns[guildId][target.id]) warns[guildId][target.id] = [];

    const warnEntry = {
      moderatorId: message.author.id,
      moderatorTag: message.author.username,
      reason,
      date: Math.floor(Date.now() / 1000),
    };

    warns[guildId][target.id].push(warnEntry);
    saveWarns(warns);

    const embed = new EmbedBuilder()
      .setTitle('User Warned')
      .setColor('#FFA500')
      .addFields(
        { name: 'User',      value: target.username,          inline: true },
        { name: 'Warned By', value: message.author.username,  inline: true },
        { name: 'Reason',    value: reason },
        { name: 'When',      value: renderDate(warnEntry.date), inline: true },
      )
      .setTimestamp(new Date());

    await message.channel.send({ embeds: [embed] });
  },
};
