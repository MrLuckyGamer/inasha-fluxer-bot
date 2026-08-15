export default {
  name: 'coinflip',
  description: 'Flip a coin.',
  category: 'Fun',
  async execute(message) {
    const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🪙';
    await message.channel.send({ content: `🎲 Coinflip result: **${result}**` });
  },
};
