import { EmbedBuilder } from '@fluxerjs/core';

const PREFIX = process.env.prefix || 'i>';

export default {
  name: 'help',
  description: 'Show all commands grouped by category.',
  category: 'Utility',
  async execute(message, args, client) {
    const categories = {};
    for (const cmd of client.commands.values()) {
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

    await message.channel.send({ embeds: [embed] });
  },
};
