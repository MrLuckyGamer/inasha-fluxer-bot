import { Events, type Client, type Message } from '@fluxerjs/core';
import { config } from '../config.js';
import { autoresponses } from '../autoresponses/index.js';
import { isEnabled } from '../autoresponses/store.js';
import type { BotEvent } from '../types.js';

const event: BotEvent<[message: Message]> = {
  name: Events.MessageCreate,
  async execute(client: Client, message: Message) {
    if (message.author?.bot) return;

    const lower = (message.content ?? '').toLowerCase();
    const prefix = config.prefix.toLowerCase();

    // ── Prefix commands ─────────────────────────────────────────────────────
    if (lower.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = (args.shift() ?? '').toLowerCase();
      const command = client.commands.get(commandName);

      if (command) {
        try {
          console.log(`⚡ ${message.author.username} ran: ${commandName}`);
          await command.execute(message, args, client);
        } catch (error) {
          console.error(`❌ Error executing command: ${commandName}`);
          console.error(error);
          try {
            await message.reply('There was an error executing that command.');
          } catch (replyError) {
            console.error('❌ Also failed to send the error reply:', replyError);
          }
        }
      }
      return;
    }

    // ── Chat auto-responses (cat/dog etc., toggleable per server) ──────────
    for (const [type, entry] of Object.entries(autoresponses)) {
      if (!entry.triggers.some((word) => lower.includes(word))) continue;
      if (!message.guildId || !isEnabled(message.guildId, type)) return;

      const replies = entry.replies;
      return message.reply(replies[Math.floor(Math.random() * replies.length)]);
    }
  },
};

export default event;
