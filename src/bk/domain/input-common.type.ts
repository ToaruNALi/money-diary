// import {
//   ComboboxId,
//   InputField,
//   InputFormat,
// } from '../../shared/constants/constants';
// import { CommonType } from './common.type';

// /** 入力共通タイプ */
// export type InputCommonType = CommonType &
//   InputCommonMandatoryType &
//   InputCommonOptionalType;

// /** 入力共通タイプ(必須) */
// export type InputCommonMandatoryType = Required<{
//   /** 入力タイプ */
//   type: InputField;
//   /** 必須フラグ */
//   required: boolean;
//   /** 保存フラグ */
//   saveFlg: boolean;
// }>;

// /** 入力共通タイプ(任意) */
// export type InputCommonOptionalType = Partial<{
//   /** プレースホルダー */
//   placeholder: string;
//   /** 入力文字数(最小) */
//   minLen: number;
//   /** 入力文字数(最大) */
//   maxLen: number;
//   /** 入力可能パターン */
//   pattern: string;
//   /** フォーマット */
//   format: InputFormat;
//   /** 入力候補フラグ */
//   dataListFlg: boolean;
//   /** コンボボックスID */
//   comboboxId: ComboboxId;
//   /** グリッドスタイル */
//   gridStyles: Record<string, string>;
// }>;
