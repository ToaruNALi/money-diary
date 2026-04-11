import { ValType } from 'src/app/shared/signal-form/signal-form.component';
import { FilterInputModel, Tbl } from 'src/app/shared/utils/util-row';

/** 行データ */
export type Row = Record<string, ValType>;

/** 行データMap */
export type TblMap = Record<Tbl, Row[]>;

/** テーブル情報 */
export type TblInf = {
  /** フィルタ情報 */
  fm: Record<Tbl, FilterInputModel>;
  /** テーブルデータKey */
  rk: Record<Tbl, string>;
  /** 行データ */
  rd: TblMap;
  /** 列データ */
  cd: TblMap;
};
