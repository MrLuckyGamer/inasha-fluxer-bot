import { Events, type Client, type GuildMember } from '@fluxerjs/core';
import type { BotEvent } from '../types.js';

const event: BotEvent<[member: GuildMember]> = {
  name: Events.GuildMemberAdd,
  async execute(client: Client, member: GuildMember) {
    try {
      const { updateStats } = await import('../commands/serverstats.js');
      await updateStats(member.guild, client);
    } catch (e) {
      console.error(e);
    }
  },
};

export default event;
