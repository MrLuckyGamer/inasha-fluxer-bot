import type { Message } from '@fluxerjs/core';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'ship',
  description: 'Calculate love compatibility between two users.',
  category: 'Fun',
  async execute(message: Message) {
    const mentions = message.mentions ?? [];
    const user1 = mentions[0];
    const user2 = mentions[1];
    if (!user1 || !user2) return message.reply('Please mention **two users** to ship.');

    const percent = Math.floor(Math.random() * 101);
    let comment = '';
    if (percent > 90)      comment = 'A match made in heaven! 💖';
    else if (percent > 70) comment = 'Looking good together! 💕';
    else if (percent > 40) comment = 'Could work… 😅';
    else                   comment = 'Maybe just friends… 💔';

    await sendToChannel(message, {
      content: `💞 **${user1.username}** + **${user2.username}** = **${percent}%** love compatibility! ${comment}`,
    });
  },
};

export default command;
