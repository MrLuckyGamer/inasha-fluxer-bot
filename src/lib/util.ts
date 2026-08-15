import { pathToFileURL } from 'url';
import type { Message, TextChannel } from '@fluxerjs/core';

/**
 * Convert an absolute filesystem path to a file:// URL string.
 * Required for dynamic import() of absolute paths in Node ESM.
 */
export function pathToURL(absPath: string): string {
  return pathToFileURL(absPath).href;
}

/**
 * Send to the channel a message came from.
 * `message.channel` is typed as `TextChannel | DMChannel | GuildChannel | null`
 * (only the first two support `.send`); every command in this bot only ever
 * runs in a text-capable channel, so this centralizes that assumption instead
 * of repeating a cast/null-check at every call site.
 */
export function sendToChannel(message: Message, options: Parameters<TextChannel['send']>[0]) {
  return (message.channel as TextChannel).send(options);
}
