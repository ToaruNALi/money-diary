/** 共通タイプ */
export type CommonType = CommonMandatoryType & CommonOptionalType;

/** 共通タイプ(必須) */
export type CommonMandatoryType = Required<{
  /** ID(ユニーク) */
  id: string;
}>;

/** 共通タイプ(任意) */
export type CommonOptionalType = Partial<{
  /** ラベル */
  label: string;
  /** 値 */
  value: string;
  /** 表示有無 */
  visible: boolean;
  /** 非活性有無 */
  disabled: boolean;
  /** スタイル */
  styles: Record<string, string>;
}>;
