export default {
  name: 'ping',
  description: 'Returns bot and API latency.',
  category: 'Utility',
  async execute(message, args, client) {
    const before = Date.now();
    const sent = await message.channel.send({ content: 'Pinging...' });
    const latency = Date.now() - before;
    await sent.edit({ content: `Pong!\n\nMessage latency: **${latency}ms**` });
  },
};
