export type WhereQueryDTO = {
  fieldPath: string;
  optStr: '<' | '<=' | '==' | '>' | '>=';
  value: unknown;
};
