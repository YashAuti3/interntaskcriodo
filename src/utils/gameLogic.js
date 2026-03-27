// ─── Number Generation ───────────────────────────────────────────────────────

/**
 * Generate `count` unique random integers in [min, max].
 */
export const generateUniqueNumbers = (count = 5, min = 1, max = 99) => {
  const nums = new Set();
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return [...nums];
};

// ─── Shuffle ─────────────────────────────────────────────────────────────────

/**
 * Fisher-Yates shuffle – returns NEW array (non-mutating).
 */
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ─── Card Factory ─────────────────────────────────────────────────────────────

/**
 * Build initial card state from 5 unique numbers.
 * Returns { row1: Card[], row2: Card[] }
 *
 * Card shape:
 *   { id, row, number, isFlipped, isMatched }
 */
export const buildCards = (numbers) => {
  const shuffled = shuffle([...numbers]);
  const row1 = numbers.map((n, i) => ({
    id: `r1-${i}`,
    row: 1,
    number: n,
    isFlipped: false,
    isMatched: false,
  }));
  const row2 = shuffled.map((n, i) => ({
    id: `r2-${i}`,
    row: 2,
    number: n,
    isFlipped: false,
    isMatched: false,
  }));
  return { row1, row2 };
};

// ─── Dynamic Shuffle (anti-cheat) ────────────────────────────────────────────

/**
 * Re-shuffle ONLY unmatched cards in each row,
 * keeping matched cards at their current positions.
 */
export const reshuffleUnmatched = (row1, row2) => {
  const shuffleRow = (row) => {
    const matched = row.filter((c) => c.isMatched);
    const unmatched = row.filter((c) => !c.isMatched);
    const shuffledNums = shuffle(unmatched.map((c) => c.number));
    let si = 0;
    return row.map((c) => {
      if (c.isMatched) return c;
      return { ...c, number: shuffledNums[si++], isFlipped: false };
    });
  };
  return {
    row1: shuffleRow(row1),
    row2: shuffleRow(row2),
  };
};

// ─── Match Check ─────────────────────────────────────────────────────────────

export const checkMatch = (card1, card2) => {
  return card1.number === card2.number;
};

// ─── Win Check ───────────────────────────────────────────────────────────────

export const checkWin = (row1) => {
  return row1.every((c) => c.isMatched);
};
