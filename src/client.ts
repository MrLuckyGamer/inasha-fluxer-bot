import { Client, Events } from '@fluxerjs/core';
import type { Command } from './types.js';

export function createClient(): Client {
  const client = new Client({ intents: 0, suppressIntentWarning: true, waitForGuilds: true });
  client.commands = new Map<string, Command>();

  client.on(Events.Error, (error: Error) => {
    console.error('⚠️ Gateway error (handled, connection will retry):', error);
  });

  return client;
}
