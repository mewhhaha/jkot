type FromKeys<Fields extends readonly [string, ...string[]]> = {
  [key in Fields[number]]: string;
};

export const fields = <T extends string, Fields extends readonly [T, ...T[]]>(
  formData: FormData,
  fields: Fields
): FromKeys<Fields> => {
  // @ts-ignore Getting the fields out properly is a complex type
  return Object.fromEntries(
    fields.map((name) => [name, formData.get(name)?.toString() ?? ""])
  );
};
