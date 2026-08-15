import { PermissionFlags, type Client, type GuildChannel, type Message } from '@fluxerjs/core';
import type { Command } from '../types.js';

const command: Command = {
  name: 'unlock',
  description: 'Unlock the current channel.',
  category: 'Moderation',
  async execute(message: Message, args: string[], client: Client) {
    if (!message.guildId) return;
    const guild = client.guilds.get(message.guildId);
    const member = await guild?.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.ManageChannels))
      return message.reply('You need **Manage Channels** permission.');

    const channel = client.channels.get(message.channelId);
    if (!channel || !('deletePermission' in channel)) return;

    try {
      // Remove the overwrite (restoring default ViewChannel access)
      await (channel as GuildChannel).deletePermission(message.guildId);
      await message.reply('Channel unlocked! 🔓');
    } catch (err) {
      console.error(err);
      await message.reply('Failed to unlock the channel.');
    }
  },
};

export default command;
