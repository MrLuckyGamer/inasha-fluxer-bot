import { EmbedBuilder } from '@fluxerjs/core';

export default {
  name: 'avatar',
  description: 'Show the avatar of yourself or another user.',
  category: 'Utility',
  async execute(message, args, client) {
    // Fluxer: message.mentions is an array of User objects
    let user = message.mentions?.[0] ?? null;

    if (!user && args.length > 0) {
      const name = args.join(' ').toLowerCase();
      const guild = client.guilds.get(message.guildId);
      const member = guild?.members?.find?.(m => m.user.username.toLowerCase().includes(name));
      user = member?.user ?? null;
    }

    if (!user) user = message.author;

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 1024 }))
      .setColor(6086089)
      .setFooter({ text: `Requested by ${message.author.username}` })
      .setTimestamp(new Date());

    await message.channel.send({ embeds: [embed] });
  },
};
