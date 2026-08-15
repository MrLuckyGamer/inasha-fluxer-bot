import { PermissionFlags, Routes, type Client, type Message, type TextChannel } from '@fluxerjs/core';
import type { Command } from '../types.js';

interface RawMessage {
  id: string;
}

const command: Command = {
  name: 'purge',
  description: 'Delete a number of messages from the channel.',
  category: 'Moderation',
  async execute(message: Message, args: string[], client: Client) {
    if (!message.guildId) return;
    const guild = client.guilds.get(message.guildId);
    const member = await guild?.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.ManageMessages))
      return message.reply("You don't have permission to manage messages.");

    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount <= 0 || amount > 100)
      return message.reply('Please enter a number between **1 and 100**.');

    const rawChannel = client.channels.get(message.channelId);
    if (!rawChannel || !('bulkDelete' in rawChannel) || !('send' in rawChannel)) return;
    const channel = rawChannel as TextChannel;

    try {
      // Fetch recent messages via REST (limit includes the command message itself)
      const data = (await client.rest.get(
        `${Routes.channelMessages(message.channelId)}?limit=${amount + 1}`
      )) as RawMessage[];
      const ids = data.map((m) => m.id).slice(0, amount);
      await channel.bulkDelete(ids);

      const notice = await channel.send({ content: `Deleted **${ids.length}** messages.` });
      setTimeout(() => notice.delete?.().catch(() => {}), 3000);
    } catch (err) {
      console.error(err);
      await message.reply('Could not delete messages.');
    }
  },
};

export default command;
