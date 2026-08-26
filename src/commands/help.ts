import { EmbedBuilder, type Client, type Message } from '@fluxerjs/core';
import { config } from '../config.js';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const PREFIX = config.prefix;

const command: Command = {
  name: 'help',
  description: 'Show all commands grouped by category.',
  category: 'Utility',
  async execute(message: Message, args: string[], client: Client) {
    const seen = new Set<string>();
    const categories: Record<string, string[]> = {};
    for (const cmd of client.commands.values()) {
      if (seen.has(cmd.name)) continue;
      seen.add(cmd.name);

      const cat = cmd.category || 'Uncategorized';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(`\`${PREFIX}${cmd.name}\` — ${cmd.description}`);
    }

    const embed = new EmbedBuilder()
      .setTitle('Help: List of Commands')
      .setColor(6086089)
      .setTimestamp(new Date());

    for (const [category, cmds] of Object.entries(categories)) {
      embed.addFields({ name: category, value: cmds.join('\n') });
    }

    await sendToChannel(message, { embeds: [embed] });
  },
};

export default command;
