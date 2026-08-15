import { EmbedBuilder, type Client, type Message } from '@fluxerjs/core';
import { createRequire } from 'module';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const require = createRequire(import.meta.url);
const { version: botVersion } = require('../../package.json') as { version: string };

const PREFIX = process.env.prefix || 'i>';

const command: Command = {
  name: 'botinfo',
  description: 'Show bot information.',
  category: 'Utility',
  async execute(message: Message, args: string[], client: Client) {
    const totalUsers = [...client.guilds.values()].reduce((s, g) => s + (g.memberCount ?? 0), 0);

    const uptimeSec = Math.floor(process.uptime());
    const days    = Math.floor(uptimeSec / 86400);
    const hours   = Math.floor((uptimeSec % 86400) / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);

    const embed = new EmbedBuilder()
      .setTitle(`Bot Info: ${client.user?.username}`)
      .setThumbnail(client.user?.displayAvatarURL() ?? null)
      .addFields(
        { name: 'Servers',  value: `${client.guilds.size}`, inline: true },
        { name: 'Users',    value: `${totalUsers}`,         inline: true },
        { name: 'Prefix',   value: `\`${PREFIX}\``,         inline: true },
        { name: 'Version',  value: botVersion,              inline: true },
        { name: 'Node.js',  value: process.version,         inline: true },
        { name: 'Uptime',   value: `${days}d ${hours}h ${minutes}m`, inline: true },
      )
      .setColor(6086089)
      .setTimestamp(new Date());

    await sendToChannel(message, { embeds: [embed] });
  },
};

export default command;
