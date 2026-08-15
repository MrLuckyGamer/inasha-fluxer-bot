import { EmbedBuilder } from '@fluxerjs/core';

export default {
  name: 'invite',
  description: "Get the bot's invite link.",
  category: 'Utility',
  async execute(message, args, client) {
    const inviteUrl = 'https://web.fluxer.app/oauth2/authorize?client_id=1492077171327562990&scope=bot&permissions=268823606';

    const embed = new EmbedBuilder()
      .setTitle('Invite Me')
      .setDescription(`[Click here to invite me](${inviteUrl})`)
      .setColor(6086089)
      .setThumbnail(client.user.displayAvatarURL({ size: 512 }))
      .setTimestamp(new Date());

    await message.channel.send({ embeds: [embed] });
  },
};
