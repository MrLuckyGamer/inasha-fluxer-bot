import { EmbedBuilder, type Message } from '@fluxerjs/core';
import { fetchReactionGif } from '../lib/otakuGifs.js';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'kiss',
  description: 'Send a kiss to someone!',
  category: 'Fun',
  async execute(message: Message) {
    const target = message.mentions?.[0];
    if (!target) return message.reply('Please mention someone to kiss!');

    try {
      const url = await fetchReactionGif('kiss');
      const embed = new EmbedBuilder()
        .setColor(6086089)
        .setTitle(`${message.author.username} kissed ${target.username}! 😘`)
        .setImage(url)
        .setTimestamp(new Date());
      await sendToChannel(message, { embeds: [embed] });
    } catch (err) {
      console.error(err);
      await sendToChannel(message, { content: "Couldn't fetch a kiss GIF. Try again!" });
    }
  },
};

export default command;
