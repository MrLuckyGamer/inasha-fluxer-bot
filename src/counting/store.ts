import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '../../data/counting/counting.json');

if (!fs.existsSync(path.dirname(FILE))) fs.mkdirSync(path.dirname(FILE), { recursive: true });
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '{}');

export interface CountingState {
  channelId: string;
  count: number;
  lastUserId: string | null;
}

type CountingStore = Record<string, CountingState>;

function load(): CountingStore {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function save(data: CountingStore): void {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/** Get the counting state for a guild, or `undefined` if counting isn't set up there. */
export function getCounting(guildId: string): CountingState | undefined {
  return load()[guildId];
}

/** Enable the counting game in `channelId`, resetting the count back to 0. */
export function enableCounting(guildId: string, channelId: string): void {
  const data = load();
  data[guildId] = { channelId, count: 0, lastUserId: null };
  save(data);
}

/** Disable the counting game for a guild entirely. */
export function disableCounting(guildId: string): void {
  const data = load();
  delete data[guildId];
  save(data);
}

/** Update the running count after a message is processed. */
export function setCount(guildId: string, count: number, lastUserId: string | null): void {
  const data = load();
  if (!data[guildId]) return;
  data[guildId].count = count;
  data[guildId].lastUserId = lastUserId;
  save(data);
}
