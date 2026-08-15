// Registry of chat-triggered auto-responses.
// To add a new one: add a key here with `label`, `emoji`, `triggers`, and `replies`.
// The messageCreate event and the `autoresponse` command both read from this file,
// and each entry can be toggled on/off per-server via ./store.js.
export const autoresponses = {
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
