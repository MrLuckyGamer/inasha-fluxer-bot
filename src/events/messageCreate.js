import { Events } from '@fluxerjs/core';
import { config } from '../config.js';
import { autoresponses } from '../autoresponses/index.js';
import { isEnabled } from '../autoresponses/store.js';

export default {
  name: Events.MessageCreate,
  async execute(client, message) {
    if (message.author?.bot) return;

    const lower = (message.content ?? '').toLowerCase();
    const prefix = config.prefix.toLowerCase();

    // ── Prefix commands ─────────────────────────────────────────────────────
    if (lower.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      const command = client.commands.get(commandName);

      if (command) {
        try {
          console.log(`⚡ ${message.author.username} ran: ${commandName}`);
          await command.execute(message, args, client);
        } catch (error) {
          console.error(`❌ Error executing command: ${commandName}`);
          console.error(error);
          await message.reply('There was an error executing that command.');
        }
      }
      return;
    }

    // ── Chat auto-responses (cat/dog etc., toggleable per server) ──────────
    for (const [type, entry] of Object.entries(autoresponses)) {
      if (!entry.triggers.some((word) => lower.includes(word))) continue;
      if (!isEnabled(message.guildId, type)) return;

      const replies = entry.replies;
      return message.reply(replies[Math.floor(Math.random() * replies.length)]);
    }
  },
};
