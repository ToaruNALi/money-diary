/**
 * 特定のプロパティを上書きする型関数
 */
export type Overwrite<T, U extends { [Key in keyof T]?: unknown }> = Omit<
  T,
  keyof U
> &
  U;
