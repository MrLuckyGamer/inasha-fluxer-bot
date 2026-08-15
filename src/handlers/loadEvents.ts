import fs from 'fs';
import path from 'path';
import type { Client } from '@fluxerjs/core';
import { pathToURL } from '../lib/util.js';
import type { BotEvent } from '../types.js';

/**
 * Load every event file in `dir` and bind it to `client`.
 * Each event file must default-export `{ name, once?, execute(client, ...args) }`.
 */
export async function loadEvents(dir: string, client: Client): Promise<void> {
  const files = fs
    .readdirSync(dir)
    .filter((file) => (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts'));

  for (const file of files) {
    const filePath = path.join(dir, file);

    try {
      const mod = (await import(pathToURL(filePath))) as { default?: BotEvent };
      const event = mod.default ?? (mod as unknown as BotEvent);

      if (!event?.name || typeof event.execute !== 'function') {
        console.log(`⚠️ Skipped event file (invalid): ${file}`);
        continue;
      }

      const handler = (...args: unknown[]) => event.execute(client, ...args);
      client[event.once ? 'once' : 'on'](event.name, handler as (...args: unknown[]) => void);
      console.log(`🔔 Loaded event: ${event.name}${event.once ? ' (once)' : ''}`);
    } catch (err) {
      console.error(`❌ Failed to load event file: ${file}`);
      console.error(err);
    }
  }
}
