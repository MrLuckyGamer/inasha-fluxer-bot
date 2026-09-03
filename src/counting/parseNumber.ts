const ONES: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const SCALES: Record<string, number> = {
  hundred: 100,
  thousand: 1_000,
  million: 1_000_000,
  billion: 1_000_000_000,
};

/**
 * Convert a spelled-out English number ("twenty one", "one-hundred-and-one",
 * "two thousand twenty four") into its numeric value. Returns `null` if the
 * text isn't a recognizable number phrase.
 */
function wordsToNumber(input: string): number | null {
  const words = input
    .toLowerCase()
    .trim()
    .replace(/-/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0 && word !== 'and');

  if (words.length === 0) return null;

  let total = 0;
  let current = 0;
  let matchedAny = false;

  for (const word of words) {
    if (word in ONES) {
      current += ONES[word];
      matchedAny = true;
    } else if (word in TENS) {
      current += TENS[word];
      matchedAny = true;
    } else if (word in SCALES) {
      const scale = SCALES[word];
      if (scale === 100) {
        current = (current === 0 ? 1 : current) * scale;
      } else {
        total += (current === 0 ? 1 : current) * scale;
        current = 0;
      }
      matchedAny = true;
    } else {
      // Unknown word in the phrase — bail out rather than guessing.
      return null;
    }
  }

  if (!matchedAny) return null;
  return total + current;
}

/**
 * Parse a counting-channel message into a number. Accepts plain digits
 * ("42") as well as spelled-out numbers ("forty two"). Returns `null` if the
 * message isn't a valid non-negative integer in either form.
 */
export function parseCountingNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  if (/^\d+$/.test(trimmed)) return Number(trimmed);

  return wordsToNumber(trimmed);
}
