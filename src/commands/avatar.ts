import { EmbedBuilder, type Client, type Message, type User } from '@fluxerjs/core';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'avatar',
  description: 'Show the avatar of yourself or another user.',
  category: 'Utility',
  async execute(message: Message, args: string[], client: Client) {
    // Fluxer: message.mentions is an array of User objects
    let user: User | null = message.mentions?.[0] ?? null;

    if (!user && args.length > 0 && message.guildId) {
      const name = args.join(' ').toLowerCase();
      const guild = client.guilds.get(message.guildId);
      const member = [...(guild?.members?.values() ?? [])].find((m) =>
        m.user.username.toLowerCase().includes(name)
      );
      user = member?.user ?? null;
    }

    if (!user) user = message.author;

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 1024 }))
      .setColor(6086089)
      .setFooter({ text: `Requested by ${message.author.username}` })
      .setTimestamp(new Date());

    await sendToChannel(message, { embeds: [embed] });
  },
};

export default command;
