import { EmbedBuilder } from '@fluxerjs/core';

export default {
  name: 'userinfo',
  description: 'Display information about a user.',
  category: 'Utility',
  async execute(message, args, client) {
    const guild = client.guilds.get(message.guildId);
    const targetUser = message.mentions?.[0] ?? message.author;
    const member = guild ? await guild.members.resolve(targetUser.id) : null;

    const accountCreated = Math.floor(
      (Number(BigInt(targetUser.id) >> 22n) + 1420070400000) / 1000
    );
    const joinedServer = member?.joinedAt
      ? Math.floor(member.joinedAt.getTime() / 1000)
      : null;

    const roleNames = member
      ? [...(member.roles.roleIds ?? [])].map(id => `<@&${id}>`).join(', ') || 'None'
      : 'N/A';
    const roleCount = member?.roles.roleIds?.length ?? 0;

    const embed = new EmbedBuilder()
      .setColor(6086089)
      .setAuthor({ name: targetUser.username, iconURL: targetUser.displayAvatarURL() })
      .setThumbnail(targetUser.displayAvatarURL({ size: 512 }))
      .addFields(
        {
          name: '👤 User Information',
          value: `**ID:** ${targetUser.id}\n**Mention:** <@${targetUser.id}>\n**Bot:** ${targetUser.bot ? 'Yes' : 'No'}`,
          inline: false,
        },
        {
          name: '📅 Account Created',
          value: `<t:${accountCreated}:F>\n(<t:${accountCreated}:R>)`,
          inline: true,
        },
      )
      .setTimestamp(new Date())
      .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

    if (joinedServer) {
      embed.addFields({
        name: '📥 Joined Server',
        value: `<t:${joinedServer}:F>\n(<t:${joinedServer}:R>)`,
        inline: true,
      });
    }

    embed.addFields({
      name: `💼 Roles [${roleCount}]`,
      value: roleNames,
      inline: false,
    });

    await message.channel.send({ embeds: [embed] });
  },
};
