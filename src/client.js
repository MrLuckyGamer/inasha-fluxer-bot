import { Client } from '@fluxerjs/core';

export function createClient() {
  const client = new Client({ intents: 0, suppressIntentWarning: true, waitForGuilds: true });
  client.commands = new Map();
  return client;
}
