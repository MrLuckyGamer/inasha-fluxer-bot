import fs from 'fs';
import path from 'path';
import { pathToURL } from '../lib/util.js';

/**
 * Recursively load every command file in `dir` into `client.commands`.
 * Each command file must default-export an object with at least
 * `{ name, execute }`; `aliases` (array) is optional.
 */
export async function loadCommands(dir, client) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await loadCommands(filePath, client);
      continue;
    }

    if (!file.endsWith('.js')) continue;

    try {
      const mod = await import(pathToURL(filePath));
      const command = mod.default ?? mod;

      if (command?.name) {
        client.commands.set(command.name, command);
        console.log(`📦 Loaded command: ${command.name}`);
        for (const alias of command.aliases ?? []) {
          client.commands.set(alias, command);
          console.log(`   ↳ alias: ${alias}`);
        }
      } else {
        console.log(`⚠️ Skipped file (no command): ${file}`);
      }
    } catch (err) {
      console.error(`❌ Failed to load command file: ${file}`);
      console.error(err);
    }
  }
}
