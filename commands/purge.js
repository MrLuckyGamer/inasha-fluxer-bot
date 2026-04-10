import { PermissionFlags } from '@fluxerjs/core';

export default {
  name: 'purge',
  description: 'Delete a number of messages from the channel.',
  category: 'Moderation',
  async execute(message, args, client) {
    const guild = client.guilds.get(message.guildId);
    const member = await guild?.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.ManageMessages))
      return message.reply("You don't have permission to manage messages.");

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0 || amount > 100)
      return message.reply('Please enter a number between **1 and 100**.');

    const channel = client.channels.get(message.channelId);
    if (!channel) return;

    try {
      // Fetch recent messages then bulk delete
      const msgs = await channel.messages.fetch(amount + 1);
      const ids = [...msgs.values()].map(m => m.id).slice(0, amount);
      await channel.bulkDeleteMessages(ids);

      const notice = await channel.send({ content: `Deleted **${ids.length}** messages.` });
      setTimeout(() => notice.delete?.().catch(() => {}), 3000);
    } catch (err) {
      console.error(err);
      await message.reply('Could not delete messages.');
    }
  },
};
