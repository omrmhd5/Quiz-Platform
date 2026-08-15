export function roundScore(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return Math.round(value * 10) / 10;
}

export function averageFromSum(scoreSum: number, count: number) {
  if (count <= 0) {
    return null;
  }

  return roundScore(scoreSum / count);
}
