export default {
  name: 'unlock',
  description: 'Unlock the current channel.',
  category: 'Moderation',
  async execute(message, args, client) {
    const guild = client.guilds.get(message.guildId);
    const member = await guild?.members.resolve(message.author.id);
    if (!member?.permissions.has('ManageChannels'))
      return message.reply('You need **Manage Channels** permission.');

    const channel = client.channels.get(message.channelId);
    if (!channel) return;

    try {
      // Remove the overwrite (restoring default ViewChannel access)
      await channel.deletePermission(message.guildId);
      await message.reply('Channel unlocked! 🔓');
    } catch (err) {
      console.error(err);
      await message.reply('Failed to unlock the channel.');
    }
  },
};
