export type Override<
  O extends object,
  K extends string | number | symbol,
  V
> = Omit<O, K> & { [_ in K]: V };
