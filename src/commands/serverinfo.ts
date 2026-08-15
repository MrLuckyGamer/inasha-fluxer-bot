import { EmbedBuilder, type Client, type Message } from '@fluxerjs/core';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'serverinfo',
  description: 'Show server information.',
  category: 'Utility',
  async execute(message: Message, args: string[], client: Client) {
    if (!message.guildId) return message.reply('This command can only be used in a server.');
    const guild = client.guilds.get(message.guildId);
    if (!guild) return message.reply('This command can only be used in a server.');

    const createdTs = Math.floor(
      (Number(BigInt(guild.id) >> 22n) + 1420070400000) / 1000
    );

    // Fluxer guilds don't currently expose a boost/premium subscription count.
    const boosts = (guild as unknown as { premiumSubscriptionCount?: number }).premiumSubscriptionCount ?? 0;

    const embed = new EmbedBuilder()
      .setTitle(`Server Info: ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 512 }))
      .addFields(
        { name: 'Owner',      value: `<@${guild.ownerId}>`,             inline: true },
        { name: 'Members',    value: `${guild.memberCount ?? '?'}`,      inline: true },
        { name: 'Boosts',     value: `${boosts}`,                       inline: true },
        { name: 'Created On', value: `<t:${createdTs}:D>`,              inline: true },
      )
      .setColor(6086089)
      .setTimestamp(new Date());

    await sendToChannel(message, { embeds: [embed] });
  },
};

export default command;
