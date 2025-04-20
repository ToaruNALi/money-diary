import { RowDataEdit } from 'src/app/shared/constants/types';

/** 行編集保存情報 */
export type RowDataEditHistory = {
  /** 履歴参照INDEX */
  ix: number;
  /** UNDO情報 */
  ud: RowDataEdit[][];
  /** REDO情報 */
  rd: RowDataEdit[][];
};
