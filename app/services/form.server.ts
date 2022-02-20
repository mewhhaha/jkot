type FromKeys<Fields extends readonly [any, ...any[]]> = {
  [key in Fields[number]]: string;
};

export const fields = <T extends string, Fields extends readonly [T, ...T[]]>(
  formData: FormData,
  fields: Fields
): FromKeys<Fields> => {
  // @ts-ignore
  return Object.fromEntries(
    fields.map((name) => [name, formData.get(name)?.toString() ?? ""])
  );
};
