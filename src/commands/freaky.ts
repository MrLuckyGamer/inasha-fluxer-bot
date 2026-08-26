import type { Message } from '@fluxerjs/core';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'freaky',
  description: 'Check how freaky someone is!',
  category: 'Fun',
  async execute(message: Message) {
    const target = message.mentions?.[0] ?? message.author;
    const percent = Math.floor(Math.random() * 101);
    await sendToChannel(message, { content: `😈 ${target.username} is ${percent}% a freak!` });
  },
};

export default command;
