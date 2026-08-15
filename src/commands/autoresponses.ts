import { PermissionFlags, type Client, type Message } from '@fluxerjs/core';
import { autoresponses } from '../autoresponses/index.js';
import { isEnabled, setEnabled } from '../autoresponses/store.js';
import type { Command } from '../types.js';

const command: Command = {
  name: 'autoresponse',
  aliases: ['ar', 'autoreply'],
  description: 'Enable or disable the cat/dog chat auto-replies for this server.',
  category: 'Utility',
  async execute(message: Message, args: string[], client: Client) {
    if (!message.guildId) return message.reply('This command can only be used in a server.');
    const guild = client.guilds.get(message.guildId);
    if (!guild) return message.reply('This command can only be used in a server.');

    const member = await guild.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.ManageGuild)) {
      return message.reply('You need **Manage Server** permission to use this command.');
    }

    const type = args[0]?.toLowerCase();

    // ── STATUS (no args, or `status`) ────────────────────────────────────────
    if (!type || type === 'status') {
      const lines = Object.entries(autoresponses).map(([key, cfg]) => {
        const enabled = isEnabled(guild.id, key);
        return `${cfg.emoji} **${cfg.label}** — ${enabled ? 'enabled ✅' : 'disabled ❌'}`;
      });
      const types = Object.keys(autoresponses).join('|');
      return message.reply(
        `**Auto-response status:**\n${lines.join('\n')}\n\nUsage: \`autoresponse <${types}> <on|off>\``
      );
    }

    if (!autoresponses[type]) {
      const types = Object.keys(autoresponses).join(', ');
      return message.reply(`Unknown auto-response type \`${type}\`. Valid types: ${types}.`);
    }

    const action = args[1]?.toLowerCase();
    if (!action || !['on', 'off', 'enable', 'disable'].includes(action)) {
      return message.reply(`Usage: \`autoresponse ${type} <on|off>\``);
    }

    const enabled = action === 'on' || action === 'enable';
    setEnabled(guild.id, type, enabled);

    const { emoji, label } = autoresponses[type];
    return message.reply(`${emoji} **${label}** are now **${enabled ? 'enabled' : 'disabled'}** in this server.`);
  },
};

export default command;
