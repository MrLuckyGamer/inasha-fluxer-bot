import { EmbedBuilder } from '@fluxerjs/core';

export default {
  name: 'serverinfo',
  description: 'Show server information.',
  category: 'Utility',
  async execute(message, args, client) {
    const guild = client.guilds.get(message.guildId);
    if (!guild) return message.reply('This command can only be used in a server.');

    const createdTs = Math.floor(
      (Number(BigInt(guild.id) >> 22n) + 1420070400000) / 1000
    );

    const embed = new EmbedBuilder()
      .setTitle(`Server Info: ${guild.name}`)
      .setThumbnail(guild.iconURL?.({ dynamic: true }) ?? null)
      .addFields(
        { name: 'Owner',      value: `<@${guild.ownerId}>`,             inline: true },
        { name: 'Members',    value: `${guild.memberCount ?? '?'}`,      inline: true },
        { name: 'Boosts',     value: `${guild.premiumSubscriptionCount ?? 0}`, inline: true },
        { name: 'Created On', value: `<t:${createdTs}:D>`,              inline: true },
      )
      .setColor(6086089)
      .setTimestamp(new Date());

    await message.channel.send({ embeds: [embed] });
  },
};
