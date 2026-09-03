import { PermissionFlags, type Client, type Message } from '@fluxerjs/core';
import { getCounting, enableCounting, disableCounting } from '../counting/store.js';
import type { Command } from '../types.js';

const command: Command = {
  name: 'counting',
  aliases: ['count'],
  description: 'Enable or disable the counting game in this channel.',
  category: 'Utility',
  usage: 'counting <enable|disable|status>',
  async execute(message: Message, args: string[], client: Client) {
    if (!message.guildId) return message.reply('This command can only be used in a server.');
    const guild = client.guilds.get(message.guildId);
    if (!guild) return message.reply('This command can only be used in a server.');

    const member = await guild.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.ManageGuild)) {
      return message.reply('You need **Manage Server** permission to use this command.');
    }

    const action = args[0]?.toLowerCase();
    const state = getCounting(guild.id);

    // ── STATUS (no args, or `status`) ────────────────────────────────────────
    if (!action || action === 'status') {
      if (!state) {
        return message.reply(
          `🔢 Counting is currently **disabled** in this server.\n\nUsage: \`counting enable\` in the channel you want to use.`
        );
      }
      return message.reply(
        `🔢 Counting is **enabled** in <#${state.channelId}>.\n` +
          `Current count: **${state.count}** — next number is **${state.count + 1}**.`
      );
    }

    // ── ENABLE ───────────────────────────────────────────────────────────────
    if (action === 'enable' || action === 'on') {
      enableCounting(guild.id, message.channelId);
      return message.reply(
        `🔢 Counting game **enabled** in this channel! Start counting from **1**.`
      );
    }

    // ── DISABLE ──────────────────────────────────────────────────────────────
    if (action === 'disable' || action === 'off') {
      if (!state) return message.reply('Counting is already disabled in this server.');
      disableCounting(guild.id);
      return message.reply('🔢 Counting game **disabled**.');
    }

    return message.reply(`Usage: \`counting <enable|disable|status>\``);
  },
};

export default command;
