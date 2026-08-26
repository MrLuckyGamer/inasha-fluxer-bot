import type { Client, Message } from '@fluxerjs/core';

export interface Command {
  name: string;
  description: string;
  category: string;
  aliases?: string[];
  usage?: string;
  execute(message: Message, args: string[], client: Client): Promise<unknown> | unknown;
}

export interface BotEvent<Args extends unknown[] = unknown[]> {
  name: string;
  once?: boolean;
  execute(client: Client, ...args: Args): Promise<unknown> | unknown;
}

declare module '@fluxerjs/core' {
  interface Client {
    commands: Map<string, Command>;
  }
}
