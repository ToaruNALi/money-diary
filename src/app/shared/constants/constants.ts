import {
  InputType,
  Scr,
  ScrDspData,
  Tbl,
  ValType,
} from 'src/app/shared/constants/types';

/**************************************************
 * 定数値
 **************************************************/

/** 履歴保持最大件数 */
export const HIST_MAX_LEN = 30;

/** 文字色 */
export const FONT_CLR = {
  DEF: '#BBBEC9', // #BBBEC9
  AMT_NEGA: '#FF7E79', // #FF7E79
  AMT_POSI: '#76D6FF', // #76D6FF
} as const;

/** テーブル行背景色 */
export const ROW_CLR = {
  NONE: '#CCCC0030', // #CCCC0030
  ERROR: '#CC000030', // #CC000030
} as const;

/** ルートパス */
export const ROUTE_PATH = {
  MAIN: 'money-diary',
  ERR: 'error',
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

/** 入力モード */
export const INPUT_MODE = {
  /** 初期状態 */
  NONE: 0,
  /** 必須項目未入力あり */
  SOME_REQ: 1,
  /** 必須項目未入力なし */
  ALL_REQ: 2,
} as const;

/** 日付 */
export const MNG_DATE = {
  START: '2018-01-01',
} as const;

/** 記号 */
export const MARK = {
  NO_SELECT: { id: '0', label: '-' },
} as const;

/** 入力タイプ */
export const INPUT_TYPE = {
  TEXT: 'text',
  NUM: 'number',
  DATE: 'date',
  TEXTAREA: 'textarea',
  CHECK: 'checkbox',
  RADIO: 'radio',
  SELECT: 'select',
  TOGGLE: 'toggle',
  COLOR: 'color',
} as const;

/** 入力フォーム */
export const INPUT_FORM = {
  [INPUT_TYPE.TEXT]: { initVal: '' },
  [INPUT_TYPE.NUM]: { initVal: Number.NaN },
  [INPUT_TYPE.DATE]: { initVal: null },
  [INPUT_TYPE.TEXTAREA]: { initVal: '' },
  [INPUT_TYPE.CHECK]: { initVal: [] as ValType[] },
  [INPUT_TYPE.RADIO]: { initVal: null },
  [INPUT_TYPE.SELECT]: { initVal: '' },
  [INPUT_TYPE.TOGGLE]: { initVal: false },
  [INPUT_TYPE.COLOR]: { initVal: '#00000000' },
} as const satisfies Record<InputType, Record<string, ValType>>;

/** 禁止文字 */
export const INPUT_CHARS = {
  /** 数値と符号以外禁止 */
  FORMULA_FORBIDDEN: /[^0-9+\-*/()]+/g,
  AUTOCOMP_REPLACE: /[.*+?^${}()|[\]\\]/g,
} as const;

/** ファイル名 */
export const FILE_NAME = {
  DL: 'moneyDiary_{0}.json',
} as const;

/** 最大値 */
export const MAX_LEN = {
  SCR_TRANS_MAP: 20,
} as const;

/** 時間[ms] */
export const TIME = {
  /** マップ表示 → 画面遷移 時間 */
  DISP_MAP_BEF_TRAN: 50,
  /** 画面遷移 → マップ非表示 時間 */
  DISP_MAP_AFT_TRAN: 250,
  /** 長押し時のマップ表示時間 */
  DISP_MAP_LONG_CLICK: 500,
  /** UNDO・REDOが行われるまでの時間 */
  UNDO_REDO_BEF: 300,
} as const;

/** テーブルデータ編集タイプ */
export const TBL_EDIT_TYPE = {
  ADD: 'ad',
  UPD: 'up',
  DEL: 'dl',
  DRG: 'dg',
} as const;

export const TBL_ADD_POS = {
  MIN: '-1',
  MAX: null,
} as const satisfies Record<string, ValType>;

/** 予約語 */
export const RESERVED_WORD = /@+/g;

/** 予約語文字列 */
export const RESERVED_STR = {
  ORG: '@o',
  SERIAL_NUM: '@c',
  SERIAL_DATE: '@d',
} as const;

/**************************************************
 * セレクトボックス, チェックボックス, ラジオボタン
 **************************************************/

/** 営業日の算出方法 */
export const BIZ_DAYS = {
  ALW: 0,
  PRV: -1,
  NXT: 1,
} as const;
type BizDays = (typeof BIZ_DAYS)[keyof typeof BIZ_DAYS];

/** 営業日の算出方法 リスト */
export const BIZ_DAYS_LIST = [
  { id: BIZ_DAYS.ALW, lb: '常時' },
  { id: BIZ_DAYS.PRV, lb: '前営業日' },
  { id: BIZ_DAYS.NXT, lb: '翌営業日' },
] as const satisfies { id: BizDays; lb: string }[];

/** 頻度 */
export const FREQ_DWMY = {
  DAY: 'dy',
  WEEK: 'wk',
  MONTH: 'mt',
  YEAR: 'yr',
} as const;
type FrqDWMY = (typeof FREQ_DWMY)[keyof typeof FREQ_DWMY];

/** 頻度 リスト */
export const FREQ_DWMY_LIST = [
  { id: FREQ_DWMY.DAY, lb: 'Day' },
  { id: FREQ_DWMY.WEEK, lb: 'Week' },
  { id: FREQ_DWMY.MONTH, lb: 'Month' },
  { id: FREQ_DWMY.YEAR, lb: 'Year' },
] as const satisfies { id: FrqDWMY; lb: string }[];

/** 曜日 */
export const DAY_OF_WEEK = {
  SUN: 'su',
  MON: 'mo',
  TUE: 'tu',
  WED: 'we',
  THU: 'th',
  FRI: 'fr',
  SAT: 'sa',
} as const;
type DayOfWeek = (typeof DAY_OF_WEEK)[keyof typeof DAY_OF_WEEK];

/** 曜日 */
export const DAY_OF_WEEK_LIST = [
  { id: DAY_OF_WEEK.SUN, lb: 'Sun' },
  { id: DAY_OF_WEEK.MON, lb: 'Mon' },
  { id: DAY_OF_WEEK.TUE, lb: 'Tue' },
  { id: DAY_OF_WEEK.WED, lb: 'Wed' },
  { id: DAY_OF_WEEK.THU, lb: 'Thu' },
  { id: DAY_OF_WEEK.FRI, lb: 'Fri' },
  { id: DAY_OF_WEEK.SAT, lb: 'Sat' },
] as const satisfies { id: DayOfWeek; lb: string }[];

/** 日付連番形式 */
export const SERIAL_DATE_FMT_LIST = [
  { id: DATE_FMT.YYYY, lb: 'Year' },
  { id: DATE_FMT.YYYY_MM, lb: 'Month' },
  { id: DATE_FMT.YY_MM_DD, lb: 'Day' },
] as const satisfies { id: DateFmt; lb: string }[];

/**************************************************
 * 画面情報
 **************************************************/

/** 画面 */
export const SCR = {
  MAIN: 'md',
  STORAGE: 'st',
  CREDIT: 'cr',
  ITEM: 'it',
  REMARK: 'rm',
  SUMMARY: 'sm',
  MEMO: 'mm',
  SCHEDULE: 'sc',
} as const;

/** 画面情報 */
export const SCR_INF = {
  [SCR.MAIN]: {
    lb: 'Money Diary',
    ab: 'Money',
    ic: 'edit',
    od: 1,
    px: 1,
    py: 1,
  },
  [SCR.STORAGE]: {
    lb: 'Storage',
    ab: 'Strg',
    ic: 'storage',
    od: 5,
    px: 0,
    py: 0,
  },
  [SCR.CREDIT]: {
    lb: 'Credit',
    ab: 'Crdt',
    ic: 'credit_card',
    od: 6,
    px: 0,
    py: 1,
  },
  [SCR.ITEM]: {
    lb: 'Item',
    ab: 'Item',
    ic: 'category',
    od: 7,
    px: 0,
    py: 2,
  },
  [SCR.REMARK]: {
    lb: 'Remark',
    ab: 'Rmk',
    ic: 'edit_note',
    od: 8,
    px: 1,
    py: 2,
  },
  [SCR.SUMMARY]: {
    lb: 'Summary',
    ab: 'Smr',
    ic: 'summarize',
    od: 2,
    px: 2,
    py: 1,
  },
  [SCR.MEMO]: {
    lb: 'Memo',
    ab: 'Memo',
    ic: 'note_alt',
    od: 4,
    px: 1,
    py: 0,
  },
  [SCR.SCHEDULE]: {
    lb: 'Schedule',
    ab: 'Scdl',
    ic: 'event_available',
    od: 3,
    px: 2,
    py: 2,
  },
} as const satisfies Record<Scr, ScrDspData>;

/**************************************************
 * テーブル情報
 **************************************************/

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

/** テーブル基本情報 */
export const TBL_BASIC_INF = {
  [TBL.MAIN]: { name: 'Money Diary', scrId: SCR.MAIN },
  [TBL.STORAGE]: { name: 'Storage', scrId: SCR.STORAGE },
  [TBL.CREDIT]: { name: 'Credit', scrId: SCR.CREDIT },
  [TBL.ITEM]: { name: 'Item', scrId: SCR.ITEM },
  [TBL.REMARK]: { name: 'Remark', scrId: SCR.REMARK },
  [TBL.SUMMARY]: { name: 'Summary', scrId: SCR.SUMMARY },
  [TBL.MEMO]: { name: 'Memo', scrId: SCR.MEMO },
  [TBL.SCHEDULE]: { name: 'Schedule', scrId: SCR.SCHEDULE },
} as const satisfies Record<Tbl, Record<string, string>>;

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
  COLOR: 'cl',
} as const;

/** Storage カラム */
export const STG_COL = {
  ...CMN_COL,
  BANK: 'bn',
  BRANCH: 'br',
  SUBJECT: 'sb',
  SAVINGS: 'sv',
  LAST_SAVINGS: 'ls',
} as const;

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

/** Item カラム */
export const ITM_COL = { ...CMN_COL, SUMMARY_COUNT_FLG: 'sc' } as const;

/** Remark カラム */
export const RMK_COL = {
  ...CMN_COL,
  MEMO: 'mm',
  INCOME: 'in',
  EXPENSES: 'ex',
  INC_AND_EXP: 'ie',
} as const;

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

/** Memo カラム */
export const MEM_COL = {
  ...CMN_COL,
} as const;

/** Schedule カラム */
export const SCD_COL = {
  ...CMN_COL,
  SEARCH_MEMO: 'sm',
  MEMO_PLUS_A: 'mp',
} as const;

/** カラム */
export const COL = {
  [TBL.MAIN]: MAIN_COL,
  [TBL.STORAGE]: STG_COL,
  [TBL.CREDIT]: CRD_COL,
  [TBL.ITEM]: ITM_COL,
  [TBL.REMARK]: RMK_COL,
  [TBL.SUMMARY]: SMR_COL,
  [TBL.MEMO]: MEM_COL,
  [TBL.SCHEDULE]: SCD_COL,
} as const satisfies Record<Tbl, Record<string, string>>;

/** 共通保存カラムID */
const CMN_SAVE_COL = [
  CMN_COL.ID,
  CMN_COL.LABEL,
  CMN_COL.UPDATE,
  CMN_COL.UPD_DATE_TIME,
  CMN_COL.VALID,
] as const satisfies string[];

/** 保存カラムID */
export const SAVE_COL = {
  [TBL.MAIN]: [
    CMN_COL.ID,
    CMN_COL.UPDATE,
    MAIN_COL.DATE,
    MAIN_COL.AMOUNT,
    MAIN_COL.MEMO,
    MAIN_COL.STORAGE,
    MAIN_COL.CREDIT,
    MAIN_COL.ITEM,
    MAIN_COL.REMARK,
    MAIN_COL.USE_DATE,
    MAIN_COL.COLOR,
  ],
  [TBL.STORAGE]: [
    ...CMN_SAVE_COL,
    STG_COL.BANK,
    STG_COL.BRANCH,
    STG_COL.SUBJECT,
  ],
  [TBL.CREDIT]: [
    ...CMN_SAVE_COL,
    CRD_COL.CLOSE_DAY,
    CRD_COL.PAY_DAY,
    CRD_COL.PAY_MONTH,
    CRD_COL.BUSINESS_DAYS,
    CRD_COL.CARD,
  ],
  [TBL.ITEM]: [...CMN_SAVE_COL, ITM_COL.SUMMARY_COUNT_FLG],
  [TBL.REMARK]: [...CMN_SAVE_COL, RMK_COL.MEMO],
  [TBL.SUMMARY]: [],
  [TBL.MEMO]: [...CMN_SAVE_COL],
  [TBL.SCHEDULE]: [...CMN_SAVE_COL, SCD_COL.SEARCH_MEMO, SCD_COL.MEMO_PLUS_A],
} as const satisfies Record<Tbl, string[]>;

/** 共通デフォルト値 */
const CMN_DEF_VAL = {
  [CMN_COL.ID]: '',
  [CMN_COL.LABEL]: '',
  [CMN_COL.UPDATE]: false,
  [CMN_COL.UPD_DATE_TIME]: '',
  [CMN_COL.INPUT_MODE]: INPUT_MODE.NONE,
  [CMN_COL.VALID]: true,
} as const satisfies Record<CmnCol, ValType>;

/** デフォルト値 */
export const TBL_DEF_VAL = {
  [TBL.MAIN]: {
    ...CMN_DEF_VAL,
    [MAIN_COL.DATE]: null,
    [MAIN_COL.AMOUNT]: '',
    [MAIN_COL.AMOUNT_NUM]: Number.NaN,
    [MAIN_COL.MEMO]: '',
    [MAIN_COL.STORAGE]: MARK.NO_SELECT.id,
    [MAIN_COL.CREDIT]: MARK.NO_SELECT.id,
    [MAIN_COL.ITEM]: MARK.NO_SELECT.id,
    [MAIN_COL.REMARK]: MARK.NO_SELECT.id,
    [MAIN_COL.USE_DATE]: null,
    [MAIN_COL.PAY_DATE]: null,
    [MAIN_COL.COLOR]: '#000000',
  },
  [TBL.STORAGE]: {
    ...CMN_DEF_VAL,
    [STG_COL.BANK]: '',
    [STG_COL.BRANCH]: '',
    [STG_COL.SUBJECT]: '',
    [STG_COL.SAVINGS]: 0,
    [STG_COL.LAST_SAVINGS]: 0,
  },
  [TBL.CREDIT]: {
    ...CMN_DEF_VAL,
    [CRD_COL.CLOSE_DAY]: 1,
    [CRD_COL.PAY_DAY]: 1,
    [CRD_COL.PAY_MONTH]: 1,
    [CRD_COL.BUSINESS_DAYS]: BIZ_DAYS.NXT,
    [CRD_COL.CARD]: '',
    [CRD_COL.EXPENSES_TWO_MONTHS_AGO]: 0,
    [CRD_COL.EXPENSES_LAST_MONTH]: 0,
    [CRD_COL.EXPENSES_THIS_MONTH]: 0,
    [CRD_COL.EXPENSES_NEXT_MONTH]: 0,
    [CRD_COL.EXPENSES_CUSTOM_MONTH]: 0,
  },
  [TBL.ITEM]: {
    ...CMN_DEF_VAL,
    [ITM_COL.SUMMARY_COUNT_FLG]: true,
  },
  [TBL.REMARK]: {
    ...CMN_DEF_VAL,
    [RMK_COL.MEMO]: '',
    [RMK_COL.INCOME]: 0,
    [RMK_COL.EXPENSES]: 0,
    [RMK_COL.INC_AND_EXP]: 0,
  },
  [TBL.SUMMARY]: {
    ...CMN_DEF_VAL,
    [SMR_COL.DATE]: null,
    [SMR_COL.INCOME]: 0,
    [SMR_COL.EXPENSES]: 0,
    [SMR_COL.INC_AND_EXP]: 0,
    [SMR_COL.SAVINGS]: 0,
    [SMR_COL.INC_AND_EXP_HIDDEN]: 0,
    [SMR_COL.ITEM]: 0,
  },
  [TBL.MEMO]: {
    ...CMN_DEF_VAL,
  },
  [TBL.SCHEDULE]: {
    ...CMN_DEF_VAL,
    [SCD_COL.SEARCH_MEMO]: '',
    [SCD_COL.MEMO_PLUS_A]: [] as ValType,
  },
} as const satisfies Record<Tbl, Record<string, ValType>>;

/** 保存時デフォルト値 */
export const SAVE_DEF_VAL = {
  [TBL.MAIN]: {
    ...TBL_DEF_VAL[TBL.MAIN],
    [MAIN_COL.INPUT_MODE]: INPUT_MODE.ALL_REQ,
  },
  [TBL.STORAGE]: {
    ...TBL_DEF_VAL[TBL.STORAGE],
    [STG_COL.INPUT_MODE]: INPUT_MODE.ALL_REQ,
  },
  [TBL.CREDIT]: {
    ...TBL_DEF_VAL[TBL.CREDIT],
    [CRD_COL.INPUT_MODE]: INPUT_MODE.ALL_REQ,
  },
  [TBL.ITEM]: {
    ...TBL_DEF_VAL[TBL.ITEM],
    [ITM_COL.INPUT_MODE]: INPUT_MODE.ALL_REQ,
  },
  [TBL.REMARK]: {
    ...TBL_DEF_VAL[TBL.REMARK],
    [RMK_COL.INPUT_MODE]: INPUT_MODE.ALL_REQ,
  },
  [TBL.SUMMARY]: {
    ...TBL_DEF_VAL[TBL.SUMMARY],
    [SMR_COL.INPUT_MODE]: INPUT_MODE.ALL_REQ,
  },
  [TBL.SCHEDULE]: {
    ...TBL_DEF_VAL[TBL.SCHEDULE],
    [SCD_COL.INPUT_MODE]: INPUT_MODE.ALL_REQ,
  },
  [TBL.MEMO]: {
    ...TBL_DEF_VAL[TBL.MEMO],
    [MEM_COL.INPUT_MODE]: INPUT_MODE.ALL_REQ,
  },
} as const satisfies Record<Tbl, Record<string, ValType>>;

/** テーブル情報 */
export const TBL_INF = {
  /** テーブル基本情報 */
  basic: TBL_BASIC_INF,
  /** カラムID */
  col: COL,
  /** デフォルト値 */
  defVal: TBL_DEF_VAL,
  /** 保存カラムID */
  saveCol: SAVE_COL,
  /** 保存時デフォルト値 */
  saveDefVal: SAVE_DEF_VAL,
} as const;

/** ローカルストレージ キーリスト */
export const SAVE_STG = {
  ...TBL,
  SCR_INF: 'scrInf',
  HIST_INF: 'histInf',
} as const;
