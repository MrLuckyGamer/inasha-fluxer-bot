import type { Client } from '@fluxerjs/core';
import type { BotEvent } from '../types.js';

const STATS_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

async function refreshAllStats(client: Client): Promise<void> {
  const { updateStats } = await import('../commands/serverstats.js');
  for (const guild of client.guilds.values()) {
    await updateStats(guild, client);
  }
}

const event: BotEvent<[]> = {
  name: 'ready',
  once: true,
  async execute(client: Client) {
    console.log(`✅ Bot is online! Logged in as ${client.user?.username}`);

    // Re-sync stat channels for every guild on startup, in case anything
    // changed (members, channels) while the bot was offline.
    try {
      await refreshAllStats(client);
    } catch (e) {
      console.error(e);
    }

    // Safety-net refresh: re-sync periodically in case any event is missed.
    setInterval(async () => {
      try {
        await refreshAllStats(client);
      } catch (e) {
        console.error(e);
      }
    }, STATS_REFRESH_INTERVAL_MS);
  },
};

export default event;
