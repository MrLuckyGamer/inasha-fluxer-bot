export interface AutoresponseEntry {
  label: string;
  emoji: string;
  triggers: string[];
  replies: string[];
}

export const autoresponses: Record<string, AutoresponseEntry> = {
  cat: {
    label: 'Cat replies',
    emoji: '🐱',
    triggers: ['meow'],
    replies: [
      'Meow! 🐱',
      '😺 Meow meow!',
      'Mew~',
      'Purr~ 😻',
      'Nya~ ✨',
      '*eepy meow...* 💤',
      'MEOW!!',
      '🐾 *pounces on you* meow!',
    ],
  },
  dog: {
    label: 'Dog replies',
    emoji: '🐶',
    triggers: ['woof', 'bark', 'bork', 'ruff', 'arf'],
    replies: [
      'Woof! 🐶',
      'Bark bark! 🐾',
      'bork bork!',
      'Ruff~ 🐕',
      '*wags tail excitedly*',
      '🐶 *gives you a slobbery kiss*',
    ],
  },
};
