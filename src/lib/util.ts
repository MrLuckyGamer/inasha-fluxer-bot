import { pathToFileURL } from 'url';
import type { Message, TextChannel } from '@fluxerjs/core';

export function pathToURL(absPath: string): string {
  return pathToFileURL(absPath).href;
}

export function sendToChannel(message: Message, options: Parameters<TextChannel['send']>[0]) {
  return (message.channel as TextChannel).send(options);
}
