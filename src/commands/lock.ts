import { OverwriteType, PermissionFlags, type Client, type GuildChannel, type Message } from '@fluxerjs/core';
import type { Command } from '../types.js';

const command: Command = {
  name: 'lock',
  description: 'Lock the current channel.',
  category: 'Moderation',
  async execute(message: Message, args: string[], client: Client) {
    if (!message.guildId) return;
    const guild = client.guilds.get(message.guildId);
    const member = await guild?.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.ManageChannels))
      return message.reply('You need **Manage Channels** permission.');

    const channel = client.channels.get(message.channelId);
    if (!channel || !('editPermission' in channel)) return;

    try {
      // deny ViewChannel (bitfield "1024") for @everyone (guild id) role overwrite
      await (channel as GuildChannel).editPermission(message.guildId, {
        type: OverwriteType.Role,
        deny: '1024', // ViewChannel
      });
      await message.reply('Channel locked! 🔒');
    } catch (err) {
      console.error(err);
      await message.reply('Failed to lock the channel.');
    }
  },
};

export default command;
