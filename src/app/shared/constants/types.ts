import { FormControl, FormRecord } from '@angular/forms';
import { FilterModel } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { ScrData } from 'src/app/domain/screen-info';
import * as Const from 'src/app/shared/constants/constants';

/************************
 * Const Type
 ************************/
export type MainCol = (typeof Const.MAIN_COL)[keyof typeof Const.MAIN_COL];
export type InputMode =
  (typeof Const.INPUT_MODE)[keyof typeof Const.INPUT_MODE];
export type InputType =
  (typeof Const.INPUT_TYPE)[keyof typeof Const.INPUT_TYPE];
export type Scr = (typeof Const.SCR)[keyof typeof Const.SCR];
export type Tbl = (typeof Const.TBL)[keyof typeof Const.TBL];
export type Stg = (typeof Const.SAVE_STG)[keyof typeof Const.SAVE_STG];

/************************
 * Row Datas Event Type
 ************************/

/** 行データ編集 */
export type RowEdt =
  | {
      /** 行データ追加時 */
      type: typeof Const.TBL_EDIT_TYPE.ADD;
      tbl: Tbl;
      rows: Row[];
      addIds: ValType[]; // ※nullの場合最終行に追加
    }
  | {
      /** 行データ更新時 */
      type: typeof Const.TBL_EDIT_TYPE.UPD;
      tbl: Tbl;
      rows: Row[];
    }
  | {
      /** 行データ削除時 */
      type: typeof Const.TBL_EDIT_TYPE.DEL;
      tbl: Tbl;
      delIds: ValType[];
    }
  | {
      /** 行データ移動時 */
      type: typeof Const.TBL_EDIT_TYPE.DRG;
      tbl: Tbl;
      delIds: ValType[];
      addIds: ValType[]; // ※nullの場合最終行に移動
    };

/********************
 * Other Type
 ********************/

/** 入力値情報 */
export type ValType = string | boolean | number | null | ValType[];
/** 支払日情報 */
export type PayDateInf = {
  date: string | Date;
  closeDay: number;
  payDay: number;
  payMonth: number;
  businessDays: number;
};
/** ソートオプション */
export type SortOpt = {
  col: string;
  asc?: boolean;
};
/** 画面表示データ */
export type ScrDspData = ScrData & Pick<MenuListData, 'lb' | 'ab' | 'ic'>;
/** メニューリストデータ */
export type MenuListData = {
  id: string;
  lb: string;
  ab?: string;
  ic: string;
};
/** フィルター編集 */
export type FilterEdt = {
  tbl: Tbl;
  filter: FilterInputModel;
};
/** フィルターモデル */
export type FilterInputModel = FilterModel | null | 'none';

/********************
 * Form Type
 ********************/

/** 全値 */
export type FormCtrl = FormControl<ValType> | FormRecord<FormControl<ValType>>;
