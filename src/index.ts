import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { createClient } from './client.js';
import { loadCommands } from './handlers/loadCommands.js';
import { loadEvents } from './handlers/loadEvents.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = createClient();

await loadCommands(path.join(__dirname, 'commands'), client);
await loadEvents(path.join(__dirname, 'events'), client);

// === Global Error Logging ===
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled promise rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught exception:', err);
});

// === Login ===
console.log('🔐 Attempting to log in...');
await client.login(config.token as string);
