import { EmbedBuilder } from '@fluxerjs/core';

export default {
  name: 'invite',
  description: "Get the bot's invite link.",
  category: 'Utility',
  async execute(message, args, client) {
    const inviteUrl = 'https://fluxer.app'; // Update with your bot's actual invite URL

    const embed = new EmbedBuilder()
      .setTitle('Invite Me')
      .setDescription(`[Click here to invite me](${inviteUrl})`)
      .setColor(6086089)
      .setThumbnail(client.user.displayAvatarURL({ size: 512 }))
      .setTimestamp(new Date());

    await message.channel.send({ embeds: [embed] });
  },
};
