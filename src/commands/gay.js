export default {
  name: 'gay',
  description: 'Check how gay someone is!',
  category: 'Fun',
  async execute(message) {
    const target = message.mentions?.[0] ?? message.author;
    const percent = Math.floor(Math.random() * 101);
    await message.channel.send({ content: `🏳️‍🌈 ${target.username} is ${percent}% gay!` });
  },
};
