import type { Message } from '@fluxerjs/core';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'coinflip',
  description: 'Flip a coin.',
  category: 'Fun',
  async execute(message: Message) {
    const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🪙';
    await sendToChannel(message, { content: `🎲 Coinflip result: **${result}**` });
  },
};

export default command;
