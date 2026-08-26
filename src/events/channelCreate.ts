import { Events, type Channel, type Client, type GuildChannel } from '@fluxerjs/core';
import type { BotEvent } from '../types.js';

function guildIdOf(channel: Channel): string | null {
  return 'guildId' in channel ? (channel as GuildChannel).guildId : null;
}

const event: BotEvent<[channel: Channel]> = {
  name: Events.ChannelCreate,
  async execute(client: Client, channel: Channel) {
    try {
      const guildId = guildIdOf(channel);
      const guild = guildId ? client.guilds.get(guildId) : undefined;
      if (!guild) return;

      const { updateStats } = await import('../commands/serverstats.js');
      await updateStats(guild, client);
    } catch (e) {
      console.error(e);
    }
  },
};

export default event;
