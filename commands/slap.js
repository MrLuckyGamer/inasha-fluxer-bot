import { EmbedBuilder } from '@fluxerjs/core';
import { fetchReactionGif } from '../otakuGifs.js';

export default {
  name: 'slap',
  description: 'Slap someone playfully!',
  category: 'Fun',
  async execute(message) {
    const target = message.mentions?.[0];
    if (!target) return message.reply('Please mention someone to slap!');

    try {
      const url = await fetchReactionGif('slap');
      const embed = new EmbedBuilder()
        .setColor(6086089)
        .setTitle(`${message.author.username} slapped ${target.username}! 👋`)
        .setImage(url)
        .setTimestamp(new Date());
      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await message.channel.send({ content: "Couldn't fetch a slap GIF. Try again!" });
    }
  },
};
