import { Events, type Client, type Message } from '@fluxerjs/core';
import { config } from '../config.js';
import { autoresponses } from '../autoresponses/index.js';
import { isEnabled } from '../autoresponses/store.js';
import { getCounting, setCount } from '../counting/store.js';
import { parseCountingNumber } from '../counting/parseNumber.js';
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

    // ── Counting channel (toggleable per server) ────────────────────────────
    if (message.guildId) {
      const counting = getCounting(message.guildId);
      if (counting && message.channelId === counting.channelId) {
        const trimmed = (message.content ?? '').trim();

        // Accepts plain digits ("42") and spelled-out numbers ("forty two").
        // Anything else (chat, emoji, etc.) in the channel is left alone.
        const parsed = parseCountingNumber(trimmed);

        if (parsed !== null) {
          const expected = counting.count + 1;

          if (parsed === expected) {
            setCount(message.guildId, expected, message.author.id);
            try {
              await message.react('✅');
            } catch (err) {
              console.error('❌ Failed to react to counting message:', err);
            }
          } else {
            setCount(message.guildId, 0, null);
            try {
              await message.react('❌');
            } catch (err) {
              console.error('❌ Failed to react to counting message:', err);
            }
            try {
              await message.reply(
                `❌ Wrong number! I was expecting **${expected}**. The count has been reset — start again from **1**.`
              );
            } catch (err) {
              console.error('❌ Failed to send counting reset reply:', err);
            }
          }
        }

        return;
      }
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
