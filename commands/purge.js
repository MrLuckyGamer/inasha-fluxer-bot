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
      // Fetch recent messages — amount+1 so we can include the command message itself
      const messages = await channel.messages.fetch({ limit: amount + 1 });
      const msgArray = Array.isArray(messages) ? messages : [...messages.values()];
      const toDelete = msgArray.slice(0, amount + 1);
      const ids = toDelete.map(m => m.id);

      let deleted = 0;

      // Try bulk delete first (requires messages < 14 days old)
      if (channel.bulkDeleteMessages) {
        try {
          await channel.bulkDeleteMessages(ids);
          deleted = ids.length;
        } catch {
          // Bulk failed (e.g. messages too old) — fall through to individual deletes
        }
      }

      // Fall back to deleting one by one
      if (deleted === 0) {
        for (const msg of toDelete) {
          await msg.delete().catch(() => {});
          deleted++;
        }
      }

      const notice = await channel.send({ content: `Deleted **${deleted}** messages.` });
      setTimeout(() => notice.delete?.().catch(() => {}), 3000);
    } catch (err) {
      console.error(err);
      await message.reply('Could not delete messages.').catch(() => {});
    }
  },
};
