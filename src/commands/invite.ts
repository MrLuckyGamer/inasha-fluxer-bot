import { EmbedBuilder, type Client, type Message } from '@fluxerjs/core';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'invite',
  description: "Get the bot's invite link.",
  category: 'Utility',
  async execute(message: Message, args: string[], client: Client) {
    const inviteUrl = 'https://web.fluxer.app/oauth2/authorize?client_id=1492077171327562990&scope=bot&permissions=268823606';

    const embed = new EmbedBuilder()
      .setTitle('Invite Me')
      .setDescription(`[Click here to invite me](${inviteUrl})`)
      .setColor(6086089)
      .setThumbnail(client.user?.displayAvatarURL({ size: 512 }) ?? null)
      .setTimestamp(new Date());

    await sendToChannel(message, { embeds: [embed] });
  },
};

export default command;
