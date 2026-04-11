import { RowEdt } from 'src/app/shared/utils/util-row';

/** 行編集保存情報 */
export type Hist = {
  /** 履歴参照INDEX */
  ix: number;
  /** UNDO情報 */
  ud: RowEdt[][];
  /** REDO情報 */
  rd: RowEdt[][];
};
