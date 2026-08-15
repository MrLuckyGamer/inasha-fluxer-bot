import fs from 'fs';
import path from 'path';
import { pathToURL } from '../lib/util.js';

/**
 * Load every event file in `dir` and bind it to `client`.
 * Each event file must default-export `{ name, once?, execute(client, ...args) }`.
 */
export async function loadEvents(dir, client) {
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(dir, file);

    try {
      const mod = await import(pathToURL(filePath));
      const event = mod.default ?? mod;

      if (!event?.name || typeof event.execute !== 'function') {
        console.log(`⚠️ Skipped event file (invalid): ${file}`);
        continue;
      }

      const handler = (...args) => event.execute(client, ...args);
      client[event.once ? 'once' : 'on'](event.name, handler);
      console.log(`🔔 Loaded event: ${event.name}${event.once ? ' (once)' : ''}`);
    } catch (err) {
      console.error(`❌ Failed to load event file: ${file}`);
      console.error(err);
    }
  }
}
