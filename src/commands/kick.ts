import { PermissionFlags, type Client, type Message } from '@fluxerjs/core';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'kick',
  description: 'Kick a user from the server.',
  category: 'Moderation',
  async execute(message: Message, args: string[], client: Client) {
    if (!message.guildId) return;
    const guild = client.guilds.get(message.guildId);
    if (!guild) return;

    const member = await guild.members.resolve(message.author.id);
    if (!member?.permissions.has(PermissionFlags.KickMembers))
      return message.reply("You don't have permission to kick members.");

    const target = message.mentions?.[0];
    if (!target) return message.reply('You must mention a user to kick.');

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      // Note: the Fluxer API's kick() doesn't take a reason param directly;
      // we still surface it in the confirmation message for moderation logs.
      await guild.kick(target.id);
      await sendToChannel(message, { content: `Kicked **${target.username}** | Reason: *${reason}*` });
    } catch (err) {
      console.error(err);
      await message.reply('I was unable to kick that user.');
    }
  },
};

export default command;
