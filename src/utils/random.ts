// generates the same sequence for the same seed
// e.g. const random = seededRandom(1)
// [random(1, 10), random(1, 10), random(1, 10), random(1, 10)]
// [ 5, 7, 1, 4 ]
export const seededRandom = (seed: number) => {
  let state = seed;
  return (min: number, max: number) => {
    state = (state * 1664525 + 1013904223) % 2147483648;
    return Math.floor((state / 2147483648) * (max - min)) + min;
  };
};
