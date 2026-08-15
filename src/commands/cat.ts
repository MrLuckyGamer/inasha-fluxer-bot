import { EmbedBuilder, type Message } from '@fluxerjs/core';
import https from 'https';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

interface CatApiResult {
  url: string;
}

function fetchJSON(url: string): Promise<CatApiResult[]> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

const command: Command = {
  name: 'cat',
  description: 'Get a random cat image.',
  category: 'Fun',
  async execute(message: Message) {
    try {
      const json = await fetchJSON('https://api.thecatapi.com/v1/images/search');
      if (!json?.[0]?.url) return sendToChannel(message, { content: "Couldn't fetch a cat image. Try again!" });

      const embed = new EmbedBuilder()
        .setColor(6086089)
        .setTitle('🐱 Here is your random cat!')
        .setImage(json[0].url)
        .setTimestamp(new Date());

      await sendToChannel(message, { embeds: [embed] });
    } catch (err) {
      console.error(err);
      await sendToChannel(message, { content: 'Failed to fetch cat image!' });
    }
  },
};

export default command;
