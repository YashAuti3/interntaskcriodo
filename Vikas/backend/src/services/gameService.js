export const CARD_COUNT = 5;
export const WIN_MULT = 3;
export const MAX_BET = 5000;
export const MAX_ATTEMPTS = 15;

export function genNums() {
  const s = new Set();
  while (s.size < CARD_COUNT) {
    s.add(Math.floor(Math.random() * 90) + 10);
  }
  return [...s];
}

export function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeCards(nums) {
  return nums.map((num, i) => ({
    id: i,
    num,
    revealed: false,
    matched: false,
  }));
}

export function shuffleRow(row) {
  const freeIdx = row.reduce((acc, card, i) => {
    if (!card.matched) acc.push(i);
    return acc;
  }, []);

  const freeNums = fisherYates(freeIdx.map((i) => row[i].num));

  return row.map((card, i) => {
    const pos = freeIdx.indexOf(i);
    if (pos >= 0) {
      return { ...card, num: freeNums[pos], revealed: false };
    }
    return card;
  });
}

export function createGameRows() {
  const nums = genNums();
  let row2Nums;

  do {
    row2Nums = fisherYates(nums);
  } while (row2Nums.every((n, i) => n === nums[i]));

  return {
    row1: makeCards(nums),
    row2: makeCards(row2Nums),
  };
}