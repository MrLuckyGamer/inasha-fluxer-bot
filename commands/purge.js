import { PermissionFlags, Routes } from '@fluxerjs/core';

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

    const channelId = message.channelId;
    const channel   = client.channels.get(channelId);
    if (!channel) return;

    try {
      // Fetch message list via REST — MessageManager.fetch(id) only looks up single IDs,
      // there is no list fetch in the SDK, so we call the route directly.
      const fetched = await client.rest.get(
        `${Routes.channelMessages(channelId)}?limit=${Math.min(amount + 1, 100)}`,
        { auth: true }
      );

      const ids = (Array.isArray(fetched) ? fetched : []).map(m => m.id);

      if (ids.length === 0)
        return message.reply('No messages found to delete.');

      // bulkDeleteMessages needs 2–100 IDs and messages < 14 days old
      if (ids.length >= 2) {
        try {
          await channel.bulkDeleteMessages(ids);
          const notice = await channel.send({ content: `Deleted **${ids.length}** messages.` });
          setTimeout(() => notice?.delete?.().catch(() => {}), 3000);
          return;
        } catch {
          // Bulk failed (e.g. old messages) — fall through to individual deletes
        }
      }

      // Individual delete fallback
      let deleted = 0;
      for (const id of ids) {
        await client.rest.delete(
          `${Routes.channelMessages(channelId)}/${id}`,
          { auth: true }
        ).catch(() => {});
        deleted++;
      }

      const notice = await channel.send({ content: `Deleted **${deleted}** messages.` });
      setTimeout(() => notice?.delete?.().catch(() => {}), 3000);
    } catch (err) {
      console.error('[purge]', err);
      await message.reply('Could not delete messages.').catch(() => {});
    }
  },
};
