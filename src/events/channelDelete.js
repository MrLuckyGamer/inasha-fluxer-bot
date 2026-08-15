import { Events } from '@fluxerjs/core';

export default {
  name: Events.ChannelDelete,
  async execute(client, channel) {
    try {
      const guild = channel.guild ?? client.guilds.get(channel.guildId);
      if (!guild) return;

      const { updateStats } = await import('../commands/serverstats.js');
      await updateStats(guild, client);
    } catch (e) {
      console.error(e);
    }
  },
};
