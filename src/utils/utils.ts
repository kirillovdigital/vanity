export function computeDifficulty(
  prefix: string,
  suffix: string,
  isChecksum: boolean
): number {
  const pattern = prefix + suffix;
  const ret = Math.pow(16, pattern.length);
  return isChecksum
    ? ret * Math.pow(2, pattern.replace(/[^a-f]/gi, "").length)
    : ret;
}

export function computeProbability(
  difficulty: number,
  attempts: number
): number {
  return 1 - Math.pow(1 - 1 / difficulty, attempts);
}

export const middleEllipsis = (str: string, len: number) => {
  if (!str) {
    return "";
  }

  return `${str.substr(0, len)}...${str.substr(str.length - len, str.length)}`;
};
