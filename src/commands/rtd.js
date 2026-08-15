export default {
  name: 'rtd',
  description: 'Roll the Dice. Default is 1d6 (i>rtd 20 for a d20).',
  category: 'Fun',
  async execute(message, args) {
    let sides = 6;
    if (args[0]) {
      const parsed = parseInt(args[0]);
      if (!isNaN(parsed) && parsed > 1) sides = parsed;
      else return message.reply('Please provide a valid number of sides (greater than 1).');
    }
    const result = Math.floor(Math.random() * sides) + 1;
    await message.reply(`🎲 You rolled a **${result}** on a **${sides}-sided die**`);
  },
};
