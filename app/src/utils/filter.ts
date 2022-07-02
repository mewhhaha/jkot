export const exists = <A>(value: A): value is NonNullable<A> =>
  value !== undefined && value !== null;
