import fs from 'fs';
import path from 'path';
import type { Client } from '@fluxerjs/core';
import { pathToURL } from '../lib/util.js';
import type { Command } from '../types.js';

export async function loadCommands(dir: string, client: Client): Promise<void> {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await loadCommands(filePath, client);
      continue;
    }

    if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;
    if (file.endsWith('.d.ts')) continue;

    try {
      const mod = (await import(pathToURL(filePath))) as { default?: Command };
      const command = mod.default ?? (mod as unknown as Command);

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
