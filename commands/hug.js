import { EmbedBuilder } from '@fluxerjs/core';
import { fetchWaifuGif } from '../waifuFetch.js';

export default {
  name: 'hug',
  description: 'Send a hug to someone!',
  category: 'Fun',
  async execute(message) {
    const target = message.mentions?.[0];
    if (!target) return message.reply('Please mention someone to hug!');

    try {
      const url = await fetchWaifuGif('hug');
      const embed = new EmbedBuilder()
        .setColor(6086089)
        .setTitle(`${message.author.username} hugged ${target.username}! 🤗`)
        .setImage(url)
        .setTimestamp(new Date());
      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await message.channel.send({ content: "Couldn't fetch a hug GIF. Try again!" });
    }
  },
};
