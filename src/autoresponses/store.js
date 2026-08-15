import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '../../data/autoresponses/autoresponses.json');

if (!fs.existsSync(path.dirname(FILE))) fs.mkdirSync(path.dirname(FILE), { recursive: true });
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '{}');

function load() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/**
 * Whether `type` (e.g. 'cat' / 'dog') is enabled for `guildId`.
 * Auto-responses are enabled by default until explicitly disabled.
 */
export function isEnabled(guildId, type) {
  const data = load();
  return data[guildId]?.[type] !== false;
}

/** Enable or disable `type` (e.g. 'cat' / 'dog') for `guildId`. */
export function setEnabled(guildId, type, enabled) {
  const data = load();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][type] = enabled;
  save(data);
}
