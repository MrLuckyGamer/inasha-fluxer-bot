import type { Client, Message } from '@fluxerjs/core';

/**
 * Shape every file in `src/commands` must default-export.
 * `execute` receives the invoking message, the parsed argument tokens
 * (everything after the command name, split on whitespace), and the client.
 */
export interface Command {
  name: string;
  description: string;
  category: string;
  aliases?: string[];
  usage?: string;
  execute(message: Message, args: string[], client: Client): Promise<unknown> | unknown;
}

/**
 * Shape every file in `src/events` must default-export.
 * `name` is the Fluxer client event name (see `Events` from `@fluxerjs/core`).
 * `Args` is the tuple of extra arguments the underlying client event provides
 * (i.e. everything after the implicit `client` first argument passed by the loader).
 */
export interface BotEvent<Args extends unknown[] = unknown[]> {
  name: string;
  once?: boolean;
  execute(client: Client, ...args: Args): Promise<unknown> | unknown;
}

// The bot attaches a `commands` registry directly onto the Client instance
// (see src/client.ts). This augments the library's `Client` type so every
// file that imports `Client` from '@fluxerjs/core' sees `commands` too.
declare module '@fluxerjs/core' {
  interface Client {
    commands: Map<string, Command>;
  }
}
