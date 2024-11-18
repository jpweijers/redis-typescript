export const isNullOrUndefined = (value: unknown): boolean => {
  return value === null || value === undefined;
};

export const isDefined = (value: unknown): boolean => {
  return !isNullOrUndefined(value);
};
