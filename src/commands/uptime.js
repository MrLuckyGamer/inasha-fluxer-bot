export default {
  name: 'uptime',
  description: 'Show bot uptime.',
  category: 'Utility',
  async execute(message, args, client) {
    const totalSeconds = Math.floor(process.uptime());

    const weeks   = Math.floor(totalSeconds / (7 * 24 * 3600));
    const days    = Math.floor((totalSeconds % (7 * 24 * 3600)) / (24 * 3600));
    const hours   = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (weeks   > 0) parts.push(`${weeks}w`);
    if (days    > 0) parts.push(`${days}d`);
    if (hours   > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    await message.channel.send({ content: `Uptime: ${parts.join(' ')}` });
  },
};
