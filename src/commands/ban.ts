import { PermissionFlags, type Client, type Message } from '@fluxerjs/core';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'ban',
  description: 'Ban a user from the server.',
  category: 'Moderation',
  async execute(message: Message, args: string[], client: Client) {
    if (!message.guildId) return;
    const guild = client.guilds.get(message.guildId);
    if (!guild) return;

    const member = await guild.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.BanMembers))
      return message.reply("You don't have permission to ban members.");

    const target = message.mentions?.[0];
    if (!target) return message.reply('You must mention a user to ban.');

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await guild.ban(target.id, { reason });
      await sendToChannel(message, { content: `Banned **${target.username}** | Reason: *${reason}*` });
    } catch (err) {
      console.error(err);
      await message.reply('I was unable to ban that user.');
    }
  },
};

export default command;
