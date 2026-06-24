import { EmbedBuilder } from '@fluxerjs/core';
import { fetchNekosGif } from '../nekosBest.js';

export default {
  name: 'kiss',
  description: 'Send a kiss to someone!',
  category: 'Fun',
  async execute(message) {
    const target = message.mentions?.[0];
    if (!target) return message.reply('Please mention someone to kiss!');

    try {
      const url = await fetchNekosGif('kiss');
      const embed = new EmbedBuilder()
        .setColor(6086089)
        .setTitle(`${message.author.username} kissed ${target.username}! 😘`)
        .setImage(url)
        .setTimestamp(new Date());
      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await message.channel.send({ content: "Couldn't fetch a kiss GIF. Try again!" });
    }
  },
};
