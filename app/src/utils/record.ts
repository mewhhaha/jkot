export const required = <
  O extends Record<string, unknown>,
  Key extends keyof O
>(
  obj: O,
  keys: Key[]
): obj is { [P in Key]-?: O[P] } & O => {
  for (const key of keys) {
    const hasKey = key in obj;
    if (!hasKey) {
      return false;
    }
  }

  return true;
};
