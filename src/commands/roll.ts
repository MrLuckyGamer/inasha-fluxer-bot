import type { Message } from '@fluxerjs/core';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'roll',
  description: 'Roll a random number between 0 and 100.',
  category: 'Fun',
  async execute(message: Message) {
    const result = Math.floor(Math.random() * 101);
    await sendToChannel(message, { content: `🎲 ${message.author.username} rolled a **${result}**!` });
  },
};

export default command;
