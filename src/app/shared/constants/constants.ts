import {
  DateFormat,
  DayOfWeek,
  FreqDWMY,
  InputType,
  ScreenDispData,
  ValueType,
} from 'src/app/shared/constants/types';
import { DialogOption } from 'src/app/shared/dialog-input/dialog-input.component';

/********************
 * Const
 ********************/
/** MoneyDiary共通カラムID */
export const ROW_DATA_COMMON_COL_ID = {
  ID: 'id',
  LABEL: 'lb',
  VALID: 'vd',
  UPD_DATE: 'ud',
  UPDATE: 'up',
} as const;

/** MoneyDiaryカラムID */
export const MONEY_DIARY_COL_ID = {
  ...ROW_DATA_COMMON_COL_ID,
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
  INPUT_MODE: 'im',
} as const;

/** StorageカラムID */
export const STORAGE_COL_ID = {
  ...ROW_DATA_COMMON_COL_ID,
  BANK: 'bn',
  BRANCH: 'br',
  SUBJECT: 'sb',
  SAVINGS: 'sv',
  LAST_SAVINGS: 'ls',
} as const;

/** CreditカラムID */
export const CREDIT_COL_ID = {
  ...ROW_DATA_COMMON_COL_ID,
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

/** ItemカラムID */
export const ITEM_COL_ID = {
  ...ROW_DATA_COMMON_COL_ID,
  SUMMARY_COUNT_FLG: 'sc',
} as const;

/** RemarkカラムID */
export const REMARK_COL_ID = {
  ...ROW_DATA_COMMON_COL_ID,
  MEMO: 'mm',
  INCOME: 'in',
  EXPENSES: 'ex',
  INC_AND_EXP: 'ie',
} as const;

/** SummaryカラムID */
export const SUMMARY_COL_ID = {
  ...ROW_DATA_COMMON_COL_ID,
  DATE: 'dt',
  INCOME: 'in',
  EXPENSES: 'ex',
  INC_AND_EXP: 'ie',
  SAVINGS: 'sv',
  INC_AND_EXP_HIDDEN: 'sh',
  ITEM: 'it',
} as const;

/** MemoカラムID */
export const MEMO_COL_ID = {
  ...ROW_DATA_COMMON_COL_ID,
} as const;

/** ScheduleカラムID */
export const SCHEDULE_COL_ID = {
  ...ROW_DATA_COMMON_COL_ID,
  SEARCH_MEMO: 'sm',
  MEMO_PLUS_A: 'mp',
} as const;

/** カラー #AA00FF*/
export const COLOR = {
  AMOUNT_MINUS: '#FF7E79',
  AMOUNT_PLUS: '#76D6FF',
  AMOUNT_ZERO: '#F2F2F2',
  INVALID: '#666666',
  FOREGROUND_COLOR: '#BBBEC9',
} as const;

/** グリッド背景色 */
export const GRID_ROW_COLOR = {
  SELECT: '#c8fffc', // #c8fffc
  UPDATE: '#0000CC30', // #0000CC30
  ERROR: '#cc000030', // #cc000030
  NONE: '#cccc0030', // #cccc0030
} as const;

/** ルートパス */
export const ROUTE_PATH = {
  MONEY_DIARY: 'money-diary',
  TETRIS: 'tetris',
  ERROR: 'error',
} as const;

/** 画面ID */
export const SCREEN_ID = {
  MONEY_DIARY: 'md',
  STORAGE: 'st',
  CREDIT: 'cr',
  ITEM: 'it',
  REMARK: 'rm',
  SUMMARY: 'sm',
  SCHEDULE: 'sc',
  MEMO: 'mm',
} as const;

/** 日付フォーマット */
export const DATE_FORMAT = {
  YYYY_MM_DD: 'yyyy-MM-dd',
  YYYY: 'yyyy',
  YYYY_MM: 'yyyy-MM',
  YY_MM_DD: 'yy-MM-dd',
  YY_MM_DD_HH_MM_SS: 'yy-MM-dd HH:mm:ss',
  YYMMDD_HHMMSS: 'yyMMdd_HHmmss',
} as const;

/** 入力モード */
export const INPUT_MODE = {
  /** 初期状態 */
  NONE: 0,
  /** 必須項目未入力あり */
  SOME_REQ: 1,
  /** 必須項目未入力なし */
  ALL_REQ: 2,
} as const;

/** 行データKey */
export const ROW_DATA_KEY = {
  MONEY_DIARY: 'md',
  STORAGE: 'st',
  CREDIT: 'cr',
  ITEM: 'it',
  REMARK: 'rm',
  SUMMARY: 'sm',
  SCHEDULE: 'sc',
  MEMO: 'mm',
} as const;

/** ローカルストレージ キーリスト */
export const STORAGE_KEY = {
  ...ROW_DATA_KEY,
  SCREEN_INFO: 'screenInfo',
  ROW_DATA_EDITS_SAVE_INFO: 'rowDataEditsSaveInfo',
} as const;

/** 日付 */
export const MANAGEMENT_DATE = {
  START: '2018-01-01',
} as const;

/** 記号 */
export const MARK = {
  NO_SELECT: { ID: '0', LABEL: '-' },
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
  [INPUT_TYPE.TEXT]: { INIT_VAL: '' },
  [INPUT_TYPE.NUM]: { INIT_VAL: Number.NaN },
  [INPUT_TYPE.DATE]: { INIT_VAL: null },
  [INPUT_TYPE.TEXTAREA]: { INIT_VAL: '' },
  [INPUT_TYPE.CHECK]: { INIT_VAL: [] as ValueType[] },
  [INPUT_TYPE.RADIO]: { INIT_VAL: null },
  [INPUT_TYPE.SELECT]: { INIT_VAL: '' },
  [INPUT_TYPE.TOGGLE]: { INIT_VAL: false },
  [INPUT_TYPE.COLOR]: { INIT_VAL: '#00000000' },
} as const satisfies Record<InputType, Record<string, ValueType>>;

/** 禁止文字 */
export const FORBIDDEN_CHARS = {
  /** 数値と符号以外禁止 */
  FORMULA: /[^0-9+\-*/()]+/g,
} as const;

/** ファイル名 */
export const FILE_NAME = {
  DOWNLOAD: 'moneyDiary_{0}.json',
} as const;

/** 最大値 */
export const MAX_LEN = {
  SCREEN_TRANS_MAP: 20,
} as const;

/** タイム */
export const TIME_MILI = {
  DISP_MAP_BEFORE_TRAN: 50,
  DISP_MAP_AFTER_TRAN: 250,
  DISP_MAP_LONG_CLICK: 500,
  UNDO_REDO_BEFORE: 300,
} as const;

/** 行データ編集タイプ */
export const ROW_DATA_EDIT_TYPE = {
  SET: 'st',
  ADD: 'ad',
  UPD: 'up',
  DEL: 'dl',
  DRAG: 'dg',
} as const;

/** 行データGroup */
export const ROW_DATA_GROUP = {
  MAIN: 'main',
  SETTING: 'setting',
  OTHER: 'other',
} as const;

/** 予約語 */
export const RESERVED_WORD = /@+/g;

/** 予約語文字列 */
export const RESERVED_STRING = {
  ORIGINAL: '@o',
  SERIAL_NUM: '@c',
  SERIAL_DATE: '@d',
} as const;

/**************************************************
 * セレクトボックス, チェックボックス, ラジオボタン用ID
 **************************************************/
/** 営業日 */
export const BUSINESS_DAYS = {
  ALWAYS: 0,
  PREVIOUS: -1,
  NEXT: 1,
} as const satisfies Record<string, number>;

/** 頻度 */
export const FREQ_DWMY = {
  DAY: 'dy',
  WEEK: 'wk',
  MONTH: 'mt',
  YEAR: 'yr',
} as const;

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

/*********************************************
 * セレクトボックス, チェックボックス, ラジオボタン
 *********************************************/
/** 営業日の算出方法 */
export const BUSINESS_DAYS_SELECT = [
  { id: BUSINESS_DAYS.ALWAYS, label: '常時' },
  { id: BUSINESS_DAYS.PREVIOUS, label: '前営業日' },
  { id: BUSINESS_DAYS.NEXT, label: '翌営業日' },
] as const satisfies DialogOption[];

/** 頻度 */
export const FREQ_DWMY_SELECT = [
  { id: FREQ_DWMY.DAY, label: 'Day' },
  { id: FREQ_DWMY.WEEK, label: 'Week' },
  { id: FREQ_DWMY.MONTH, label: 'Month' },
  { id: FREQ_DWMY.YEAR, label: 'Year' },
] as const satisfies { id: FreqDWMY; label: string }[];

/** 曜日 */
export const DAY_OF_WEEK_SELECT = [
  { id: DAY_OF_WEEK.SUN, label: 'Sun' },
  { id: DAY_OF_WEEK.MON, label: 'Mon' },
  { id: DAY_OF_WEEK.TUE, label: 'Tue' },
  { id: DAY_OF_WEEK.WED, label: 'Wed' },
  { id: DAY_OF_WEEK.THU, label: 'Thu' },
  { id: DAY_OF_WEEK.FRI, label: 'Fri' },
  { id: DAY_OF_WEEK.SAT, label: 'Sat' },
] as const satisfies { id: DayOfWeek; label: string }[];

/** 日付連番形式 */
export const SERIAL_DATE_FORMAT_SELECT = [
  { id: DATE_FORMAT.YYYY, label: 'Year' },
  { id: DATE_FORMAT.YYYY_MM, label: 'Month' },
  { id: DATE_FORMAT.YY_MM_DD, label: 'Day' },
] as const satisfies { id: DateFormat; label: string }[];

/***************
 * デフォルト値
 ***************/
/** 画面情報 */
export const SCREEN_INFO = [
  {
    id: SCREEN_ID.MONEY_DIARY,
    label: 'Money Diary',
    abbr: 'Money',
    icon: 'edit',
    px: 1,
    py: 1,
  },
  {
    id: SCREEN_ID.SUMMARY,
    label: 'Summary',
    abbr: 'Smr',
    icon: 'summarize',
    px: 2,
    py: 1,
  },
  {
    id: SCREEN_ID.SCHEDULE,
    label: 'Schedule',
    abbr: 'Scdl',
    icon: 'event_available',
    px: 2,
    py: 2,
  },
  {
    id: SCREEN_ID.STORAGE,
    label: 'Storage',
    abbr: 'Strg',
    icon: 'storage',
    px: 0,
    py: 0,
  },
  {
    id: SCREEN_ID.CREDIT,
    label: 'Credit',
    abbr: 'Crdt',
    icon: 'credit_card',
    px: 0,
    py: 1,
  },
  {
    id: SCREEN_ID.ITEM,
    label: 'Item',
    abbr: 'Item',
    icon: 'category',
    px: 0,
    py: 2,
  },
  {
    id: SCREEN_ID.REMARK,
    label: 'Remark',
    abbr: 'Rmk',
    icon: 'edit_note',
    px: 1,
    py: 2,
  },
  {
    id: SCREEN_ID.MEMO,
    label: 'Memo',
    abbr: 'Memo',
    icon: 'note_alt',
    px: 1,
    py: 0,
  },
] as const satisfies ScreenDispData[];

/** 行データ情報 */
export const ROW_DATA_INFO = {
  [ROW_DATA_KEY.MONEY_DIARY]: {
    saveColIds: [
      MONEY_DIARY_COL_ID.ID,
      MONEY_DIARY_COL_ID.DATE,
      MONEY_DIARY_COL_ID.AMOUNT,
      MONEY_DIARY_COL_ID.MEMO,
      MONEY_DIARY_COL_ID.STORAGE,
      MONEY_DIARY_COL_ID.CREDIT,
      MONEY_DIARY_COL_ID.ITEM,
      MONEY_DIARY_COL_ID.REMARK,
      MONEY_DIARY_COL_ID.USE_DATE,
      MONEY_DIARY_COL_ID.COLOR,
      MONEY_DIARY_COL_ID.UPDATE,
    ],
    screenId: SCREEN_ID.MONEY_DIARY,
    group: ROW_DATA_GROUP.MAIN,
    link: {
      [MONEY_DIARY_COL_ID.STORAGE]: {
        rowDataKey: ROW_DATA_KEY.STORAGE,
        colId: STORAGE_COL_ID.ID,
      },
      [MONEY_DIARY_COL_ID.CREDIT]: {
        rowDataKey: ROW_DATA_KEY.CREDIT,
        colId: CREDIT_COL_ID.ID,
      },
      [MONEY_DIARY_COL_ID.ITEM]: {
        rowDataKey: ROW_DATA_KEY.ITEM,
        colId: ITEM_COL_ID.ID,
      },
      [MONEY_DIARY_COL_ID.REMARK]: {
        rowDataKey: ROW_DATA_KEY.REMARK,
        colId: REMARK_COL_ID.ID,
      },
    },
  },
  [ROW_DATA_KEY.STORAGE]: {
    saveColIds: [
      STORAGE_COL_ID.ID,
      STORAGE_COL_ID.LABEL,
      STORAGE_COL_ID.BANK,
      STORAGE_COL_ID.BRANCH,
      STORAGE_COL_ID.SUBJECT,
      STORAGE_COL_ID.VALID,
      STORAGE_COL_ID.UPD_DATE,
      STORAGE_COL_ID.UPDATE,
    ],
    screenId: SCREEN_ID.STORAGE,
    group: ROW_DATA_GROUP.SETTING,
    link: {},
  },
  [ROW_DATA_KEY.CREDIT]: {
    saveColIds: [
      CREDIT_COL_ID.ID,
      CREDIT_COL_ID.LABEL,
      CREDIT_COL_ID.CLOSE_DAY,
      CREDIT_COL_ID.PAY_DAY,
      CREDIT_COL_ID.PAY_MONTH,
      CREDIT_COL_ID.BUSINESS_DAYS,
      CREDIT_COL_ID.CARD,
      CREDIT_COL_ID.VALID,
      CREDIT_COL_ID.UPD_DATE,
      CREDIT_COL_ID.UPDATE,
    ],
    screenId: SCREEN_ID.CREDIT,
    group: ROW_DATA_GROUP.SETTING,
    link: {},
  },
  [ROW_DATA_KEY.ITEM]: {
    saveColIds: [
      ITEM_COL_ID.ID,
      ITEM_COL_ID.LABEL,
      ITEM_COL_ID.SUMMARY_COUNT_FLG,
      ITEM_COL_ID.VALID,
      ITEM_COL_ID.UPD_DATE,
      ITEM_COL_ID.UPDATE,
    ],
    screenId: SCREEN_ID.ITEM,
    group: ROW_DATA_GROUP.SETTING,
    link: {},
  },
  [ROW_DATA_KEY.REMARK]: {
    saveColIds: [
      REMARK_COL_ID.ID,
      REMARK_COL_ID.LABEL,
      REMARK_COL_ID.MEMO,
      REMARK_COL_ID.VALID,
      REMARK_COL_ID.UPD_DATE,
      REMARK_COL_ID.UPDATE,
    ],
    screenId: SCREEN_ID.REMARK,
    group: ROW_DATA_GROUP.SETTING,
    link: {},
  },
  [ROW_DATA_KEY.SUMMARY]: {
    saveColIds: [],
    screenId: SCREEN_ID.SUMMARY,
    group: ROW_DATA_GROUP.OTHER,
    link: {},
  },
  [ROW_DATA_KEY.SCHEDULE]: {
    saveColIds: [
      SCHEDULE_COL_ID.LABEL,
      SCHEDULE_COL_ID.SEARCH_MEMO,
      SCHEDULE_COL_ID.MEMO_PLUS_A,
    ],
    screenId: SCREEN_ID.SCHEDULE,
    group: ROW_DATA_GROUP.OTHER,
    link: {},
  },
  [ROW_DATA_KEY.MEMO]: {
    saveColIds: [
      MEMO_COL_ID.ID,
      MEMO_COL_ID.LABEL,
      MEMO_COL_ID.UPD_DATE,
      MEMO_COL_ID.UPDATE,
    ],
    screenId: SCREEN_ID.MEMO,
    group: ROW_DATA_GROUP.OTHER,
    link: {},
  },
} as const;

/** デフォルト値 */
export const DEFAULT_ROW_DATA = {
  [ROW_DATA_KEY.MONEY_DIARY]: {
    [ROW_DATA_COMMON_COL_ID.ID]: '',
    [MONEY_DIARY_COL_ID.DATE]: null,
    [MONEY_DIARY_COL_ID.AMOUNT]: '',
    [MONEY_DIARY_COL_ID.AMOUNT_NUM]: Number.NaN,
    [MONEY_DIARY_COL_ID.MEMO]: '',
    [MONEY_DIARY_COL_ID.STORAGE]: MARK.NO_SELECT.ID,
    [MONEY_DIARY_COL_ID.CREDIT]: MARK.NO_SELECT.ID,
    [MONEY_DIARY_COL_ID.ITEM]: MARK.NO_SELECT.ID,
    [MONEY_DIARY_COL_ID.REMARK]: MARK.NO_SELECT.ID,
    [MONEY_DIARY_COL_ID.USE_DATE]: null,
    [MONEY_DIARY_COL_ID.PAY_DATE]: null,
    [MONEY_DIARY_COL_ID.COLOR]: '#000000',
    [MONEY_DIARY_COL_ID.INPUT_MODE]: INPUT_MODE.NONE,
    [ROW_DATA_COMMON_COL_ID.UPDATE]: false,
  },
  [ROW_DATA_KEY.STORAGE]: {
    [STORAGE_COL_ID.ID]: '',
    [STORAGE_COL_ID.LABEL]: '',
    [STORAGE_COL_ID.BANK]: '',
    [STORAGE_COL_ID.BRANCH]: '',
    [STORAGE_COL_ID.SUBJECT]: '',
    [STORAGE_COL_ID.SAVINGS]: 0,
    [STORAGE_COL_ID.LAST_SAVINGS]: 0,
    [STORAGE_COL_ID.VALID]: true,
    [STORAGE_COL_ID.UPD_DATE]: '',
    [STORAGE_COL_ID.UPDATE]: false,
  },
  [ROW_DATA_KEY.CREDIT]: {
    [CREDIT_COL_ID.ID]: '',
    [CREDIT_COL_ID.LABEL]: '',
    [CREDIT_COL_ID.CLOSE_DAY]: 1,
    [CREDIT_COL_ID.PAY_DAY]: 1,
    [CREDIT_COL_ID.PAY_MONTH]: 1,
    [CREDIT_COL_ID.BUSINESS_DAYS]: BUSINESS_DAYS.NEXT,
    [CREDIT_COL_ID.CARD]: '',
    [CREDIT_COL_ID.EXPENSES_TWO_MONTHS_AGO]: 0,
    [CREDIT_COL_ID.EXPENSES_LAST_MONTH]: 0,
    [CREDIT_COL_ID.EXPENSES_THIS_MONTH]: 0,
    [CREDIT_COL_ID.EXPENSES_NEXT_MONTH]: 0,
    [CREDIT_COL_ID.EXPENSES_CUSTOM_MONTH]: 0,
    [CREDIT_COL_ID.VALID]: true,
    [CREDIT_COL_ID.UPD_DATE]: '',
    [CREDIT_COL_ID.UPDATE]: false,
  },
  [ROW_DATA_KEY.ITEM]: {
    [ITEM_COL_ID.ID]: '',
    [ITEM_COL_ID.LABEL]: '',
    [ITEM_COL_ID.SUMMARY_COUNT_FLG]: true,
    [ITEM_COL_ID.VALID]: true,
    [ITEM_COL_ID.UPD_DATE]: '',
    [ITEM_COL_ID.UPDATE]: false,
  },
  [ROW_DATA_KEY.REMARK]: {
    [REMARK_COL_ID.ID]: '',
    [REMARK_COL_ID.LABEL]: '',
    [REMARK_COL_ID.MEMO]: '',
    [REMARK_COL_ID.INCOME]: 0,
    [REMARK_COL_ID.EXPENSES]: 0,
    [REMARK_COL_ID.INC_AND_EXP]: 0,
    [REMARK_COL_ID.VALID]: true,
    [REMARK_COL_ID.UPD_DATE]: '',
    [REMARK_COL_ID.UPDATE]: false,
  },
  [ROW_DATA_KEY.SUMMARY]: {
    [SUMMARY_COL_ID.ID]: '',
    [SUMMARY_COL_ID.DATE]: null,
    [SUMMARY_COL_ID.INCOME]: 0,
    [SUMMARY_COL_ID.EXPENSES]: 0,
    [SUMMARY_COL_ID.INC_AND_EXP]: 0,
    [SUMMARY_COL_ID.SAVINGS]: 0,
    [SUMMARY_COL_ID.INC_AND_EXP_HIDDEN]: 0,
    [SUMMARY_COL_ID.ITEM]: 0,
  },
  [ROW_DATA_KEY.SCHEDULE]: {
    [SCHEDULE_COL_ID.ID]: '',
    [SCHEDULE_COL_ID.LABEL]: '',
    [SCHEDULE_COL_ID.SEARCH_MEMO]: '',
    [SCHEDULE_COL_ID.MEMO_PLUS_A]: [] as ValueType,
    [SCHEDULE_COL_ID.VALID]: true,
    [SCHEDULE_COL_ID.UPDATE]: false,
  },
  [ROW_DATA_KEY.MEMO]: {
    [MEMO_COL_ID.ID]: '',
    [MEMO_COL_ID.LABEL]: '',
    [MEMO_COL_ID.VALID]: true,
    [MEMO_COL_ID.UPD_DATE]: '',
    [MEMO_COL_ID.UPDATE]: false,
  },
} as const;
