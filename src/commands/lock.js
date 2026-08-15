import { PermissionFlags } from '@fluxerjs/core';

export default {
  name: 'lock',
  description: 'Lock the current channel.',
  category: 'Moderation',
  async execute(message, args, client) {
    const guild = client.guilds.get(message.guildId);
    const member = await guild?.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.ManageChannels))
      return message.reply('You need **Manage Channels** permission.');

    const channel = client.channels.get(message.channelId);
    if (!channel) return;

    try {
      // type 0 = role overwrite; deny ViewChannel (bitfield "1024") for @everyone (guild id)
      await channel.editPermission(message.guildId, {
        type: 0,
        deny: '1024', // ViewChannel
      });
      await message.reply('Channel locked! 🔒');
    } catch (err) {
      console.error(err);
      await message.reply('Failed to lock the channel.');
    }
  },
};
