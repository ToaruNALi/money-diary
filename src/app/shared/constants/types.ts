import { FormControl, FormRecord } from '@angular/forms';
import { FilterModel } from 'ag-grid-community';
import { RowData } from 'src/app/domain/row-data';
import { ScreenData } from 'src/app/domain/screen-info';
import * as Const from 'src/app/shared/constants/constants';

/********************
 * Const Type
 ********************/
export type MoneyDiaryColId =
  (typeof Const.MONEY_DIARY_COL_ID)[keyof typeof Const.MONEY_DIARY_COL_ID];
// export type StorageColId =
//   (typeof Const.STORAGE_COL_ID)[keyof typeof Const.STORAGE_COL_ID];
// export type CreditColId =
//   (typeof Const.CREDIT_COL_ID)[keyof typeof Const.CREDIT_COL_ID];
// export type ItemColId =
//   (typeof Const.ITEM_COL_ID)[keyof typeof Const.ITEM_COL_ID];
// export type RemarkColId =
//   (typeof Const.REMARK_COL_ID)[keyof typeof Const.REMARK_COL_ID];
export type GridRowColor =
  (typeof Const.GRID_ROW_COLOR)[keyof typeof Const.GRID_ROW_COLOR];
export type StorageKey =
  (typeof Const.STORAGE_KEY)[keyof typeof Const.STORAGE_KEY];
export type ScreenId = (typeof Const.SCREEN_ID)[keyof typeof Const.SCREEN_ID];
export type InputMode =
  (typeof Const.INPUT_MODE)[keyof typeof Const.INPUT_MODE];
export type RowDataKey =
  (typeof Const.ROW_DATA_KEY)[keyof typeof Const.ROW_DATA_KEY];
export type InputType =
  (typeof Const.INPUT_TYPE)[keyof typeof Const.INPUT_TYPE];
export type BusinessDays =
  (typeof Const.BUSINESS_DAYS)[keyof typeof Const.BUSINESS_DAYS];
export type FreqDWMY = (typeof Const.FREQ_DWMY)[keyof typeof Const.FREQ_DWMY];
export type DayOfWeek =
  (typeof Const.DAY_OF_WEEK)[keyof typeof Const.DAY_OF_WEEK];
export type DateFormat =
  (typeof Const.DATE_FORMAT)[keyof typeof Const.DATE_FORMAT];

/************************
 * Row Datas Event Type
 ************************/
/** 行データ設定時 */
export type RowDataSet = {
  key: RowDataKey;
  datas: RowData[];
};
/** 行データ追加時 */
export type RowDataAdd = {
  key: RowDataKey;
  datas: RowData[];
  addIds: (string | null)[]; // ※nullの場合最終行に追加
};
/** 行データ更新時 */
export type RowDataUpd = {
  key: RowDataKey;
  datas: RowData[];
};
/** 行データ削除時 */
export type RowDataDel = {
  key: RowDataKey;
  datas: RowData[];
};
/** 行データドラッグ */
export type RowDataDrag = {
  key: RowDataKey;
  datas: RowData[];
  addIds: (string | null)[]; // ※nullの場合最終行に移動
};
/** 行データ編集イベント */
export type RowDataEditEvent =
  | RowDataSet
  | RowDataAdd
  | RowDataUpd
  | RowDataDel
  | RowDataDrag;
/** 行データ編集タイプ */
export type RowDataEditType =
  (typeof Const.ROW_DATA_EDIT_TYPE)[keyof typeof Const.ROW_DATA_EDIT_TYPE];
/** 行データ編集 */
export type RowDataEdit = {
  type: RowDataEditType;
  event: RowDataEditEvent;
};

/********************
 * Other Type
 ********************/
/** 入力値情報 */
export type ValueType = string | boolean | number | null | ValueType[];
/** 支払日情報 */
export type PayDateInfo = {
  date: string | Date;
  closeDay: number;
  payDay: number;
  payMonth: number;
  businessDays: number;
};
/** ソートオプション */
export type SortOption = {
  col: string;
  asc?: boolean;
};
/** 画面表示データ */
export type ScreenDispData = ScreenData & {
  label: string;
  abbr: string;
  icon: string;
};
/** フィルターモデル */
export type FilterInputModel = FilterModel | null | 'none';

/********************
 * Form Type
 ********************/
/** 全値 */
export type FormCtrl =
  | FormControl<ValueType>
  | FormRecord<FormControl<ValueType>>;
