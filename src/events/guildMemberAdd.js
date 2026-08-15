import { Events } from '@fluxerjs/core';

export default {
  name: Events.GuildMemberAdd,
  async execute(client, member) {
    try {
      const { updateStats } = await import('../commands/serverstats.js');
      await updateStats(member.guild, client);
    } catch (e) {
      console.error(e);
    }
  },
};
