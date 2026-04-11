import { isHoliday } from '@holiday-jp/holiday_jp';
import { FilterModel } from 'ag-grid-community';
import { addDays, DateArg, format } from 'date-fns';
import { Row } from 'src/app/domain/row-data';
import {
  NO_SELECT_VAL,
  ValType,
} from 'src/app/shared/signal-form/signal-form.component';
import { calcResult } from 'src/app/shared/utils/util-formula';
import { Scr, SCR } from 'src/app/shared/utils/util-screen';

/** 日付 */
export const MNG_DATE = {
  START: '2018-01-01',
} as const;

/** 日付フォーマット */
export const DATE_FMT = {
  YYYY_MM_DD: 'yyyy-MM-dd',
  YYYY: 'yyyy',
  YYYY_MM: 'yyyy-MM',
  YY_MM_DD: 'yy-MM-dd',
  YY_MM_DD_HH_MM_SS: 'yy-MM-dd HH:mm:ss',
  YYMMDD_HHMMSS: 'yyMMdd_HHmmss',
} as const;
type DateFmt = (typeof DATE_FMT)[keyof typeof DATE_FMT];

/** 営業日の算出方法 */
export const BIZ_DAYS = {
  ALW: 0,
  PRV: -1,
  NXT: 1,
} as const;
type BizDays = (typeof BIZ_DAYS)[keyof typeof BIZ_DAYS];

/** 営業日の算出方法 リスト */
export const BIZ_DAYS_LIST = [
  { value: BIZ_DAYS.ALW, label: '常時' },
  { value: BIZ_DAYS.PRV, label: '前営業日' },
  { value: BIZ_DAYS.NXT, label: '翌営業日' },
] as const satisfies { value: BizDays; label: string }[];

/** 支払日情報 */
export type PayDateInf = {
  date: string | Date;
  closeDay: number;
  payDay: number;
  payMonth: number;
  businessDays: number;
};

/** フィルターモデル */
export type FilterInputModel = FilterModel | null | 'none';
/** フィルターモデル編集 */
export type FilterEdt = {
  tbl: Tbl;
  filter: FilterInputModel;
};
/** データKey更新 */
export type RowsKeyEdt = {
  tbl: Tbl;
  key: string;
};

/** 列データ更新 */
export type ColEdt = {
  tbl: Tbl;
  cols: Row[];
};

/** 入力モード */
export const MEMO_MODE = {
  LIST: 'li',
  DETAIL: 'dt',
} as const;

/** 完了ステータス */
export const COMP_STATUS = {
  /** 新規 */
  OPEN: 0,
  /** 実施中 */
  DOING: 1,
  /** 予定 */
  TODO: 2,
  /** 一時停止 */
  PENDING: 3,
  /** 完了 */
  DONE: 4,
  /** キャンセル */
  CANCELED: 11,
  /** クローズ */
  CLOSE: 20,
} as const;
type CompStatus = (typeof COMP_STATUS)[keyof typeof COMP_STATUS];

/** 完了ステータス */
export const COMP_STATUS_LIST = [
  { value: COMP_STATUS.OPEN, label: 'Open' },
  { value: COMP_STATUS.TODO, label: 'Todo' },
  { value: COMP_STATUS.DOING, label: 'Doing' },
  { value: COMP_STATUS.PENDING, label: 'Pending' },
  { value: COMP_STATUS.DONE, label: 'Done' },
  { value: COMP_STATUS.CANCELED, label: 'Canceled' },
  { value: COMP_STATUS.CLOSE, label: 'Close' },
] as const satisfies { value: CompStatus; label: string }[];

/** 入力モード */
export const INPUT_MODE = {
  /** 初期状態 */
  NONE: 0,
  /** 必須項目未入力あり */
  SOME_REQ: 1,
  /** 必須項目未入力なし */
  ALL_REQ: 2,
} as const;
export type InputMode = (typeof INPUT_MODE)[keyof typeof INPUT_MODE];

/** テーブル */
export const TBL = {
  MAIN: 'md',
  STORAGE: 'st',
  CREDIT: 'cr',
  ITEM: 'it',
  REMARK: 'rm',
  SUMMARY: 'sm',
  MEMO: 'mm',
  SCHEDULE: 'sc',
} as const;
export type Tbl = (typeof TBL)[keyof typeof TBL];

/** 共通カラム */
export const CMN_COL = {
  /** 一意なID */
  ID: 'id',
  /** ラベル */
  LABEL: 'lb',
  /** 更新フラグ */
  UPDATE: 'up',
  /** 最終更新日時 */
  UPD_DATE_TIME: 'ud',
  /** 有効フラグ */
  VALID: 'vd',
  /** 入力モード */
  INPUT_MODE: 'im',
} as const;
type CmnCol = (typeof CMN_COL)[keyof typeof CMN_COL];

/** Main カラム */
export const MAIN_COL = {
  ...CMN_COL,
  DATE: 'dt',
  AMOUNT: 'am',
  AMOUNT_NUM: 'an',
  MEMO: 'mm',
  STORAGE: 'st',
  CREDIT: 'cr',
  ITEM: 'it',
  REMARK: 'rm',
  USE_DATE: 'sd',
  PAY_DATE: 'pd',
} as const;
export type MainCol = (typeof MAIN_COL)[keyof typeof MAIN_COL];

/** Storage カラム */
export const STG_COL = {
  ...CMN_COL,
  BANK: 'bn',
  BRANCH: 'br',
  SUBJECT: 'sb',
  SAVINGS: 'sv',
  LAST_SAVINGS: 'ls',
} as const;
type StgCol = (typeof STG_COL)[keyof typeof STG_COL];

/** Credit カラム */
export const CRD_COL = {
  ...CMN_COL,
  CLOSE_DAY: 'cd',
  PAY_DAY: 'pd',
  PAY_MONTH: 'pm',
  BUSINESS_DAYS: 'bd',
  CARD: 'ca',
  EXPENSES_TWO_MONTHS_AGO: 'e2',
  EXPENSES_LAST_MONTH: 'el',
  EXPENSES_THIS_MONTH: 'et',
  EXPENSES_NEXT_MONTH: 'en',
  EXPENSES_CUSTOM_MONTH: 'ec',
} as const;
type CrdCol = (typeof CRD_COL)[keyof typeof CRD_COL];

/** Item カラム */
export const ITM_COL = { ...CMN_COL, SUMMARY_COUNT_FLG: 'sc' } as const;
type ItmCol = (typeof ITM_COL)[keyof typeof ITM_COL];

/** Remark カラム */
export const RMK_COL = {
  ...CMN_COL,
  MEMO: 'mm',
  INC_AND_EXP: 'ie',
  INCOME: 'in',
  EXPENSES: 'ex',
} as const;
type RmkCol = (typeof RMK_COL)[keyof typeof RMK_COL];

/** Summary カラム */
export const SMR_COL = {
  ...CMN_COL,
  DATE: 'dt',
  INCOME: 'in',
  EXPENSES: 'ex',
  INC_AND_EXP: 'ie',
  SAVINGS: 'sv',
  INC_AND_EXP_HIDDEN: 'sh',
  ITEM: 'it',
} as const;
type SmrCol = (typeof SMR_COL)[keyof typeof SMR_COL];

/** Memo カラム */
export const MEM_COL = {
  ...CMN_COL,
  DISPLAY_COLUMNS: 'dc',
  VALID_COLUMNS: 'vc',
  DETAIL_COUNT: 'ct',
  MODE: 'md',
  DATE: 'dt',
  AMOUNT: 'am',
  AMOUNT_NUM: 'an',
  DETAIL: 'dl',
  STATUS: 'st',
  COMPLETE_DATE: 'cd',
} as const;
type MemCol = (typeof MEM_COL)[keyof typeof MEM_COL];

/** Schedule カラム */
export const SCD_COL = {
  ...CMN_COL,
  SEARCH_MEMO: 'sm',
  MEMO_PLUS_A: 'mp',
} as const;
type ScdCol = (typeof SCD_COL)[keyof typeof SCD_COL];

/** 列データ設定項目 */
export const EDT_COL_ID = {
  /** 列ID */
  ID: 'id',
  /** 列名 */
  LABEL: 'lb',
  /** 値 */
  VALUE: 'vl',
  /** 列表示フラグ */
  DISP: 'dp',
  /** 表示順 */
  DISP_ORDER: 'do',
  /** 入力子画面表示フラグ */
  DIALOG: 'dl',
  /** デフォルト値 */
  DEF_VAL: 'dv',
  /** 保存フラグ */
  SAVE: 'sv',
  /** 保存時デフォルト値 (保存を省略する値) */
  SAVE_DEF_VAL: 'sd',
} as const;
export type EdtColId = (typeof EDT_COL_ID)[keyof typeof EDT_COL_ID];
type EdtColParamType = {
  [EDT_COL_ID.ID]: string;
  [EDT_COL_ID.LABEL]: string;
  [EDT_COL_ID.VALUE]: ValType;
  [EDT_COL_ID.DISP]: boolean;
  [EDT_COL_ID.DISP_ORDER]: number;
  [EDT_COL_ID.DIALOG]: boolean;
  [EDT_COL_ID.DEF_VAL]: ValType;
  [EDT_COL_ID.SAVE]: boolean;
  [EDT_COL_ID.SAVE_DEF_VAL]: ValType;
};
type EdtColType = {
  title: string;
  scrId: Scr; // TODO: 履歴を残すときに個別で画面IDを設定する予定。こちらは廃止予定。テーブルと画面が1対1にならないように。
  items: Record<string, EdtColParamType>;
};

export const EDIT_COL_DATA_DEF_VAL = {
  [TBL.MAIN]: {
    title: 'Money Diary',
    scrId: SCR.MAIN,
    items: {
      [MAIN_COL.ID]: {
        [EDT_COL_ID.ID]: MAIN_COL.ID,
        [EDT_COL_ID.LABEL]: 'ID',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 0,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [MAIN_COL.LABEL]: {
        [EDT_COL_ID.ID]: MAIN_COL.LABEL,
        [EDT_COL_ID.LABEL]: 'Label',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 1,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [MAIN_COL.UPDATE]: {
        [EDT_COL_ID.ID]: MAIN_COL.UPDATE,
        [EDT_COL_ID.LABEL]: 'Upd Flg',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 2,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: false,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: false,
      },
      [MAIN_COL.UPD_DATE_TIME]: {
        [EDT_COL_ID.ID]: MAIN_COL.UPD_DATE_TIME,
        [EDT_COL_ID.LABEL]: 'Upd Date Time',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 3,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [MAIN_COL.VALID]: {
        [EDT_COL_ID.ID]: MAIN_COL.VALID,
        [EDT_COL_ID.LABEL]: 'Valid',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 4,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: true,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: true,
      },
      [MAIN_COL.INPUT_MODE]: {
        [EDT_COL_ID.ID]: MAIN_COL.INPUT_MODE,
        [EDT_COL_ID.LABEL]: 'Input Mode',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 5,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: INPUT_MODE.NONE,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: INPUT_MODE.ALL_REQ,
      },
      [MAIN_COL.DATE]: {
        [EDT_COL_ID.ID]: MAIN_COL.DATE,
        [EDT_COL_ID.LABEL]: 'Date',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 6,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: null,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: null,
      },
      [MAIN_COL.AMOUNT]: {
        [EDT_COL_ID.ID]: MAIN_COL.AMOUNT,
        [EDT_COL_ID.LABEL]: 'Amount',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 7,
        [EDT_COL_ID.DIALOG]: true,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [MAIN_COL.AMOUNT_NUM]: {
        [EDT_COL_ID.ID]: MAIN_COL.AMOUNT_NUM,
        [EDT_COL_ID.LABEL]: 'Amount Num',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 8,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: Number.NaN,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: Number.NaN,
      },
      [MAIN_COL.MEMO]: {
        [EDT_COL_ID.ID]: MAIN_COL.MEMO,
        [EDT_COL_ID.LABEL]: 'Memo',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 9,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [MAIN_COL.STORAGE]: {
        [EDT_COL_ID.ID]: MAIN_COL.STORAGE,
        [EDT_COL_ID.LABEL]: 'Storage',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 10,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: NO_SELECT_VAL.ID,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: NO_SELECT_VAL.ID,
      },
      [MAIN_COL.CREDIT]: {
        [EDT_COL_ID.ID]: MAIN_COL.CREDIT,
        [EDT_COL_ID.LABEL]: 'Credit',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 11,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: NO_SELECT_VAL.ID,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: NO_SELECT_VAL.ID,
      },
      [MAIN_COL.ITEM]: {
        [EDT_COL_ID.ID]: MAIN_COL.ITEM,
        [EDT_COL_ID.LABEL]: 'Item',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 12,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: NO_SELECT_VAL.ID,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: NO_SELECT_VAL.ID,
      },
      [MAIN_COL.REMARK]: {
        [EDT_COL_ID.ID]: MAIN_COL.REMARK,
        [EDT_COL_ID.LABEL]: 'Remark',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 13,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: NO_SELECT_VAL.ID,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: NO_SELECT_VAL.ID,
      },
      [MAIN_COL.USE_DATE]: {
        [EDT_COL_ID.ID]: MAIN_COL.USE_DATE,
        [EDT_COL_ID.LABEL]: 'Use Date',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 14,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: null,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: null,
      },
      [MAIN_COL.PAY_DATE]: {
        [EDT_COL_ID.ID]: MAIN_COL.PAY_DATE,
        [EDT_COL_ID.LABEL]: 'Pay Date',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 15,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: null,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: null,
      },
    },
  },
  [TBL.STORAGE]: {
    title: 'Storage',
    scrId: SCR.STORAGE,
    items: {
      [STG_COL.ID]: {
        [EDT_COL_ID.ID]: STG_COL.ID,
        [EDT_COL_ID.LABEL]: 'ID',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 0,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [STG_COL.LABEL]: {
        [EDT_COL_ID.ID]: STG_COL.LABEL,
        [EDT_COL_ID.LABEL]: 'Label',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 1,
        [EDT_COL_ID.DIALOG]: true,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [STG_COL.UPDATE]: {
        [EDT_COL_ID.ID]: STG_COL.UPDATE,
        [EDT_COL_ID.LABEL]: 'Upd Flg',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 2,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: false,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: false,
      },
      [STG_COL.UPD_DATE_TIME]: {
        [EDT_COL_ID.ID]: STG_COL.UPD_DATE_TIME,
        [EDT_COL_ID.LABEL]: 'Upd Date Time',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 3,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [STG_COL.VALID]: {
        [EDT_COL_ID.ID]: STG_COL.VALID,
        [EDT_COL_ID.LABEL]: 'Valid',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 4,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: true,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: true,
      },
      [STG_COL.INPUT_MODE]: {
        [EDT_COL_ID.ID]: STG_COL.INPUT_MODE,
        [EDT_COL_ID.LABEL]: 'Input Mode',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 5,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: INPUT_MODE.NONE,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: INPUT_MODE.ALL_REQ,
      },
      [STG_COL.BANK]: {
        [EDT_COL_ID.ID]: STG_COL.BANK,
        [EDT_COL_ID.LABEL]: 'Bank',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 6,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [STG_COL.BRANCH]: {
        [EDT_COL_ID.ID]: STG_COL.BRANCH,
        [EDT_COL_ID.LABEL]: 'Branch',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 7,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [STG_COL.SUBJECT]: {
        [EDT_COL_ID.ID]: STG_COL.SUBJECT,
        [EDT_COL_ID.LABEL]: 'Subject',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 8,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [STG_COL.SAVINGS]: {
        [EDT_COL_ID.ID]: STG_COL.SAVINGS,
        [EDT_COL_ID.LABEL]: 'Savings',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 9,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 0,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: 0,
      },
      [STG_COL.LAST_SAVINGS]: {
        [EDT_COL_ID.ID]: STG_COL.LAST_SAVINGS,
        [EDT_COL_ID.LABEL]: 'Last Savings',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 10,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 0,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: 0,
      },
    },
  },
  [TBL.CREDIT]: {
    title: 'Credit',
    scrId: SCR.CREDIT,
    items: {
      [CRD_COL.ID]: {
        [EDT_COL_ID.ID]: CRD_COL.ID,
        [EDT_COL_ID.LABEL]: 'ID',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 0,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [CRD_COL.LABEL]: {
        [EDT_COL_ID.ID]: CRD_COL.LABEL,
        [EDT_COL_ID.LABEL]: 'Label',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 1,
        [EDT_COL_ID.DIALOG]: true,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [CRD_COL.UPDATE]: {
        [EDT_COL_ID.ID]: CRD_COL.UPDATE,
        [EDT_COL_ID.LABEL]: 'Upd Flg',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 2,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: false,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: false,
      },
      [CRD_COL.UPD_DATE_TIME]: {
        [EDT_COL_ID.ID]: CRD_COL.UPD_DATE_TIME,
        [EDT_COL_ID.LABEL]: 'Upd Date Time',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 3,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [CRD_COL.VALID]: {
        [EDT_COL_ID.ID]: CRD_COL.VALID,
        [EDT_COL_ID.LABEL]: 'Valid',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 4,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: true,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: true,
      },
      [CRD_COL.INPUT_MODE]: {
        [EDT_COL_ID.ID]: CRD_COL.INPUT_MODE,
        [EDT_COL_ID.LABEL]: 'Input Mode',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 5,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: INPUT_MODE.NONE,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: INPUT_MODE.ALL_REQ,
      },
      [CRD_COL.CLOSE_DAY]: {
        [EDT_COL_ID.ID]: CRD_COL.CLOSE_DAY,
        [EDT_COL_ID.LABEL]: 'Close Day',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 6,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 1,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: 1,
      },
      [CRD_COL.PAY_DAY]: {
        [EDT_COL_ID.ID]: CRD_COL.PAY_DAY,
        [EDT_COL_ID.LABEL]: 'Pay Day',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 7,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 1,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: 1,
      },
      [CRD_COL.PAY_MONTH]: {
        [EDT_COL_ID.ID]: CRD_COL.PAY_MONTH,
        [EDT_COL_ID.LABEL]: 'Pay Month',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 8,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 1,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: 1,
      },
      [CRD_COL.BUSINESS_DAYS]: {
        [EDT_COL_ID.ID]: CRD_COL.BUSINESS_DAYS,
        [EDT_COL_ID.LABEL]: 'Business Days',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 9,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: BIZ_DAYS.NXT,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: BIZ_DAYS.NXT,
      },
      [CRD_COL.CARD]: {
        [EDT_COL_ID.ID]: CRD_COL.CARD,
        [EDT_COL_ID.LABEL]: 'Card',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 10,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [CRD_COL.EXPENSES_TWO_MONTHS_AGO]: {
        [EDT_COL_ID.ID]: CRD_COL.EXPENSES_TWO_MONTHS_AGO,
        [EDT_COL_ID.LABEL]: '',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 11,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 0,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: 0,
      },
      [CRD_COL.EXPENSES_LAST_MONTH]: {
        [EDT_COL_ID.ID]: CRD_COL.EXPENSES_LAST_MONTH,
        [EDT_COL_ID.LABEL]: '',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 12,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 0,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: 0,
      },
      [CRD_COL.EXPENSES_THIS_MONTH]: {
        [EDT_COL_ID.ID]: CRD_COL.EXPENSES_THIS_MONTH,
        [EDT_COL_ID.LABEL]: '',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 13,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 0,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: 0,
      },
      [CRD_COL.EXPENSES_NEXT_MONTH]: {
        [EDT_COL_ID.ID]: CRD_COL.EXPENSES_NEXT_MONTH,
        [EDT_COL_ID.LABEL]: '',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 14,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 0,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: 0,
      },
      [CRD_COL.EXPENSES_CUSTOM_MONTH]: {
        [EDT_COL_ID.ID]: CRD_COL.EXPENSES_CUSTOM_MONTH,
        [EDT_COL_ID.LABEL]: '',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 15,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 0,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: 0,
      },
    },
  },
  [TBL.ITEM]: {
    title: 'Item',
    scrId: SCR.ITEM,
    items: {
      [ITM_COL.ID]: {
        [EDT_COL_ID.ID]: ITM_COL.ID,
        [EDT_COL_ID.LABEL]: 'ID',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 0,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [ITM_COL.LABEL]: {
        [EDT_COL_ID.ID]: ITM_COL.LABEL,
        [EDT_COL_ID.LABEL]: 'Label',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 1,
        [EDT_COL_ID.DIALOG]: true,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [ITM_COL.UPDATE]: {
        [EDT_COL_ID.ID]: ITM_COL.UPDATE,
        [EDT_COL_ID.LABEL]: 'Upd Flg',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 2,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: false,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: false,
      },
      [ITM_COL.UPD_DATE_TIME]: {
        [EDT_COL_ID.ID]: ITM_COL.UPD_DATE_TIME,
        [EDT_COL_ID.LABEL]: 'Upd Date Time',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 3,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [ITM_COL.VALID]: {
        [EDT_COL_ID.ID]: ITM_COL.VALID,
        [EDT_COL_ID.LABEL]: 'Valid',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 4,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: true,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: true,
      },
      [ITM_COL.INPUT_MODE]: {
        [EDT_COL_ID.ID]: ITM_COL.INPUT_MODE,
        [EDT_COL_ID.LABEL]: 'Input Mode',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 5,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: INPUT_MODE.NONE,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: INPUT_MODE.ALL_REQ,
      },
      [ITM_COL.SUMMARY_COUNT_FLG]: {
        [EDT_COL_ID.ID]: ITM_COL.SUMMARY_COUNT_FLG,
        [EDT_COL_ID.LABEL]: 'Summary Count',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 6,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: true,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: true,
      },
    },
  },
  [TBL.REMARK]: {
    title: 'Remark',
    scrId: SCR.REMARK,
    items: {
      [RMK_COL.ID]: {
        [EDT_COL_ID.ID]: RMK_COL.ID,
        [EDT_COL_ID.LABEL]: 'ID',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 0,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [RMK_COL.LABEL]: {
        [EDT_COL_ID.ID]: RMK_COL.LABEL,
        [EDT_COL_ID.LABEL]: 'Label',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 1,
        [EDT_COL_ID.DIALOG]: true,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [RMK_COL.UPDATE]: {
        [EDT_COL_ID.ID]: RMK_COL.UPDATE,
        [EDT_COL_ID.LABEL]: 'Upd Flg',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 2,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: false,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: false,
      },
      [RMK_COL.UPD_DATE_TIME]: {
        [EDT_COL_ID.ID]: RMK_COL.UPD_DATE_TIME,
        [EDT_COL_ID.LABEL]: 'Upd Date Time',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 3,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [RMK_COL.VALID]: {
        [EDT_COL_ID.ID]: RMK_COL.VALID,
        [EDT_COL_ID.LABEL]: 'Valid',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 4,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: true,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: true,
      },
      [RMK_COL.INPUT_MODE]: {
        [EDT_COL_ID.ID]: RMK_COL.INPUT_MODE,
        [EDT_COL_ID.LABEL]: 'Input Mode',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 5,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: INPUT_MODE.NONE,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: INPUT_MODE.ALL_REQ,
      },
      [RMK_COL.MEMO]: {
        [EDT_COL_ID.ID]: RMK_COL.MEMO,
        [EDT_COL_ID.LABEL]: 'Memo',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 6,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [RMK_COL.INC_AND_EXP]: {
        [EDT_COL_ID.ID]: RMK_COL.INC_AND_EXP,
        [EDT_COL_ID.LABEL]: 'Inc And Exp',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 7,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 0,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: 0,
      },
      [RMK_COL.INCOME]: {
        [EDT_COL_ID.ID]: RMK_COL.INCOME,
        [EDT_COL_ID.LABEL]: 'Income',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 8,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 0,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: 0,
      },
      [RMK_COL.EXPENSES]: {
        [EDT_COL_ID.ID]: RMK_COL.EXPENSES,
        [EDT_COL_ID.LABEL]: 'Expenses',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 9,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 0,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: 0,
      },
    },
  },
  [TBL.SUMMARY]: {
    title: 'Summary',
    scrId: SCR.SUMMARY,
    items: {
      [SMR_COL.ID]: {
        [EDT_COL_ID.ID]: SMR_COL.ID,
        [EDT_COL_ID.LABEL]: 'ID',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 0,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [SMR_COL.LABEL]: {
        [EDT_COL_ID.ID]: SMR_COL.LABEL,
        [EDT_COL_ID.LABEL]: 'Label',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 1,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [SMR_COL.UPDATE]: {
        [EDT_COL_ID.ID]: SMR_COL.UPDATE,
        [EDT_COL_ID.LABEL]: 'Upd Flg',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 2,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: false,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: false,
      },
      [SMR_COL.UPD_DATE_TIME]: {
        [EDT_COL_ID.ID]: SMR_COL.UPD_DATE_TIME,
        [EDT_COL_ID.LABEL]: 'Upd Date Time',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 3,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [SMR_COL.VALID]: {
        [EDT_COL_ID.ID]: SMR_COL.VALID,
        [EDT_COL_ID.LABEL]: 'Valid',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 4,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: true,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: true,
      },
      [SMR_COL.INPUT_MODE]: {
        [EDT_COL_ID.ID]: SMR_COL.INPUT_MODE,
        [EDT_COL_ID.LABEL]: 'Input Mode',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 5,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: INPUT_MODE.NONE,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: INPUT_MODE.ALL_REQ,
      },
    },
    // TODO: 集計画面の列は日付にする予定。可変になる列はここに定義しない。
  },
  [TBL.MEMO]: {
    title: 'Memo',
    scrId: SCR.MEMO,
    items: {
      [MEM_COL.ID]: {
        [EDT_COL_ID.ID]: MEM_COL.ID,
        [EDT_COL_ID.LABEL]: 'ID',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 0,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [MEM_COL.LABEL]: {
        [EDT_COL_ID.ID]: MEM_COL.LABEL,
        [EDT_COL_ID.LABEL]: 'Label',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 1,
        [EDT_COL_ID.DIALOG]: true,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [MEM_COL.UPDATE]: {
        [EDT_COL_ID.ID]: MEM_COL.UPDATE,
        [EDT_COL_ID.LABEL]: 'Upd Flg',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 2,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: false,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: false,
      },
      [MEM_COL.UPD_DATE_TIME]: {
        [EDT_COL_ID.ID]: MEM_COL.UPD_DATE_TIME,
        [EDT_COL_ID.LABEL]: 'Upd Date Time',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 3,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [MEM_COL.VALID]: {
        [EDT_COL_ID.ID]: MEM_COL.VALID,
        [EDT_COL_ID.LABEL]: 'Valid',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 4,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: true,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: true,
      },
      [MEM_COL.INPUT_MODE]: {
        [EDT_COL_ID.ID]: MEM_COL.INPUT_MODE,
        [EDT_COL_ID.LABEL]: 'Input Mode',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 5,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: INPUT_MODE.NONE,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: INPUT_MODE.ALL_REQ,
      },
      [MEM_COL.DISPLAY_COLUMNS]: {
        [EDT_COL_ID.ID]: MEM_COL.DISPLAY_COLUMNS,
        [EDT_COL_ID.LABEL]: 'Display Columns',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 6,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: [],
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: [],
      },
      [MEM_COL.VALID_COLUMNS]: {
        [EDT_COL_ID.ID]: MEM_COL.VALID_COLUMNS,
        [EDT_COL_ID.LABEL]: 'Valid Columns',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 7,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: [],
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: [],
      },
      [MEM_COL.DETAIL_COUNT]: {
        [EDT_COL_ID.ID]: MEM_COL.DETAIL_COUNT,
        [EDT_COL_ID.LABEL]: 'Detail Count',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 8,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: 0,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: 0,
      },
      [MEM_COL.MODE]: {
        [EDT_COL_ID.ID]: MEM_COL.MODE,
        [EDT_COL_ID.LABEL]: 'Mode',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 9,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: MEMO_MODE.DETAIL,
      },
      [MEM_COL.DATE]: {
        [EDT_COL_ID.ID]: MEM_COL.DATE,
        [EDT_COL_ID.LABEL]: 'Date',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 10,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: null,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: null,
      },
      [MEM_COL.AMOUNT]: {
        [EDT_COL_ID.ID]: MEM_COL.AMOUNT,
        [EDT_COL_ID.LABEL]: 'Amount',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 11,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [MEM_COL.AMOUNT_NUM]: {
        [EDT_COL_ID.ID]: MEM_COL.AMOUNT_NUM,
        [EDT_COL_ID.LABEL]: 'Amount Num',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 12,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: Number.NaN,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: Number.NaN,
      },
      [MEM_COL.DETAIL]: {
        [EDT_COL_ID.ID]: MEM_COL.DETAIL,
        [EDT_COL_ID.LABEL]: 'Detail',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 13,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [MEM_COL.STATUS]: {
        [EDT_COL_ID.ID]: MEM_COL.STATUS,
        [EDT_COL_ID.LABEL]: 'Status',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 14,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: COMP_STATUS.OPEN,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: COMP_STATUS.CLOSE,
      },
      [MEM_COL.COMPLETE_DATE]: {
        [EDT_COL_ID.ID]: MEM_COL.COMPLETE_DATE,
        [EDT_COL_ID.LABEL]: 'Complete Date',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 15,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: null,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: null,
      },
    },
  },
  [TBL.SCHEDULE]: {
    title: 'Schedule',
    scrId: SCR.SCHEDULE,
    items: {
      [SCD_COL.ID]: {
        [EDT_COL_ID.ID]: SCD_COL.ID,
        [EDT_COL_ID.LABEL]: 'ID',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 0,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [SCD_COL.LABEL]: {
        [EDT_COL_ID.ID]: SCD_COL.LABEL,
        [EDT_COL_ID.LABEL]: 'Label',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: true,
        [EDT_COL_ID.DISP_ORDER]: 1,
        [EDT_COL_ID.DIALOG]: true,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [SCD_COL.UPDATE]: {
        [EDT_COL_ID.ID]: SCD_COL.UPDATE,
        [EDT_COL_ID.LABEL]: 'Upd Flg',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 2,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: false,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: false,
      },
      [SCD_COL.UPD_DATE_TIME]: {
        [EDT_COL_ID.ID]: SCD_COL.UPD_DATE_TIME,
        [EDT_COL_ID.LABEL]: 'Upd Date Time',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 3,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [SCD_COL.VALID]: {
        [EDT_COL_ID.ID]: SCD_COL.VALID,
        [EDT_COL_ID.LABEL]: 'Valid',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 4,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: true,
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: true,
      },
      [SCD_COL.INPUT_MODE]: {
        [EDT_COL_ID.ID]: SCD_COL.INPUT_MODE,
        [EDT_COL_ID.LABEL]: 'Input Mode',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 5,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: INPUT_MODE.NONE,
        [EDT_COL_ID.SAVE]: false,
        [EDT_COL_ID.SAVE_DEF_VAL]: INPUT_MODE.ALL_REQ,
      },
      [SCD_COL.SEARCH_MEMO]: {
        [EDT_COL_ID.ID]: SCD_COL.SEARCH_MEMO,
        [EDT_COL_ID.LABEL]: 'Search Memo',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 6,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: '',
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: '',
      },
      [SCD_COL.MEMO_PLUS_A]: {
        [EDT_COL_ID.ID]: SCD_COL.MEMO_PLUS_A,
        [EDT_COL_ID.LABEL]: 'Memo Plus A',
        [EDT_COL_ID.VALUE]: '',
        [EDT_COL_ID.DISP]: false,
        [EDT_COL_ID.DISP_ORDER]: 7,
        [EDT_COL_ID.DIALOG]: false,
        [EDT_COL_ID.DEF_VAL]: [],
        [EDT_COL_ID.SAVE]: true,
        [EDT_COL_ID.SAVE_DEF_VAL]: [],
      },
    },
    // TODO: 制作中
  },
} as const satisfies Record<Tbl, EdtColType>;

/** 行データ編集共通 */
type RowEdtCmn = {
  tbl: Tbl;
  rk: string;
};
/** 行データ編集 */
export type RowEdt = RowEdtCmn &
  (
    | {
        /** 行データ追加時 */
        type: typeof TBL_EDIT_TYPE.ADD;
        rows: Row[];
        addIds: ValType[]; // ※nullの場合最終行に追加
      }
    | {
        /** 行データ更新時 */
        type: typeof TBL_EDIT_TYPE.UPD;
        rows: Row[];
      }
    | {
        /** 行データ削除時 */
        type: typeof TBL_EDIT_TYPE.DEL;
        delIds: ValType[];
      }
    | {
        /** 行データ移動時 */
        type: typeof TBL_EDIT_TYPE.DRG;
        delIds: ValType[];
        addIds: ValType[]; // ※nullの場合最終行に移動
      }
  );

/** テーブルデータ編集タイプ */
export const TBL_EDIT_TYPE = {
  ADD: 'ad',
  UPD: 'up',
  DEL: 'dl',
  DRG: 'dg',
} as const;

/** テーブルデータ編集タイプ */
export const TBL_ADD_POS = {
  MIN: '-1',
  MAX: null,
} as const satisfies Record<string, ValType>;

/**
 * 日付を指定フォーマットの文字列に変換する
 * @param date 日付
 * @param format フォーマット
 * @returns 日付文字列
 */
export const cvtDateToStr = (
  date: DateArg<Date> = new Date(),
  fmtStr: string = DATE_FMT.YYYY_MM_DD,
) => {
  return format(date, fmtStr);
};

/**
 * 支払日を返却する
 * @param date 日付(利用日)
 * @param credit クレジットカードNo
 * @param creditList クレジットカード情報一覧
 * @param format フォーマット
 * @returns 支払日
 */
export const getPayDate = (
  date: Object | null,
  credit: Object | null,
  creditList: Row[],
  format: string = DATE_FMT.YYYY_MM_DD,
): string => {
  if (typeof date !== 'string' || typeof credit !== 'string') {
    return '';
  }

  const creditInf = creditList.find((data) => data[CRD_COL.ID] === credit);

  if (!creditInf || creditInf[CRD_COL.ID] === NO_SELECT_VAL.ID) {
    return date;
  }

  const closeDay = creditInf[CRD_COL.CLOSE_DAY];
  const payDay = creditInf[CRD_COL.PAY_DAY];
  const payMonth = creditInf[CRD_COL.PAY_MONTH];
  const businessDays = creditInf[CRD_COL.BUSINESS_DAYS];

  if (
    typeof closeDay !== 'number' ||
    typeof payDay !== 'number' ||
    typeof payMonth !== 'number' ||
    typeof businessDays !== 'number'
  ) {
    return date;
  }

  return cvtDateToStr(
    calcPayDate({
      date: new Date(date),
      closeDay,
      payDay,
      payMonth,
      businessDays,
    }),
    format,
  );
};

/**
 * クレジットカード情報をもとに支払日を算出する
 * @param payDateInf クレジットカード情報
 * @returns 支払日
 */
const calcPayDate = (payDateInf: PayDateInf): Date => {
  const newDate = new Date(payDateInf.date);
  const addMonth =
    payDateInf.payMonth + (newDate.getDate() <= payDateInf.closeDay ? 0 : 1);
  let payDate =
    payDateInf.payDay >= 29
      ? // 月末
        new Date(newDate.getFullYear(), newDate.getMonth() + addMonth + 1, 0)
      : // 月末以外
        new Date(
          newDate.getFullYear(),
          newDate.getMonth() + addMonth,
          payDateInf.payDay,
        );

  if (payDateInf.businessDays === BIZ_DAYS.ALW) {
    // 支払日に条件がない場合
    return payDate;
  }
  return calcPayDateConsiderHoliday(payDate, payDateInf.businessDays);
};

/**
 * 休日を考慮した支払日を算出する
 * @param payDate 支払日
 * @param businessDays 何日前後させて営業日を検索するか
 * @returns 支払日
 */
export const calcPayDateConsiderHoliday = <T extends string | Date>(
  payDate: T,
  businessDays: number,
): T => {
  for (;;) {
    if (!judgeHoliday(payDate)) {
      // 支払日が休日・祝日でない場合
      return payDate;
    }

    // 支払日が休日・祝日の場合
    const addDate = addDays(payDate, businessDays);
    if (typeof payDate === 'string') {
      payDate = cvtDateToStr(addDate) as T;
    } else {
      payDate = addDate as T;
    }
  }
};

/**
 * 休日・祝日かどうかを判定する
 * @param date 日付
 * @returns true: 休日・祝日
 */
const judgeHoliday = (date: string | Date): boolean => {
  // 休日判定
  const newDate = new Date(date);
  if (newDate.getDay() === 0 || newDate.getDay() === 6) {
    return true;
  }

  // 祝日判定
  return isHoliday(newDate);
};

/** テーブル名を返却する */
export const getTblName = (tbl: Tbl): string => {
  return EDIT_COL_DATA_DEF_VAL[tbl].title;
};

/** 画面IDを返却する */ // TODO: 廃止予定
export const getTblScrId = (tbl: Tbl): Scr => {
  return EDIT_COL_DATA_DEF_VAL[tbl].scrId;
};

/**
 * 指定したテーブルの全カラム・カスタムIDの値を返却する
 * @param tbl
 * @returns
 */
export const getAllColAndCustomIdValsByTbl = (
  tbl: Tbl,
): Record<string, EdtColParamType> => {
  return EDIT_COL_DATA_DEF_VAL[tbl].items;
};

/**
 * 指定したテーブルの全カラムの指定したカスタムIDの値を返却する
 * @param tbl
 * @param id
 * @returns
 */
export const getColValsByTblAndCustomId = (
  tbl: Tbl,
  id: EdtColId = EDT_COL_ID.DEF_VAL,
): Row => {
  return Object.entries(getAllColAndCustomIdValsByTbl(tbl)).reduce(
    (acc, [col, info]) => {
      return { ...acc, [col]: info[id] };
    },
    {} as Row,
  );
};

/**
 * 指定したテーブル・カラム・カスタムIDの値を返却する
 * @param tbl
 * @param col
 * @param id
 * @returns
 */
export const getValByTblColAndCustomId = (
  tbl: Tbl,
  col: string,
  id: EdtColId = EDT_COL_ID.DEF_VAL,
): ValType => {
  return getColValsByTblAndCustomId(tbl, id)[col];
};

/**
 * 指定したテーブル・カラムの全カスタムIDの値を返却する
 * @param tbl
 * @param col
 * @returns
 */
export const getCustomIdValsByTblAndCol = (
  tbl: Tbl,
  col: string,
): EdtColParamType => {
  return getAllColAndCustomIdValsByTbl(tbl)[col];
};

/** 保存するカラムIDを返却する */
export const getSaveCol = (tbl: Tbl): string[] => {
  return Object.entries(EDIT_COL_DATA_DEF_VAL[tbl]).reduce(
    (acc, [col, info]) => {
      return info[EDT_COL_ID.SAVE] ? [...acc, col] : acc;
    },
    [] as string[],
  );
};

/** 保存時のデフォルト行データを返却する */
export const getSaveDefRow = (tbl: Tbl): Row => {
  return Object.entries(EDIT_COL_DATA_DEF_VAL[tbl]).reduce(
    (acc, [col, info]) => {
      return { ...acc, [col]: info[EDT_COL_ID.SAVE_DEF_VAL] };
    },
    {} as Row,
  );
};

/** 保存時のデフォルト値を返却する */
export const getSaveDefVal = (tbl: Tbl, col: string): ValType => {
  return getSaveDefRow(tbl)[col];
};

/** ソートオプション */
export type SortOpt = {
  col: string;
  asc?: boolean;
};

/** 行データをソートオプション順に並び替える */
export const sortRow = (
  rows: Row[],
  sortOpts: SortOpt[],
  useToSorted: boolean = true,
): Row[] =>
  useToSorted
    ? rows.toSorted((a, b) => sortCmnPrc(a, b, sortOpts))
    : rows.sort((a, b) => sortCmnPrc(a, b, sortOpts));

/** ソート共通処理 */
export const sortCmnPrc = (
  a: Row | undefined,
  b: Row | undefined,
  sortOpts: SortOpt[],
): number => {
  if (sortOpts.length === 0) {
    return 0;
  }

  const col = sortOpts[0].col;
  const asc = sortOpts[0].asc ?? true;

  if (!a || !b || !(col in a) || !(col in b)) {
    return 0;
  }

  const aVal = a[col];
  const bVal = b[col];

  if (
    aVal === bVal ||
    ((aVal === '' || aVal === null) && (bVal === '' || bVal === null))
  ) {
    const nextSortOpt = structuredClone(sortOpts);
    nextSortOpt.shift();
    return sortCmnPrc(a, b, nextSortOpt);
  }

  if (bVal === '' || bVal === null) {
    return -1;
  }

  if (aVal === '' || aVal === null) {
    return 1;
  }

  if (aVal < bVal) {
    if (asc) {
      return -1;
    }

    return 1;
  }

  if (aVal > bVal) {
    if (asc) {
      return 1;
    }

    return -1;
  }

  return 0;
};

/** 入力モードを返却する */
export const getInputMode = (row: Row, tbl?: Tbl): InputMode => {
  if (tbl === TBL.MAIN) {
    // 入力データ用
    const useDateInput = !!row[MAIN_COL.USE_DATE];
    const amtNumInput = calcResult(row[MAIN_COL.AMOUNT]) !== Number.NaN;
    const amtInput = row[MAIN_COL.AMOUNT] !== '';
    const memoInput = !!row[MAIN_COL.MEMO];
    const stgSel = row[MAIN_COL.STORAGE] !== NO_SELECT_VAL.ID;

    if (useDateInput && amtNumInput && memoInput && stgSel) {
      return INPUT_MODE.ALL_REQ;
    } else if (!useDateInput && !amtInput && !memoInput && !stgSel) {
      return INPUT_MODE.NONE;
    }
    return INPUT_MODE.SOME_REQ;
  }

  // 入力データ以外
  const labelInput = !!row[CMN_COL.LABEL];
  if (labelInput) {
    return INPUT_MODE.ALL_REQ;
  }
  return INPUT_MODE.NONE;
};

/** 入力モードが一致しているかをチェックする */
export const checkInputMode = (row: Row, mode: InputMode): boolean => {
  return row[CMN_COL.INPUT_MODE] === mode;
};

/** 空データがあるかチェックする */
export const checkNoneData = (rows: Row[]): boolean => {
  return rows.some((row) => checkInputMode(row, INPUT_MODE.NONE));
};

/** 一意なiDを採番する　※rowIdsを更新する */
export const getNewRowId = (rowIds = new Set<ValType>()): string => {
  const newRowId = (() => {
    const rowCnt = rowIds.size;
    for (let idx = 1; idx < rowCnt + 1; idx++) {
      if (!rowIds.has(idx.toString())) {
        return idx.toString();
      }
    }
    return (rowCnt + 1).toString();
  })();
  rowIds.add(newRowId);
  return newRowId;
};

/** 行データからIDの一覧(Set)を作成して返却する */
export const getRowIdsSet = (rows: Row[]): Set<ValType> => {
  return new Set([...rows.map((row) => row[CMN_COL.ID])]);
};

/** 行データからIDの一覧(Array)を作成して返却する */
export const getRowIds = (rows: Row[]): ValType[] => {
  return rows.map((row) => row[CMN_COL.ID]);
};

/** 行編集更新情報を返却する */
export const getRowEdtUpd = (
  tbl: Tbl,
  updRows: Row[],
  rowIds = new Set<ValType>(),
  updFlg = true, // 更新フラグに設定する値
  rk = '',
): RowEdt => {
  if (!updRows[0][CMN_COL.ID]) {
    // 更新データ数=1 かつ 行IDが未設定の場合、行追加を行う
    return getRowEdtAdd(tbl, updRows, [], rowIds, rk);
  }
  return {
    type: TBL_EDIT_TYPE.UPD,
    tbl,
    rk,
    rows: updRows.map((row) => ({
      ...row,
      [CMN_COL.ID]: row[CMN_COL.ID],
      [CMN_COL.UPDATE]: updFlg,
      [CMN_COL.UPD_DATE_TIME]: cvtDateToStr(
        undefined,
        DATE_FMT.YY_MM_DD_HH_MM_SS,
      ),
      [CMN_COL.INPUT_MODE]: getInputMode(row, tbl),
    })),
  };
};

/** 行編集追加情報を返却する(共通処理) */
const getRowEdtAddCmn = (
  tbl: Tbl,
  addRows: Row[],
  addIds: ValType[] = [],
  rk = '',
): RowEdt => {
  addRows = structuredClone(addRows);
  addIds = [...addIds];
  for (let idx = 0; idx < addRows.length - addIds.length; ) {
    // addIdsのサイズが不足している場合追加する
    addIds.push(null);
  }

  return {
    type: TBL_EDIT_TYPE.ADD,
    tbl,
    rk,
    rows: addRows,
    addIds,
  };
};

/** 行編集追加情報を返却する */
export const getRowEdtAdd = (
  tbl: Tbl,
  addRows: Row[],
  addIds: ValType[] = [],
  rowIds = new Set<ValType>(),
  rk = '',
): RowEdt => {
  return getRowEdtAddCmn(
    tbl,
    [
      ...addRows.map((row) => ({
        ...row,
        [CMN_COL.ID]: getNewRowId(rowIds),
        [CMN_COL.UPDATE]: true,
        [CMN_COL.UPD_DATE_TIME]: cvtDateToStr(
          undefined,
          DATE_FMT.YY_MM_DD_HH_MM_SS,
        ),
        [CMN_COL.INPUT_MODE]: getInputMode(row, tbl),
      })),
    ],
    addIds,
    rk,
  );
};

/** 行編集追加情報(未選択データ)を返却する */
export const getRowEdtAddNoSel = (tbl: Tbl, rk = ''): RowEdt => {
  return getRowEdtAddCmn(
    tbl,
    [
      {
        ...getColValsByTblAndCustomId(tbl),
        [CMN_COL.ID]: NO_SELECT_VAL.ID,
        [CMN_COL.LABEL]: NO_SELECT_VAL.LABEL,
        [CMN_COL.INPUT_MODE]: INPUT_MODE.ALL_REQ,
      },
    ],
    [TBL_ADD_POS.MIN],
    rk,
  );
};

/** 行編集削除情報を返却する */
export const getRowEdtDel = (
  tbl: Tbl,
  delIds: ValType[],
  rowIds = new Set<ValType>(),
  rk = '',
): RowEdt => {
  delIds = [...delIds];
  for (const delId of delIds) {
    rowIds.delete(delId);
  }

  return {
    type: TBL_EDIT_TYPE.DEL,
    tbl,
    rk,
    delIds,
  };
};

/** 行編集移動情報を返却する */
export const getRowEdtDrg = (
  tbl: Tbl,
  delIds: ValType[],
  addIds: ValType[],
  rk = '',
): RowEdt => {
  delIds = [...delIds].filter((id) => !!id);
  addIds = [...addIds].filter((id) => !!id);
  for (const idx of delIds.keys()) {
    if (idx >= addIds.length) {
      // addIdsのサイズが不足している場合追加する
      addIds.push(null);
    }
  }

  return {
    type: TBL_EDIT_TYPE.DRG,
    tbl,
    rk,
    delIds,
    addIds,
  };
};
