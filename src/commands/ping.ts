import type { Client, Message } from '@fluxerjs/core';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'ping',
  description: 'Returns bot and API latency.',
  category: 'Utility',
  async execute(message: Message, args: string[], client: Client) {
    const before = Date.now();
    const sent = await sendToChannel(message, { content: 'Pinging...' });
    const latency = Date.now() - before;
    await sent.edit({ content: `Pong!\n\nMessage latency: **${latency}ms**` });
  },
};

export default command;
