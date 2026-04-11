/**
 * オブジェクトを比較する
 * @param aVal
 * @param bVal
 * @returns true: 一致, false: 不一致
 */
export const equalObj = (aVal: unknown, bVal: unknown): boolean => {
  if (!aVal && !bVal && typeof aVal !== typeof bVal) {
    return false;
  }

  return JSON.stringify(aVal) === JSON.stringify(bVal);
};
