import type { Client, Message } from '@fluxerjs/core';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'uptime',
  description: 'Show bot uptime.',
  category: 'Utility',
  async execute(message: Message, args: string[], client: Client) {
    const totalSeconds = Math.floor(process.uptime());

    const weeks   = Math.floor(totalSeconds / (7 * 24 * 3600));
    const days    = Math.floor((totalSeconds % (7 * 24 * 3600)) / (24 * 3600));
    const hours   = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (weeks   > 0) parts.push(`${weeks}w`);
    if (days    > 0) parts.push(`${days}d`);
    if (hours   > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    await sendToChannel(message, { content: `Uptime: ${parts.join(' ')}` });
  },
};

export default command;
