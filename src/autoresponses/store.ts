import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '../../data/autoresponses/autoresponses.json');

if (!fs.existsSync(path.dirname(FILE))) fs.mkdirSync(path.dirname(FILE), { recursive: true });
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '{}');

type AutoresponseStore = Record<string, Record<string, boolean>>;

function load(): AutoresponseStore {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function save(data: AutoresponseStore): void {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function isEnabled(guildId: string, type: string): boolean {
  const data = load();
  return data[guildId]?.[type] !== false;
}

/** Enable or disable `type` (e.g. 'cat' / 'dog') for `guildId`. */
export function setEnabled(guildId: string, type: string, enabled: boolean): void {
  const data = load();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][type] = enabled;
  save(data);
}
