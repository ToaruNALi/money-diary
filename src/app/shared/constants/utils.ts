import { isHoliday } from '@holiday-jp/holiday_jp';
import { CellClassParams, CellStyle, GridApi } from 'ag-grid-community';
import * as DateUtil from 'date-fns';
import { addDays } from 'date-fns';
import moji from 'moji';
import { Row } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import {
  InputMode,
  PayDateInf,
  RowEdt,
  Scr,
  ScrDspData,
  SortOpt,
  Tbl,
  ValType,
} from 'src/app/shared/constants/types';

/**************************************************
 * 定数からデータを取得する共通処理
 **************************************************/

/** テーブル名を返却する */
export const getTblName = (tbl: Tbl): string => {
  return Const.TBL_BASIC_INF[tbl].name;
};

/** 画面IDを返却する */
export const getTblScrId = (tbl: Tbl): Scr => {
  return Const.TBL_BASIC_INF[tbl].scrId;
};

/** デフォルト行データを返却する */
export const getTblDefRow = (tbl: Tbl): Row => {
  return structuredClone(Const.TBL_DEF_VAL[tbl]);
};

/** デフォルト値を返却する */
export const getTblDefVal = (tbl: Tbl, col: string): ValType => {
  return getTblDefRow(tbl)[col];
};

/** 保存するカラムIDを返却する */
export const getSaveCol = (tbl: Tbl): string[] => {
  return structuredClone(Const.SAVE_COL[tbl]);
};

/** 保存時のデフォルト行データを返却する */
export const getSaveDefRow = (tbl: Tbl): Row => {
  return structuredClone(Const.SAVE_DEF_VAL[tbl]);
};

/** 保存時のデフォルト値を返却する */
export const getSaveDefVal = (tbl: Tbl, col: string): ValType => {
  return getSaveDefRow(tbl)[col];
};

/** 画面情報リストを返却する */
export const getMenuList = (): (ScrDspData & { id: Scr })[] => {
  return Object.entries(Const.SCR_INF).map(([scr, data]) => ({
    ...data,
    id: scr as Scr,
  }));
};

/**************************************************
 * 共通処理
 **************************************************/

/** 有効な整数かどうかを判断する */
export const isValidInt = (value?: ValType): value is number =>
  Number.isSafeInteger(value);

/** 数値 ｰ> 金額表示に変換する (入力が数値でない場合、空文字を返却する) */
export const cvtNumToPrice = (value?: ValType): string => {
  if (!isValidInt(value)) {
    return '';
  }

  return value.toLocaleString('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  });
};

/** 日付文字列 ｰ> 日付 に変換する */
export const cvtStrToDate = (value?: ValType): Date | null => {
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
export const calcResult = (value?: ValType): number => {
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
          if (!isValidInt(value)) {
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
export const compAmt = (valueA?: ValType, valueB?: ValType): number => {
  if (!isValidInt(valueA) && !isValidInt(valueB)) {
    return 0;
  } else if (!isValidInt(valueA)) {
    return 1;
  } else if (!isValidInt(valueB)) {
    return -1;
  }
  return valueA - valueB;
};

/** 金額のスタイルを返却する */
export const getStylePrice = (
  value?: ValType,
  cellStyle: CellStyle = {},
): CellStyle => {
  if (!isValidInt(value)) {
    return cellStyle;
  }

  cellStyle['color'] = (() => {
    if (value < 0) {
      return Const.FONT_CLR.AMT_NEGA;
    } else if (value > 0) {
      return Const.FONT_CLR.AMT_POSI;
    }
    return Const.FONT_CLR.DEF;
  })();
  return cellStyle;
};

/** セル共通スタイル */
export const getCellCmnStyle = (
  params: CellClassParams<Row, ValType>,
  cellStyle: CellStyle = {},
): CellStyle => {
  const valid = params.data?.[Const.CMN_COL.VALID] ?? true;
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
  fmtStr: string = Const.DATE_FMT.YYYY_MM_DD,
) => {
  return DateUtil.format(date, fmtStr);
};

/** 支払日を返却する */
export const getPayDate = (
  date: ValType,
  credit: ValType,
  creditList: Row[],
  formatStr: string = Const.DATE_FMT.YYYY_MM_DD,
): string => {
  if (
    !date ||
    typeof date !== 'string' ||
    credit === null ||
    typeof credit !== 'string'
  ) {
    return '';
  }

  const creditInf = creditList.find(
    (data) => data[Const.CRD_COL.ID] === credit,
  );

  if (!!creditInf && creditInf[Const.CRD_COL.ID] !== Const.MARK.NO_SELECT.id) {
    const closeDay = creditInf[Const.CRD_COL.CLOSE_DAY];
    const payDay = creditInf[Const.CRD_COL.PAY_DAY];
    const payMonth = creditInf[Const.CRD_COL.PAY_MONTH];
    const businessDays = creditInf[Const.CRD_COL.BUSINESS_DAYS];

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
export const calcPayDate = (payDateInf: PayDateInf): Date => {
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

  if (payDateInf.businessDays === Const.BIZ_DAYS.ALW) {
    // 支払日に条件がない場合
    return payDate;
  }
  return calcPayDateConsiderHoliday(payDate, payDateInf.businessDays);
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
  if (tbl === Const.TBL.MAIN) {
    // 入力データ用
    const useDateInput = !!row[Const.MAIN_COL.USE_DATE];
    const amtNumInput = calcResult(row[Const.MAIN_COL.AMOUNT]) !== Number.NaN;
    const amtInput = row[Const.MAIN_COL.AMOUNT] !== '';
    const memoInput = !!row[Const.MAIN_COL.MEMO];
    const stgSel = row[Const.MAIN_COL.STORAGE] !== Const.MARK.NO_SELECT.id;

    if (useDateInput && amtNumInput && memoInput && stgSel) {
      return Const.INPUT_MODE.ALL_REQ;
    } else if (!useDateInput && !amtInput && !memoInput && !stgSel) {
      return Const.INPUT_MODE.NONE;
    }
    return Const.INPUT_MODE.SOME_REQ;
  }

  // 入力データ以外
  const labelInput = !!row[Const.CMN_COL.LABEL];
  if (labelInput) {
    return Const.INPUT_MODE.ALL_REQ;
  }
  return Const.INPUT_MODE.NONE;
};

/** 入力モードが一致しているかをチェックする */
export const checkInputMode = (row: Row, mode: InputMode): boolean => {
  return row[Const.CMN_COL.INPUT_MODE] === mode;
};

/** 空データがあるかチェックする */
export const checkNoneData = (rows: Row[]): boolean => {
  return rows.some((row) => checkInputMode(row, Const.INPUT_MODE.NONE));
};

/** 指定行にジャンプする */
export const jumpRow = (gridApi?: GridApi<Row>, rowIdx?: number): void => {
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
export const jumpCol = (gridApi?: GridApi<Row>, colIdx?: number): void => {
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
export const getTblInitRow = (tbl: Tbl, rows: Row[]): Row => {
  const newRow = getTblDefRow(tbl);
  newRow[Const.CMN_COL.ID] = getNewRowId(rows);
  return newRow;
};

/** IDを採番した初期行データを返却する　※rowIdsを更新する */
export const getTblInitRow2 = (tbl: Tbl, rowIds: Set<ValType>): Row => {
  const newRow = getTblDefRow(tbl);
  newRow[Const.CMN_COL.ID] = getNewRowId2(rowIds);
  return newRow;
};

/** 一意なIDを採番する */
export const getNewRowId = (rows: Row[] = []): string => {
  const rowIds = new Set<ValType>();
  for (const row of rows) {
    rowIds.add(row[Const.CMN_COL.ID]);
  }
  return getNewRowId2(rowIds);
};

/** 一意なiDを採番する　※rowIdsを更新する */
export const getNewRowId2 = (rowIds = new Set<ValType>()): string => {
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

/** 保存用データを返却する */
export const getSaveRows = (tbl: Tbl, rows: Row[] = []): Row[] => {
  const saveRows: Row[] = [];
  const saveCols = getSaveCol(tbl);

  for (const row of rows) {
    const saveRow: Row = {};
    const defRow = getSaveDefRow(tbl);

    for (const col of saveCols) {
      if (
        row[col] === undefined ||
        row[col] === defRow[col] ||
        (!row[col] && !defRow[col])
      ) {
        continue;
      }

      if (tbl === Const.TBL.MAIN) {
        // 入力データ限定処理
        if (
          col === Const.MAIN_COL.DATE &&
          row[col] === row[Const.MAIN_COL.USE_DATE]
        ) {
          // 日付が利用日と同じ場合、日付を保存しない
          continue;
        }
      }

      saveRow[col] = row[col];
    }
    saveRows.push(saveRow);
  }

  return saveRows;
};

/** 読込用データを返却する */
export const getLoadRows = (tbl: Tbl, rows: Row[] = []): Row[] => {
  const editInputMode = (row: Row) => {
    return {
      ...row,
      [Const.CMN_COL.INPUT_MODE]: getInputMode(row, tbl),
    };
  };
  const editRow = (() => {
    if (tbl === Const.TBL.MAIN) {
      return (row: Row): Row => {
        row = {
          ...row,
          // 計算後数値データ
          [Const.MAIN_COL.AMOUNT_NUM]: calcResult(row[Const.MAIN_COL.AMOUNT]),
          // 日付データ
          [Const.MAIN_COL.DATE]:
            row[Const.MAIN_COL.DATE] || row[Const.MAIN_COL.USE_DATE],
        };
        return editInputMode(row);
      };
    }
    return (row: Row) => editInputMode(row);
  })();

  return structuredClone(rows).map((row) =>
    editRow({
      ...getSaveDefRow(tbl),
      ...row,
    }),
  );
};

/** 半角カタカナ->全角カタカナ,全角英数->半角英数 変換 */
export const convertToZKAndToHE = (value?: ValType): ValType =>
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

/** 行データからIDの一覧(Set)を作成して返却する */
export const getRowIdsSet = (rows: Row[]): Set<ValType> => {
  return new Set([...rows.map((row) => row[Const.CMN_COL.ID])]);
};

/** 行データからIDの一覧(Array)を作成して返却する */
export const getRowIds = (rows: Row[]): ValType[] => {
  return rows.map((row) => row[Const.CMN_COL.ID]);
};

/** 行編集更新情報を返却する */
export const getRowEdtUpd = (
  tbl: Tbl,
  updRows: Row[],
  updFlg = true,
): RowEdt => {
  return {
    type: Const.TBL_EDIT_TYPE.UPD,
    tbl,
    rows: updRows.map((row) => ({
      ...row,
      [Const.CMN_COL.UPDATE]: updFlg,
      [Const.CMN_COL.UPD_DATE_TIME]: getDate(
        undefined,
        Const.DATE_FMT.YY_MM_DD_HH_MM_SS,
      ),
      [Const.CMN_COL.INPUT_MODE]: getInputMode(row, tbl),
    })),
  };
};

/** 行編集追加情報を返却する(共通処理) */
const getRowEdtAddCmn = (
  tbl: Tbl,
  addRows: Row[],
  addIds: ValType[] = [],
): RowEdt => {
  addRows = structuredClone(addRows);
  addIds = [...addIds];
  for (let idx = 0; idx < addRows.length - addIds.length; idx++) {
    // addIdsのサイズが不足している場合追加する
    addIds.push(null);
  }

  return {
    type: Const.TBL_EDIT_TYPE.ADD,
    tbl,
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
): RowEdt => {
  return getRowEdtAddCmn(
    tbl,
    [
      ...addRows.map((row) => ({
        ...row,
        [Const.CMN_COL.ID]: getNewRowId2(rowIds),
        [Const.CMN_COL.UPDATE]: true,
        [Const.CMN_COL.UPD_DATE_TIME]: getDate(
          undefined,
          Const.DATE_FMT.YY_MM_DD_HH_MM_SS,
        ),
        [Const.CMN_COL.INPUT_MODE]: getInputMode(row, tbl),
      })),
    ],
    addIds,
  );
};

// /** 行編集追加情報(空データ)を返却する */
// export const getRowEdtAddNew2 = (
//   tbl: Tbl,
//   rowIds = new Set<ValType>(),
// ): RowEdt => {
//   return getRowEdtAddCmn(
//     tbl,
//     [{ ...getTblInitRow2(tbl, rowIds) }],
//     [Const.TBL_ADD_POS.MAX],
//   );
// };

/** 行編集追加情報(空データ)を返却する */
export const getRowEdtAddNew = (tbl: Tbl, rows: Row[]): RowEdt => {
  return getRowEdtAddCmn(
    tbl,
    [{ ...getTblInitRow(tbl, rows) }],
    [Const.TBL_ADD_POS.MAX],
  );
};

/** 行編集追加情報(未選択データ)を返却する */
export const getRowEdtAddNoSel = (tbl: Tbl): RowEdt => {
  return getRowEdtAddCmn(
    tbl,
    [
      {
        ...getTblDefRow(tbl),
        [Const.CMN_COL.ID]: Const.MARK.NO_SELECT.id,
        [Const.CMN_COL.LABEL]: Const.MARK.NO_SELECT.label,
        [Const.CMN_COL.INPUT_MODE]: Const.INPUT_MODE.ALL_REQ,
      },
    ],
    [Const.TBL_ADD_POS.MIN],
  );
};

/** 行編集削除情報を返却する */
export const getRowEdtDel = (
  tbl: Tbl,
  delIds: ValType[],
  rowIds = new Set<ValType>(),
): RowEdt => {
  delIds = [...delIds];
  for (const delId of delIds) {
    rowIds.delete(delId);
  }

  return {
    type: Const.TBL_EDIT_TYPE.DEL,
    tbl,
    delIds,
  };
};

/** 行編集移動情報を返却する */
export const getRowEdtDrg = (
  tbl: Tbl,
  delIds: ValType[],
  addIds: ValType[],
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
    type: Const.TBL_EDIT_TYPE.DRG,
    tbl,
    delIds,
    addIds,
  };
};
