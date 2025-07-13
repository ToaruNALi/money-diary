import { isHoliday } from '@holiday-jp/holiday_jp';
import { CellClassParams, CellStyle, GridApi } from 'ag-grid-community';
import * as DateUtil from 'date-fns';
import { addDays } from 'date-fns';
import moji from 'moji';
import { RowData } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import {
  InputMode,
  PayDateInfo,
  RowDataEdit,
  RowDataEditType,
  RowDataKey,
  ScreenId,
  SortOption,
  ValueType,
} from 'src/app/shared/constants/types';

/***************
 * Util
 ***************/
/** 有効な整数かどうかを判断する */
export const isValidInteger = (value?: ValueType): value is number =>
  Number.isSafeInteger(value);

/** 数値 ｰ> 金額表示に変換する (入力が数値でない場合、空文字を返却する) */
export const cvtNumToPrice = (value?: ValueType): string => {
  if (!isValidInteger(value)) {
    return '';
  }

  return value.toLocaleString('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  });
};

/** 日付文字列 ｰ> 日付 に変換する */
export const cvtStringToDate = (value?: ValueType): Date | null => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  if (/\d{4}\-\d{2}\-\d{2} \d{2}\:\d{2}\:\d{2}/.test(value)) {
    return new Date(value);
  } else if (/\d{4}\-\d{2}\-\d{2}/.test(value)) {
    return new Date(`${value} 00:00:00`);
  }
  return null;
};

/** 計算結果を返却する */
export const calcResult = (value?: ValueType): number => {
  try {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      typeof value === 'boolean' ||
      (typeof value === 'string' && Const.FORBIDDEN_CHARS.FORMULA.test(value))
    ) {
      throw new Error();
    }

    const num = Math.round(
      (() => {
        if (typeof value === 'number') {
          if (!isValidInteger(value)) {
            throw new Error();
          }
          return value;
        }
        return Number(new Function(`return ${value}`)());
      })(),
    );

    return num;
  } catch (e) {
    return Number.NaN;
  }
};

/** 金額コンパレーター */
export const amountComparator = (
  valueA?: ValueType,
  valueB?: ValueType,
): number => {
  if (!isValidInteger(valueA) && !isValidInteger(valueB)) {
    return 0;
  } else if (!isValidInteger(valueA)) {
    return 1;
  } else if (!isValidInteger(valueB)) {
    return -1;
  }
  return valueA - valueB;
};

/** 金額のスタイルを返却する */
export const getStylePrice = (
  value?: ValueType,
  cellStyle: CellStyle = {},
): CellStyle => {
  if (!isValidInteger(value)) {
    return cellStyle;
  }

  cellStyle['color'] = (() => {
    if (value < 0) {
      return Const.COLOR.AMOUNT_MINUS;
    } else if (value > 0) {
      return Const.COLOR.AMOUNT_PLUS;
    }
    return Const.COLOR.AMOUNT_ZERO;
  })();
  return cellStyle;
};

/** セル共通スタイル */
export const getCellCommonStyle = (
  params: CellClassParams<RowData, ValueType>,
  cellStyle: CellStyle = {},
): CellStyle => {
  const valid = params.data?.[Const.ROW_DATA_COMMON_COL_ID.VALID] ?? true;
  if (valid) {
    cellStyle['opacity'] = 1;
  } else {
    cellStyle['opacity'] = 0.3;
  }
  return cellStyle;
};

/** 日付を返却する */
export const getDate = (
  date: DateUtil.DateArg<Date> = new Date(),
  formatStr: string = Const.DATE_FORMAT.YYYY_MM_DD,
) => {
  return DateUtil.format(date, formatStr);
};

/** 支払日を返却する */
export const getPayDate = (
  date: ValueType,
  credit: ValueType,
  creditList: RowData[],
  formatStr: string = Const.DATE_FORMAT.YYYY_MM_DD,
): string => {
  if (
    !date ||
    typeof date !== 'string' ||
    credit === null ||
    typeof credit !== 'string'
  ) {
    return '';
  }

  const creditInfo = creditList.find(
    (data) => data[Const.CREDIT_COL_ID.ID] === credit,
  );

  if (
    !!creditInfo &&
    creditInfo[Const.CREDIT_COL_ID.ID] !== Const.MARK.NO_SELECT.ID
  ) {
    const closeDay = creditInfo[Const.CREDIT_COL_ID.CLOSE_DAY];
    const payDay = creditInfo[Const.CREDIT_COL_ID.PAY_DAY];
    const payMonth = creditInfo[Const.CREDIT_COL_ID.PAY_MONTH];
    const businessDays = creditInfo[Const.CREDIT_COL_ID.BUSINESS_DAYS];

    if (
      typeof closeDay === 'number' &&
      typeof payDay === 'number' &&
      typeof payMonth === 'number' &&
      typeof businessDays === 'number'
    ) {
      return getDate(
        calcPayDate({
          date: new Date(date),
          closeDay: closeDay,
          payDay: payDay,
          payMonth: payMonth,
          businessDays: businessDays,
        }),
        formatStr,
      );
    }
  }
  return date;
};

/** 支払い日付情報をもとに支払日を算出する */
export const calcPayDate = (payDateInfo: PayDateInfo): Date => {
  const newDate = new Date(payDateInfo.date);
  const addMonth =
    payDateInfo.payMonth + (newDate.getDate() <= payDateInfo.closeDay ? 0 : 1);
  let payDate =
    payDateInfo.payDay >= 29
      ? // 月末
        new Date(newDate.getFullYear(), newDate.getMonth() + addMonth + 1, 0)
      : // 月末以外
        new Date(
          newDate.getFullYear(),
          newDate.getMonth() + addMonth,
          payDateInfo.payDay,
        );

  if (payDateInfo.businessDays === Const.BUSINESS_DAYS.ALWAYS) {
    // 支払日に条件がない場合
    return payDate;
  }
  return calcPayDateConsiderHoliday(payDate, payDateInfo.businessDays);
};

/** 休日を考慮した支払い日付を算出する */
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
      payDate = getDate(addDate) as T;
    } else {
      payDate = addDate as T;
    }
  }
};

/** 休日・祝日かどうかを判定する */
const judgeHoliday = (date: string | Date): boolean => {
  // 休日判定
  const newDate = new Date(date);
  if (newDate.getDay() === 0 || newDate.getDay() === 6) {
    return true;
  }

  // 祝日判定
  return isHoliday(newDate);
};

/** 行データをソートオプション順に並び替える */
export const sortRowDatas = (
  rowDatas: RowData[],
  sortOpts: SortOption[],
  useToSorted: boolean = true,
): RowData[] =>
  useToSorted
    ? rowDatas.toSorted((a, b) => sortCommonProc(a, b, sortOpts))
    : rowDatas.sort((a, b) => sortCommonProc(a, b, sortOpts));

/** ソート共通処理 */
export const sortCommonProc = (
  a: RowData | undefined,
  b: RowData | undefined,
  sortOpts: SortOption[],
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
    return sortCommonProc(a, b, nextSortOpt);
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
export const getInputMode = (rowData: RowData): InputMode => {
  const dateEmpty = !rowData[Const.MONEY_DIARY_COL_ID.USE_DATE];
  const amountEmpty = !rowData[Const.MONEY_DIARY_COL_ID.AMOUNT];
  const memoEmpty = !rowData[Const.MONEY_DIARY_COL_ID.MEMO];
  const storageNoSelect =
    rowData[Const.MONEY_DIARY_COL_ID.STORAGE] === Const.MARK.NO_SELECT.ID;

  if (dateEmpty && amountEmpty && memoEmpty && storageNoSelect) {
    return Const.INPUT_MODE.NONE;
  } else if (!dateEmpty && !amountEmpty && !memoEmpty && !storageNoSelect) {
    return Const.INPUT_MODE.ALL_REQ;
  }
  return Const.INPUT_MODE.SOME_REQ;
};

/** 入力モードが一致しているかをチェックする */
export const checkInputMode = (rowData: RowData, mode: InputMode): boolean =>
  getInputMode(rowData) === mode;

/** 指定行にジャンプする */
export const jumpRow = (gridApi?: GridApi<RowData>, rowIdx?: number): void => {
  if (!gridApi) {
    return;
  }
  if (rowIdx === undefined) {
    rowIdx = gridApi.getDisplayedRowCount() - 1;
  }
  if (rowIdx > 0) {
    gridApi.ensureIndexVisible(rowIdx - 1);
  }
  gridApi.ensureIndexVisible(rowIdx);
};

/** 指定列にジャンプする */
export const jumpCol = (gridApi?: GridApi<RowData>, colIdx?: number): void => {
  if (!gridApi) {
    return;
  }
  const cols = gridApi.getAllDisplayedColumns();
  if (!cols) {
    return;
  }
  if (colIdx === undefined || colIdx > cols.length - 1) {
    colIdx = cols.length - 1;
  } else if (colIdx < 0) {
    colIdx = 0;
  }

  for (let idx = colIdx; ; ) {
    const col = cols.at(idx);
    if (!!col) {
      if (!col.isPinned()) {
        gridApi.ensureColumnVisible(col);
        break;
      }
    }

    if (idx < cols.length - 1) {
      idx++;
    } else {
      idx = 0;
    }

    if (idx === colIdx) {
      break;
    }
  }
};

/** IDを採番した初期行データを返却する */
export const getDefaultRowData = (
  key: RowDataKey,
  datas: RowData[],
): RowData => {
  const newData = getInitRowData(key);
  newData[Const.ROW_DATA_COMMON_COL_ID.ID] = createRowId(datas);
  return newData;
};

/** 初期行データを返却する */
export const getInitRowData = (key: RowDataKey): RowData =>
  structuredClone(Const.DEFAULT_ROW_DATA[key]);

/** 初期セルデータを返却する */
export const getInitValue = (key: RowDataKey, colId: string): ValueType =>
  structuredClone((Const.DEFAULT_ROW_DATA[key] as RowData)[colId]);

/** 一意なIDを採番する */
export const createRowId = (datas: RowData[]): string => {
  const idSet = new Set<ValueType>();
  for (const data of datas) {
    idSet.add(data[Const.ROW_DATA_COMMON_COL_ID.ID]);
  }

  const dataCnt = datas.length;
  for (let idx = 1; idx < dataCnt + 1; idx++) {
    if (!idSet.has(idx.toString())) {
      return idx.toString();
    }
  }

  return (dataCnt + 1).toString();
};

/** 保存用行データ作成 */
export const createSaveRowDatas = (
  key: RowDataKey,
  rowDatas: RowData[],
): RowData[] => {
  const saveDatas: RowData[] = [];
  const saveCols = Const.ROW_DATA_INFO[key].saveColIds;

  for (const data of rowDatas) {
    const saveData: RowData = {};
    for (const col of saveCols) {
      const initVal = getInitValue(key, col);
      if (
        data[col] === undefined ||
        data[col] === initVal ||
        (!initVal && !data[col])
      ) {
        continue;
      }

      if (key === Const.ROW_DATA_KEY.MONEY_DIARY) {
        // 入力データ限定処理
        if (
          col === Const.MONEY_DIARY_COL_ID.DATE &&
          data[col] === data[Const.MONEY_DIARY_COL_ID.USE_DATE]
        ) {
          // 日付が利用日と同じ場合、日付を保存しない
          continue;
        }
      }

      saveData[col] = data[col];
    }
    saveDatas.push(structuredClone(saveData));
  }

  return saveDatas;
};

/** 行データロード時編集 */
export const editRowDataOnLoad = (
  key: RowDataKey,
  datas: RowData[],
): RowData[] => {
  const group = Const.ROW_DATA_INFO[key].group;
  if (group === Const.ROW_DATA_GROUP.MAIN) {
    // 入力データ
    return editInputDatasOnLoad(datas);
  } else if (group === Const.ROW_DATA_GROUP.SETTING) {
    // 設定データ
    return editSettingDatasOnLoad(key, datas);
  } else if (group === Const.ROW_DATA_GROUP.OTHER) {
    // その他データ
    return editOtherDatasOnLoad(key, datas);
  }

  return [];
};

/** Money Diary データロード時編集 */
export const editInputDatasOnLoad = (datas: RowData[] = []): RowData[] => {
  const retDatas = structuredClone(datas).map((data) => ({
    ...getInitRowData(Const.ROW_DATA_KEY.MONEY_DIARY),
    ...data,
  }));
  for (const data of retDatas) {
    // 各行の金額計算結果を算出
    data[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM] = calcResult(
      data[Const.MONEY_DIARY_COL_ID.AMOUNT],
    );
    // 入力モードを算出
    data[Const.MONEY_DIARY_COL_ID.INPUT_MODE] = getInputMode(data);
    // 日付が空の場合利用日を設定
    if (!data[Const.MONEY_DIARY_COL_ID.DATE]) {
      data[Const.MONEY_DIARY_COL_ID.DATE] =
        data[Const.MONEY_DIARY_COL_ID.USE_DATE];
    }
    // // ID未採番の場合IDを採番
    // if (!data[Const.MONEY_DIARY_COL_ID.ID]) {
    //   data[Const.MONEY_DIARY_COL_ID.ID] = createRowId(datas);
    // }
  }
  return retDatas;
};

/** Setting データロード時編集 */
export const editSettingDatasOnLoad = (
  key: RowDataKey,
  datas: RowData[] = [],
): RowData[] => {
  const retDatas = structuredClone(datas).map((data) => ({
    ...getInitRowData(key),
    ...data,
  }));
  return retDatas;
};

/** Other データロード時編集 */
export const editOtherDatasOnLoad = (
  key: RowDataKey,
  datas: RowData[] = [],
): RowData[] => {
  const retDatas = structuredClone(datas).map((data) => ({
    ...getInitRowData(key),
    ...data,
  }));
  return retDatas;
};

/** 半角カタカナ->全角カタカナ,全角英数->半角英数 変換 */
export const convertToZKAndToHE = (value?: ValueType): ValueType =>
  moji(value?.toString() ?? '')
    .convert('HK', 'ZK')
    .convert('ZE', 'HE')
    .toString();

/** オブジェクトの比較 */
export const equalObject = (aVal: any, bVal: any): boolean => {
  if (
    (aVal === undefined && bVal === undefined) ||
    (aVal === null && bVal === null)
  ) {
    return true;
  }

  if (aVal == null && bVal == null) {
    return false;
  }

  if (aVal == null || bVal == null) {
    return false;
  }

  return JSON.stringify(aVal) === JSON.stringify(bVal);
};

/** 画面タイトルの返却 */
export const getScreenTitle = (screenId: ScreenId): string => {
  return Const.SCREEN_INFO.find((info) => info.id === screenId)?.label ?? '';
};
export const getScreenTitle2 = (rowDataKey: RowDataKey): string => {
  return getScreenTitle(Const.ROW_DATA_INFO[rowDataKey].screenId);
};

const getCommonEditData = (
  type: RowDataEditType,
  key: RowDataKey,
  datas: RowData[],
  addIds?: (string | null)[],
): RowDataEdit => {
  return {
    type,
    event: {
      key,
      datas,
      addIds,
    },
  };
};

export const getAddDefaultEditData = (
  key: RowDataKey,
  datas: RowData[],
): RowDataEdit => {
  return getCommonEditData(
    Const.ROW_DATA_EDIT_TYPE.ADD,
    key,
    [getDefaultRowData(key, datas)],
    [null],
  );
};

export const getUpdEditData = (
  key: RowDataKey,
  datas: RowData[],
): RowDataEdit => {
  return getCommonEditData(
    Const.ROW_DATA_EDIT_TYPE.UPD,
    key,
    datas.map((data) => ({
      ...data,
      [Const.ROW_DATA_COMMON_COL_ID.UPDATE]: true,
    })),
  );
};

export const getDelEditData = (
  key: RowDataKey,
  datas: RowData[],
): RowDataEdit => {
  return getCommonEditData(Const.ROW_DATA_EDIT_TYPE.DEL, key, datas);
};

export const getDragEditData = (
  key: RowDataKey,
  datas: RowData[],
  addIds: (string | null)[],
): RowDataEdit => {
  return getCommonEditData(Const.ROW_DATA_EDIT_TYPE.DRAG, key, datas, addIds);
};
