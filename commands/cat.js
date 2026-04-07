import { EmbedBuilder } from '@fluxerjs/core';
import https from 'https';

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

export default {
  name: 'cat',
  description: 'Get a random cat image.',
  category: 'Fun',
  async execute(message) {
    try {
      const json = await fetchJSON('https://api.thecatapi.com/v1/images/search');
      if (!json?.[0]?.url) return message.channel.send({ content: "Couldn't fetch a cat image. Try again!" });

      const embed = new EmbedBuilder()
        .setColor(6086089)
        .setTitle('🐱 Here is your random cat!')
        .setImage(json[0].url)
        .setTimestamp(new Date());

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await message.channel.send({ content: 'Failed to fetch cat image!' });
    }
  },
};
