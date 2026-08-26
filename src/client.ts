import { Client } from '@fluxerjs/core';
import type { Command } from './types.js';

export function createClient(): Client {
  const client = new Client({ intents: 0, suppressIntentWarning: true, waitForGuilds: true });
  client.commands = new Map<string, Command>();
  return client;
}
