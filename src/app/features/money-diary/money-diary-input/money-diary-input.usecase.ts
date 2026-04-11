import { Injectable, signal } from '@angular/core';
import { disabled, required, validate } from '@angular/forms/signals';
import {
  ColDef,
  ValueFormatterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import { addDays, addMonths, addYears } from 'date-fns';
import { Row } from 'src/app/domain/row-data';
import {
  DialogCustomInputExt,
  MoneyDiaryBaseUsecase,
  OpenDialogProcInput,
  OpenDialogProcOutput,
  OpenDialogProcRowEdt,
} from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import {
  BodyParamSchema,
  DialogButton,
  InputItem,
  InputItems,
  InputItemSetter,
} from 'src/app/shared/dialog-custom-input/dialog-custom-input.component';
import { MoneyStatus } from 'src/app/shared/money-status/money-status.component';
import {
  INPUT_RESTRICTIONS,
  RESERVED_WORD,
} from 'src/app/shared/signal-form/signal-form-value.derective';
import {
  SelectOption,
  ValType,
} from 'src/app/shared/signal-form/signal-form.component';
import {
  calcResult,
  cvtNumToPrice,
  isValidInt,
} from 'src/app/shared/utils/util-formula';
import {
  cvtDateToStr,
  DATE_FMT,
  getPayDate,
} from 'src/app/shared/utils/util-row';

import {
  checkInputMode,
  CMN_COL,
  getRowEdtAdd,
  getRowEdtUpd,
  getValByTblColAndCustomId,
  INPUT_MODE,
  MAIN_COL,
  MainCol,
  RowEdt,
  sortCmnPrc,
  TBL,
  Tbl,
} from 'src/app/shared/utils/util-row';

export const INPUT_OPTION_TYPE = {
  DEFAULT: 'default',
  REPLACE: 'replace',
  SERIAL_NUM: 'serialNumber',
  UPDATE: 'update',
};
export type InputOptionType =
  (typeof INPUT_OPTION_TYPE)[keyof typeof INPUT_OPTION_TYPE];
export type InputOption = {
  type?: InputOptionType;
};

/** 日付連番形式 */
const SERIAL_DATE_FMT_LIST = [
  { value: DATE_FMT.YYYY, label: 'Year' },
  { value: DATE_FMT.YYYY_MM, label: 'Month' },
  { value: DATE_FMT.YY_MM_DD, label: 'Day' },
] as const satisfies SelectOption[];

const RESERVED_STR = {
  ORG: '@o',
  SERIAL_NUM: '@c',
  SERIAL_DATE: '@d',
} as const;

const DIALOG_INPUT_ID = {
  CALC_RESULT: 'calcResult',
  TARGET_STRING: 'targetString',
  REPLACE_CHAR: 'replaceChar',
  SERIAL_NUM_INIT: 'serialNumberInit',
  SERIAL_NUM_FREQ_NUM: 'serialNumberFreqNum',
  DATE_FORMAT: 'serialDateFormat',
  SERIAL_DATE_INIT: 'serialDateInit',
  SERIAL_DATE_FREQ: 'serialDateFreq',
  SERIAL_DATE_FREQ_NUM: 'serialDateFreqNum',
  BEFORE_REPLACE: 'beforeReplace',
  AFTER_REPLACE: 'afterReplace',
} as const;

const CHECK_ID = '-check' as const;

const OTHER_COL_LIST: Record<string, MainCol> = {
  [TBL.STORAGE]: MAIN_COL.STORAGE,
  [TBL.CREDIT]: MAIN_COL.CREDIT,
  [TBL.ITEM]: MAIN_COL.ITEM,
  [TBL.REMARK]: MAIN_COL.REMARK,
};

@Injectable()
export class MoneyDiaryInputUsecase extends MoneyDiaryBaseUsecase {
  /**
   * 列定義を返却する
   * @param stgRows
   * @param crdRows
   * @param itmRows
   * @param rmkRows
   * @returns 列定義
   */
  override readonly getColDefs = (
    stgRows: Row[],
    crdRows: Row[],
    itmRows: Row[],
    rmkRows: Row[],
  ): ColDef<Row, ValType>[] => [
    ...this.addCmnColDefs([
      {
        headerName: 'Date',
        field: MAIN_COL.DATE,
        type: 'dateCol',
        pinned: 'left',
        width: 85,
        lockPosition: 'left',
        spanRows: true,
        valueSetter: (params) => this.dateSetter(params, crdRows),
        valueFormatter: this.dateFormatter,
        comparator: (_a, _b, nodeA, nodeB) =>
          sortCmnPrc(nodeA.data, nodeB.data, [
            { col: MAIN_COL.INPUT_MODE, asc: false },
            { col: MAIN_COL.DATE },
          ]),
        cellStyle: this.getCellCmnStyle,
      },
      {
        headerName: 'Amount',
        field: MAIN_COL.AMOUNT,
        type: 'amountCol',
        cellEditor: 'agTextCellEditor',
        filterValueGetter: `data.${MAIN_COL.AMOUNT_NUM}`,
        rowDrag: true,
        width: 120,
        valueFormatter: this.amountFormatter,
        comparator: (_a, _b, nodeA, nodeB) =>
          this.compAmt(
            nodeA.data?.[MAIN_COL.AMOUNT_NUM],
            nodeB.data?.[MAIN_COL.AMOUNT_NUM],
          ),
        cellStyle: (params) =>
          this.getStylePrice(params.data?.[MAIN_COL.AMOUNT_NUM]),
      },
      {
        headerName: 'AmountNum',
        field: MAIN_COL.AMOUNT_NUM,
        cellEditor: 'agNumberCellEditor',
        hide: true,
      },
      {
        headerName: 'Memo',
        field: MAIN_COL.MEMO,
        cellEditor: 'agLargeTextCellEditor',
        filter: 'agTextColumnFilter',
        width: 220,
      },
      {
        headerName: 'Storage',
        field: MAIN_COL.STORAGE,
        cellEditor: 'agSelectCellEditor',
        filter: 'agTextColumnFilter',
        width: 110,
        valueFormatter: (params) => this.listFormatter(stgRows, params.value),
        filterValueGetter: (params) =>
          this.listFormatter(stgRows, params.getValue(MAIN_COL.STORAGE)),
      },
      {
        headerName: 'Credit',
        field: MAIN_COL.CREDIT,
        cellEditor: 'agSelectCellEditor',
        filter: 'agTextColumnFilter',
        width: 110,
        valueSetter: (params) => this.dateSetter(params, crdRows),
        valueFormatter: (params) => this.listFormatter(crdRows, params.value),
        filterValueGetter: (params) =>
          this.listFormatter(crdRows, params.getValue(MAIN_COL.CREDIT)),
      },
      {
        headerName: 'Item',
        field: MAIN_COL.ITEM,
        cellEditor: 'agSelectCellEditor',
        filter: 'agTextColumnFilter',
        width: 100,
        valueFormatter: (params) => this.listFormatter(itmRows, params.value),
        filterValueGetter: (params) =>
          this.listFormatter(itmRows, params.getValue(MAIN_COL.ITEM)),
      },
      {
        headerName: 'Remark',
        field: MAIN_COL.REMARK,
        cellEditor: 'agSelectCellEditor',
        filter: 'agTextColumnFilter',
        width: 100,
        valueFormatter: (params) => this.listFormatter(rmkRows, params.value),
        filterValueGetter: (params) =>
          this.listFormatter(rmkRows, params.getValue(MAIN_COL.REMARK)),
      },
      {
        headerName: 'Use Date',
        field: MAIN_COL.USE_DATE,
        type: 'dateCol',
        hide: true,
        width: 100,
        valueSetter: (params) => this.dateSetter(params, crdRows),
        valueFormatter: this.dateFormatter,
        comparator: (_a, _b, nodeA, nodeB) =>
          sortCmnPrc(nodeA.data, nodeB.data, [
            { col: MAIN_COL.USE_DATE },
            { col: MAIN_COL.INPUT_MODE, asc: false },
          ]),
      },
      {
        headerName: 'Pay Date',
        field: MAIN_COL.PAY_DATE,
        type: 'dateCol',
        width: 100,
        valueFormatter: this.dateFormatter,
        comparator: (_a, _b, nodeA, nodeB) =>
          sortCmnPrc(nodeA.data, nodeB.data, [
            { col: MAIN_COL.PAY_DATE },
            { col: MAIN_COL.INPUT_MODE, asc: false },
          ]),
      },
    ]),
  ];

  /**
   * 日付セッター
   * @param params
   * @param crdRows
   * @returns 真偽値
   */
  private readonly dateSetter = (
    params: ValueSetterParams<Row, ValType>,
    crdRows: Row[],
  ): boolean => {
    if (!this.newValSetter(params)) {
      return false;
    }
    params.data[MAIN_COL.PAY_DATE] = getPayDate(
      params.data[MAIN_COL.USE_DATE],
      params.data[MAIN_COL.CREDIT],
      crdRows,
    );
    return true;
  };

  /**
   * 金額フォーマッター
   * @param params
   * @returns 金額
   */
  private readonly amountFormatter = (
    params: ValueFormatterParams<Row, ValType>,
  ): string => {
    return cvtNumToPrice(params.data?.[MAIN_COL.AMOUNT_NUM]);
  };

  /**
   * 行データを初期化する
   * @param rows
   * @param crdRows
   * @returns 初期化後の行データ
   */
  override readonly getRows = (rows: Row[], crdRows: Row[]): Row[] => {
    const datas = structuredClone(rows);
    for (const data of datas) {
      // 支払日
      data[MAIN_COL.PAY_DATE] = getPayDate(
        data[MAIN_COL.USE_DATE],
        data[MAIN_COL.CREDIT],
        crdRows,
      );
    }
    return datas;
  };

  /**
   * ステータスリストを返却する
   * @param rows
   * @param crdRows
   * @returns
   */
  readonly calcStatusList = (rows: Row[], crdRows: Row[]): MoneyStatus[] => {
    let cnt = 0;
    let savings = 0;
    let savingsLast = 0;
    const today = cvtDateToStr();

    for (const row of rows) {
      const num = row?.[MAIN_COL.AMOUNT_NUM];
      if (
        !row ||
        !checkInputMode(row, INPUT_MODE.ALL_REQ) ||
        !isValidInt(num)
      ) {
        continue;
      }

      const payDate = getPayDate(
        row[MAIN_COL.USE_DATE],
        row[MAIN_COL.CREDIT],
        crdRows,
      );
      if (payDate <= today) {
        savings += num;
      }

      cnt++;
      savingsLast += num;
    }

    return [
      {
        label: 'Cnt All',
        value: cnt.toString(),
      },
      {
        label: 'Savings',
        value: cvtNumToPrice(savings),
      },
      {
        label: 'Last Savings',
        value: cvtNumToPrice(savingsLast),
      },
    ];
  };

  /**
   * 選択行の金額を計算して返却する
   * @param rows
   * @returns
   */
  override readonly calcSelStatus = (rows: Row[]): MoneyStatus[] => {
    const labels = ['Cnt', 'Sum', 'Inc', 'Exp'];
    const status = labels.map((label) => ({ label, amount: 0 }));
    // 収支計算
    for (const data of rows) {
      const num = Number(data[MAIN_COL.AMOUNT_NUM]);
      if (!isValidInt(num)) {
        continue;
      }
      if (num > 0) {
        status[2].amount += num;
      } else if (num < 0) {
        status[3].amount += num;
      }
      status[1].amount += num;
    }
    return status.map((st, idx) => ({
      label: st.label,
      value: !idx ? rows.length.toString() : cvtNumToPrice(st.amount),
    }));
  };

  /**
   * ダイアログ入力データ作成
   * @param procInput
   * @returns 入力データ
   */
  override readonly createDialogInputData = (
    procInput: OpenDialogProcInput,
  ): DialogCustomInputExt => {
    const type = procInput?.option?.type;
    if (type in this.funcByInputOptionType) {
      return this.funcByInputOptionType[type].input(procInput);
    } else {
      throw new Error('Invalid input option type');
    }
  };

  /**
   * ダイアログ入力データ作成(置換時)
   * @param procInput
   * @returns 入力データ
   */
  private readonly createDialogInputDataRep = (
    procInput: OpenDialogProcInput,
  ): DialogCustomInputExt => {
    const { selectedRows } = procInput;

    /*************************
     * 入力データ
     *************************/
    const data = signal({
      [DIALOG_INPUT_ID.BEFORE_REPLACE]: selectedRows
        .map((row) => row[MAIN_COL.MEMO])
        .join('\n'),
    });

    /*************************
     * 各setterの設定
     *************************/
    // Preview Setter
    const previewSetter: InputItemSetter = ({ form }) => {
      const target =
        form[DIALOG_INPUT_ID.TARGET_STRING]().value()?.toString() ?? '';
      const replace =
        form[DIALOG_INPUT_ID.REPLACE_CHAR]().value()?.toString() ?? '';

      const val = this.getRowsReplacedMemo(selectedRows, target, replace)
        .map((row) => row[MAIN_COL.MEMO])
        .join('\n');
      form[DIALOG_INPUT_ID.AFTER_REPLACE]().value.set(val);
    };

    /*************************
     * 表示項目
     *************************/
    const items: InputItems = [
      {
        id: DIALOG_INPUT_ID.BEFORE_REPLACE,
        label: 'Before Memo',
        type: 'textarea',
        notReturn: true,
        style: {
          height: `${24 * 3}px`,
          'text-wrap-mode': 'nowrap',
        },
      },
      {
        id: DIALOG_INPUT_ID.AFTER_REPLACE,
        label: 'After Memo',
        type: 'textarea',
        notReturn: true,
        style: {
          height: `${24 * 3}px`,
          'text-wrap-mode': 'nowrap',
        },
      },
      {
        id: DIALOG_INPUT_ID.TARGET_STRING,
        label: 'Target String',
        setter: previewSetter,
      },
      {
        id: DIALOG_INPUT_ID.REPLACE_CHAR,
        label: 'Replace Char',
        setter: previewSetter,
      },
    ];

    /*************************
     * スキーマ
     *************************/
    const schema: BodyParamSchema = (tree) => {
      disabled(tree[DIALOG_INPUT_ID.BEFORE_REPLACE]);
      disabled(tree[DIALOG_INPUT_ID.AFTER_REPLACE]);
      required(tree[DIALOG_INPUT_ID.TARGET_STRING]);
    };

    /*************************
     * ボタン
     *************************/
    const buttons: DialogButton = {
      del: { hide: true },
      add: { hide: true },
      reset: { hide: true },
    };

    // ダイアログパラメータ
    const input: DialogCustomInputExt = {
      data,
      param: {
        header: {
          title: 'Money Diary Replace',
        },
        body: {
          items,
          schema,
        },
        footer: {
          buttons,
        },
      },
    };

    return input;
  };

  /**
   * 指定された行のメモを置換して返却する
   * @param rows
   * @param target
   * @param replace
   * @returns 置換後の行配列
   */
  private readonly getRowsReplacedMemo = (
    rows: Row[],
    target: string,
    replace: string,
  ): Row[] => {
    if (!!target) {
      const targetRegExp = (() => {
        try {
          return new RegExp(target, 'g');
        } catch (e) {
          return target;
        }
      })();
      rows = structuredClone(rows);
      for (const row of rows) {
        row[MAIN_COL.MEMO] =
          row[MAIN_COL.MEMO]?.toString().replace(targetRegExp, replace) ?? null;
      }
    }
    return rows;
  };

  /**
   * ダイアログ入力データ作成(連番付与時)
   * @param procInput
   * @returns 入力データ
   */
  private readonly createDialogInputDataSerialNum = (
    procInput: OpenDialogProcInput,
  ): DialogCustomInputExt => {
    const { selectedRows } = procInput;

    /*************************
     * 入力データ
     *************************/
    const data = signal({
      [DIALOG_INPUT_ID.BEFORE_REPLACE]: selectedRows
        .map((row) => row[MAIN_COL.MEMO])
        .join('\n'),
      [MAIN_COL.MEMO]: RESERVED_STR.ORG,
    });

    /*************************
     * 各setterの設定
     *************************/
    const previewSetter: InputItemSetter = ({ form }) => {
      const getVal = (id: string) => form[id]().value()?.toString() ?? '';
      const val = this.getRowsSerialNum(
        selectedRows,
        getVal(MAIN_COL.MEMO),
        getVal(DIALOG_INPUT_ID.SERIAL_NUM_INIT),
        getVal(DIALOG_INPUT_ID.SERIAL_NUM_FREQ_NUM),
        getVal(DIALOG_INPUT_ID.DATE_FORMAT),
        getVal(DIALOG_INPUT_ID.SERIAL_DATE_INIT),
        getVal(DIALOG_INPUT_ID.SERIAL_DATE_FREQ),
        getVal(DIALOG_INPUT_ID.SERIAL_DATE_FREQ_NUM),
      )
        .map((row) => row[MAIN_COL.MEMO])
        .join('\n');
      form[DIALOG_INPUT_ID.AFTER_REPLACE]().value.set(val);
    };

    /*************************
     * 表示項目
     *************************/
    const items: InputItems = [
      {
        id: DIALOG_INPUT_ID.BEFORE_REPLACE,
        label: 'Before Memo',
        type: 'textarea',
        notReturn: true,
        style: {
          height: `${24 * 3}px`,
          'text-wrap-mode': 'nowrap',
        },
      },
      {
        id: DIALOG_INPUT_ID.AFTER_REPLACE,
        label: 'After Memo',
        type: 'textarea',
        notReturn: true,
        style: {
          height: `${24 * 3}px`,
          'text-wrap-mode': 'nowrap',
        },
      },
      {
        id: 'label',
        type: 'label',
        defVal: '@o:以前の文字を使用, @c:連番付与, @d:日付連番付与',
        notReturn: true,
      },
      {
        id: MAIN_COL.MEMO,
        label: 'Memo',
        type: 'textarea',
        setter: previewSetter,
        invalidReservedWord: true,
      },
      [
        {
          id: DIALOG_INPUT_ID.SERIAL_NUM_INIT,
          label: 'Serial Number Init',
          type: 'number',
          defVal: 1,
          setter: previewSetter,
        },
        {
          id: DIALOG_INPUT_ID.SERIAL_NUM_FREQ_NUM,
          label: 'Serial Number Freq Num',
          type: 'number',
          defVal: 1,
          setter: previewSetter,
        },
      ],
      [
        {
          id: DIALOG_INPUT_ID.DATE_FORMAT,
          label: 'Serial Date Format',
          type: 'select',
          defVal: DATE_FMT.YYYY_MM,
          options: SERIAL_DATE_FMT_LIST,
          setter: previewSetter,
        },
        {
          id: DIALOG_INPUT_ID.SERIAL_DATE_INIT,
          label: 'Serial Date Init',
          type: 'date',
          setter: previewSetter,
        },
      ],
      [
        {
          id: DIALOG_INPUT_ID.SERIAL_DATE_FREQ,
          label: 'Serial Date Freq',
          type: 'select',
          defVal: DATE_FMT.YYYY_MM,
          options: SERIAL_DATE_FMT_LIST,
          setter: previewSetter,
        },
        {
          id: DIALOG_INPUT_ID.SERIAL_DATE_FREQ_NUM,
          label: 'Serial Date Freq Num',
          type: 'number',
          defVal: 1,
          setter: previewSetter,
        },
      ],
    ];

    /*************************
     * スキーマ
     *************************/
    const schema: BodyParamSchema = (tree) => {
      const disabledKeyMap = {
        [DIALOG_INPUT_ID.BEFORE_REPLACE]: undefined,
        [DIALOG_INPUT_ID.AFTER_REPLACE]: undefined,
        [DIALOG_INPUT_ID.SERIAL_NUM_INIT]: RESERVED_STR.SERIAL_NUM,
        [DIALOG_INPUT_ID.SERIAL_NUM_FREQ_NUM]: RESERVED_STR.SERIAL_NUM,
        [DIALOG_INPUT_ID.DATE_FORMAT]: RESERVED_STR.SERIAL_DATE,
        [DIALOG_INPUT_ID.SERIAL_DATE_INIT]: RESERVED_STR.SERIAL_DATE,
        [DIALOG_INPUT_ID.SERIAL_DATE_FREQ]: RESERVED_STR.SERIAL_DATE,
        [DIALOG_INPUT_ID.SERIAL_DATE_FREQ_NUM]: RESERVED_STR.SERIAL_DATE,
      };

      for (const [key, whenKey] of Object.entries(disabledKeyMap)) {
        disabled(
          tree[key],
          whenKey &&
            (({ valueOf }) =>
              !(valueOf(tree[MAIN_COL.MEMO])?.toString() ?? '').includes(
                whenKey,
              )),
        );
      }
    };

    /*************************
     * ボタン
     *************************/
    const buttons: DialogButton = {
      del: { hide: true },
      add: { hide: true },
    };

    // ダイアログパラメータ
    const input: DialogCustomInputExt = {
      data,
      param: {
        header: {
          title: 'Money Diary Serial Number',
        },
        body: {
          items,
          schema,
        },
        footer: {
          buttons,
        },
      },
    };

    return input;
  };

  /**
   * 指定された行のメモに連番を付与して返却する
   * @param rows
   * @param memo
   * @param numInit
   * @param numFreq
   * @param dateFormat
   * @param dateInit
   * @param dateFreq
   * @param dateFreqNumStr
   * @returns 連番付与後の行配列
   */
  private readonly getRowsSerialNum = (
    rows: Row[],
    memo: string,
    numInit: string,
    numFreq: string,
    dateFormat: string,
    dateInit: string,
    dateFreq: string,
    dateFreqNumStr: string,
  ): Row[] => {
    rows = structuredClone(rows);
    let serialNum = Number(numInit);
    let numberFreqNum = Number(numFreq);
    let serialDate = dateInit;
    let dateFreqNum = Number(dateFreqNumStr);

    for (const row of rows) {
      // 連番
      const serialNumStr = serialNum.toString();
      serialNum += numberFreqNum;
      // 日付連番
      let serialDateStr = '';
      if (!!serialDate) {
        serialDateStr = cvtDateToStr(serialDate, dateFormat || undefined);
      } else {
        serialDateStr = '';
      }
      if (!!serialDate) {
        let date = new Date(serialDate);
        if (dateFreq === DATE_FMT.YYYY) {
          date = addYears(serialDate, dateFreqNum);
        } else if (dateFreq === DATE_FMT.YYYY_MM) {
          date = addMonths(serialDate, dateFreqNum);
        } else if (dateFreq === DATE_FMT.YY_MM_DD) {
          date = addDays(serialDate, dateFreqNum);
        }
        serialDate = cvtDateToStr(date);
      }

      // 連番付与
      const [originalRegExp, serialNumRegExp, serialDateRegExp] = [
        RESERVED_STR.ORG,
        RESERVED_STR.SERIAL_NUM,
        RESERVED_STR.SERIAL_DATE,
      ].map((str) => new RegExp(str, 'g'));
      row[MAIN_COL.MEMO] = memo
        // オリジナルのメモ内容を反映
        .replace(originalRegExp, row[MAIN_COL.MEMO]?.toString() ?? '')
        // 連番情報を反映
        .replace(serialNumRegExp, serialNumStr)
        // 日付連番情報を反映
        .replace(serialDateRegExp, serialDateStr)
        // 予約語を除去
        .replace(RESERVED_WORD, '');
    }

    return rows;
  };

  /**
   * ダイアログ入力データ作成(まとめて更新時)
   * @param procInput
   * @return 入力データ
   */
  private readonly createDialogInputDataUpd = (
    procInput: OpenDialogProcInput,
  ): DialogCustomInputExt => {
    const { selectedRows } = procInput;

    /*************************
     * 入力データ
     *************************/
    const initVal = (key: string) => {
      const match = selectedRows.every(
        (row) => row[key] === selectedRows[0][key],
      );
      return match ? selectedRows[0][key] : '';
    };
    const data = signal({
      [MAIN_COL.DATE]: initVal(MAIN_COL.DATE),
      [MAIN_COL.USE_DATE]: initVal(MAIN_COL.USE_DATE),
      [MAIN_COL.AMOUNT]: initVal(MAIN_COL.AMOUNT),
      [MAIN_COL.MEMO]: initVal(MAIN_COL.MEMO),
      [MAIN_COL.STORAGE]: initVal(MAIN_COL.STORAGE),
      [MAIN_COL.CREDIT]: initVal(MAIN_COL.CREDIT),
      [MAIN_COL.ITEM]: initVal(MAIN_COL.ITEM),
      [MAIN_COL.REMARK]: initVal(MAIN_COL.REMARK),
      [MAIN_COL.DATE + CHECK_ID]: { '1': true },
      [MAIN_COL.USE_DATE + CHECK_ID]: { '1': true },
      [MAIN_COL.PAY_DATE + CHECK_ID]: { '1': true },
      [MAIN_COL.AMOUNT + CHECK_ID]: { '1': true },
      [MAIN_COL.MEMO + CHECK_ID]: { '1': true },
      [MAIN_COL.STORAGE + CHECK_ID]: { '1': true },
      [MAIN_COL.CREDIT + CHECK_ID]: { '1': true },
      [MAIN_COL.ITEM + CHECK_ID]: { '1': true },
      [MAIN_COL.REMARK + CHECK_ID]: { '1': true },
    });

    /*************************
     * セレクトボックスの設定
     *************************/
    const selRec = Object.keys(OTHER_COL_LIST).reduce(
      (rec, tbl) => {
        rec[tbl] = this.createSelInfo({
          ...procInput,
          tbl: tbl as Tbl,
          selectedRows: selectedRows.with(0, {
            ...selectedRows[0],
            [OTHER_COL_LIST[tbl]]: initVal(OTHER_COL_LIST[tbl]),
          }),
        });
        return rec;
      },
      {} as Record<string, { disabled: boolean; options: SelectOption[] }>,
    );

    /***********************************
     * オートコンプリートメモデータの設定
     ***********************************/
    const autocompMemoData = this.createAutocompMemo(procInput, false);

    /*************************
     * 各setterの設定
     *************************/
    // 支払日 setter
    const payDateSetter = this.createPayDateSetter(procInput);

    // 計算結果 setter
    const calcResultSetter = this.createCalcResultSetter();

    /*************************
     * 表示項目
     *************************/
    const checkData = (id: string): InputItem => ({
      id: id + CHECK_ID,
      type: 'checkbox',
      options: [{ label: '', value: '1' }],
      formStyle: { 'max-width': '40px' },
    });

    const items: InputItems = [
      [
        {
          id: MAIN_COL.DATE,
          label: 'Date',
          type: 'date',
        },
        checkData(MAIN_COL.DATE),
      ],
      [
        {
          id: MAIN_COL.USE_DATE,
          label: 'Use Date',
          type: 'date',
          setter: payDateSetter,
        },
        checkData(MAIN_COL.USE_DATE),
      ],
      [
        {
          id: MAIN_COL.PAY_DATE,
          label: 'Pay Date',
          type: 'date',
        },
        checkData(MAIN_COL.PAY_DATE),
      ],
      [
        {
          id: MAIN_COL.AMOUNT,
          label: 'Amount',
          type: 'tel',
          placeholder: 'Ex. -(200+500)',
          forbiddenChars: INPUT_RESTRICTIONS.AMT,
          setter: calcResultSetter,
        },
        {
          // 計算結果表示用
          id: 'calcResult',
          notReturn: true,
        },
        checkData(MAIN_COL.AMOUNT),
      ],
      [
        {
          id: MAIN_COL.MEMO,
          label: 'Memo',
          type: 'textarea',
          placeholder: 'Ex. 夕食代',
          options: autocompMemoData,
          style: {
            height: `${24 * 3}px`,
          },
        },
        checkData(MAIN_COL.MEMO),
      ],
      [
        {
          id: MAIN_COL.STORAGE,
          label: 'Storage',
          type: 'select',
          options: selRec[MAIN_COL.STORAGE].options,
        },
        checkData(MAIN_COL.STORAGE),
        {
          id: MAIN_COL.CREDIT,
          label: 'Credit',
          type: 'select',
          options: selRec[MAIN_COL.CREDIT].options,
          setter: payDateSetter,
        },
        checkData(MAIN_COL.CREDIT),
      ],
      [
        {
          id: MAIN_COL.ITEM,
          label: 'Item',
          type: 'select',
          options: selRec[MAIN_COL.ITEM].options,
        },
        checkData(MAIN_COL.ITEM),
        {
          id: MAIN_COL.REMARK,
          label: 'Remark',
          type: 'select',
          options: selRec[MAIN_COL.REMARK].options,
        },
        checkData(MAIN_COL.REMARK),
      ],
    ];

    /*************************
     * スキーマ
     *************************/
    const schema: BodyParamSchema = (tree) => {
      disabled(tree[MAIN_COL.PAY_DATE]);
      disabled(tree['calcResult']);
      for (const col of [
        MAIN_COL.STORAGE,
        MAIN_COL.CREDIT,
        MAIN_COL.ITEM,
        MAIN_COL.REMARK,
      ]) {
        if (selRec[col].disabled) {
          disabled(tree[col]);
        }
      }
      for (const col of [
        MAIN_COL.DATE,
        MAIN_COL.USE_DATE,
        MAIN_COL.AMOUNT,
        MAIN_COL.MEMO,
        MAIN_COL.STORAGE,
        MAIN_COL.CREDIT,
        MAIN_COL.ITEM,
        MAIN_COL.REMARK,
      ]) {
        disabled(tree[col], ({ valueOf }) => {
          const check = valueOf(tree[col + CHECK_ID]);
          return typeof check === 'object' && !!check?.['1'];
        });
      }
      disabled(tree[MAIN_COL.PAY_DATE + CHECK_ID]);
    };

    /*************************
     * ボタン
     *************************/
    const buttons: DialogButton = {
      del: { hide: true },
      add: { hide: true },
    };

    // ダイアログパラメータ
    const input: DialogCustomInputExt = {
      data,
      param: {
        header: {
          title: 'Money Diary Update',
        },
        body: {
          items,
          schema,
        },
        footer: {
          buttons,
        },
      },
    };

    return input;
  };

  /**
   * ダイアログ入力データ作成(デフォルト)
   * @param procInput
   * @returns 入力データ
   */
  private readonly createDialogInputDataDef = (
    procInput: OpenDialogProcInput,
  ): DialogCustomInputExt => {
    const { tbl, allTblRows, selectedRows } = procInput;
    const [selectedRow] = selectedRows;

    /*************************
     * 入力データ
     *************************/
    const initDate = (id: string) => {
      if (checkInputMode(selectedRow, INPUT_MODE.NONE)) {
        return cvtDateToStr();
      }
      return selectedRow[id];
    };

    const data = signal({
      [MAIN_COL.DATE]: initDate(MAIN_COL.DATE),
      [MAIN_COL.USE_DATE]: initDate(MAIN_COL.USE_DATE),
      [MAIN_COL.AMOUNT]: selectedRow[MAIN_COL.AMOUNT],
      [MAIN_COL.MEMO]: selectedRow[MAIN_COL.MEMO],
      [MAIN_COL.STORAGE]: selectedRow[MAIN_COL.STORAGE],
      [MAIN_COL.CREDIT]: selectedRow[MAIN_COL.CREDIT],
      [MAIN_COL.ITEM]: selectedRow[MAIN_COL.ITEM],
      [MAIN_COL.REMARK]: selectedRow[MAIN_COL.REMARK],
    });

    /*************************
     * セレクトボックスの設定
     *************************/
    const selRec = Object.keys(OTHER_COL_LIST).reduce(
      (rec, tbl) => {
        rec[tbl] = this.createSelInfo({ ...procInput, tbl: tbl as Tbl });
        return rec;
      },
      {} as Record<string, { disabled: boolean; options: SelectOption[] }>,
    );

    /***********************************
     * オートコンプリートメモデータの設定
     ***********************************/
    const autocompMemoData = this.createAutocompMemo({ ...procInput }, true);

    /*************************
     * 各setterの設定
     *************************/
    // 支払日 setter
    const payDateSetter = this.createPayDateSetter(procInput);

    // 計算結果 setter
    const calcResultSetter = this.createCalcResultSetter();

    // メモ setter
    const memoSetter: InputItemSetter = ({ form, event }) => {
      if (event.type === 'autocomp') {
        // オートコンプリートで選択した場合
        const data = allTblRows[tbl]
          .toReversed()
          .find((dt) => dt[CMN_COL.ID] === event.option.id);
        if (!data) {
          // 選択したメモが空の場合
          return;
        }

        const checkKeys = [
          MAIN_COL.STORAGE,
          MAIN_COL.CREDIT,
          MAIN_COL.ITEM,
          MAIN_COL.REMARK,
        ];
        if (
          checkKeys.some(
            (key) =>
              form[key]().value() !== getValByTblColAndCustomId(tbl, key),
          )
        ) {
          // 初期値でない入力値が1箇所でもある場合
          return;
        }

        const keys = [
          MAIN_COL.AMOUNT,
          MAIN_COL.STORAGE,
          MAIN_COL.CREDIT,
          MAIN_COL.ITEM,
          MAIN_COL.REMARK,
        ];
        for (const key of keys) {
          if (key === MAIN_COL.AMOUNT && !!form[key]().value()) {
            // 金額の入力値が既にある場合
            continue;
          }
          form[key]().value.set(data[key]);
        }

        const dateKeys = [MAIN_COL.DATE, MAIN_COL.USE_DATE];
        if (dateKeys.some((key) => !!form[key]().value())) {
          // 日付/利用日のどちらかが入力済の場合
          return;
        }
        for (const key of dateKeys) {
          form[key]().value.set(data[key]);
        }
      }
    };

    /*************************
     * 表示項目
     *************************/
    const items: InputItems = [
      [
        {
          id: MAIN_COL.DATE,
          label: 'Date',
          type: 'date',
        },
        {
          id: MAIN_COL.USE_DATE,
          label: 'Use Date',
          type: 'date',
          setter: payDateSetter,
        },
      ],
      {
        id: MAIN_COL.PAY_DATE,
        label: 'Pay Date',
        type: 'date',
      },
      [
        {
          id: MAIN_COL.AMOUNT,
          label: 'Amount',
          type: 'tel',
          placeholder: 'Ex. -(200+500)',
          forbiddenChars: INPUT_RESTRICTIONS.AMT,
          setter: calcResultSetter,
        },
        {
          // 計算結果表示用
          id: 'calcResult',
          label: 'Calc Result',
          notReturn: true,
        },
      ],
      {
        id: MAIN_COL.MEMO,
        label: 'Memo',
        type: 'textarea',
        placeholder: 'Ex. 夕食代',
        options: autocompMemoData,
        setter: memoSetter,
        style: {
          height: `${24 * 3}px`,
        },
      },
      [
        {
          id: MAIN_COL.STORAGE,
          label: 'Storage',
          type: 'select',
          options: selRec[MAIN_COL.STORAGE].options,
        },
        {
          id: MAIN_COL.CREDIT,
          label: 'Credit',
          type: 'select',
          options: selRec[MAIN_COL.CREDIT].options,
          setter: payDateSetter,
        },
      ],
      [
        {
          id: MAIN_COL.ITEM,
          label: 'Item',
          type: 'select',
          options: selRec[MAIN_COL.ITEM].options,
        },
        {
          id: MAIN_COL.REMARK,
          label: 'Remark',
          type: 'select',
          options: selRec[MAIN_COL.REMARK].options,
        },
      ],
    ];

    /*************************
     * スキーマ
     *************************/
    const schema: BodyParamSchema = (tree) => {
      disabled(tree[MAIN_COL.PAY_DATE]);
      disabled(tree['calcResult']);
      for (const col of [
        MAIN_COL.STORAGE,
        MAIN_COL.CREDIT,
        MAIN_COL.ITEM,
        MAIN_COL.REMARK,
      ]) {
        if (selRec[col].disabled) {
          disabled(tree[col]);
        }
      }
      validate(tree, ({ fieldTree }) => {
        if (items.flat().some((item) => fieldTree[item.id]().invalid())) {
          return [{ kind: 'move' }];
        }
        return null;
      });
    };

    /*************************
     * ボタン
     *************************/
    const buttons: DialogButton = {
      move: {
        icon: 'drive_file_move',
        color: 'accent',
        order: 4,
        handleClick: (_, dialogRef) => {
          dialogRef.close({
            status: 'move',
          });
        },
      },
    };

    // ダイアログパラメータ
    const input: DialogCustomInputExt = {
      data,
      param: {
        header: {
          title: 'Money Diary',
        },
        body: {
          items,
          schema,
        },
        footer: {
          buttons,
        },
      },
    };

    return input;
  };

  /**
   * セレクトボックス情報作成処理
   * @param procInput
   * @returns セレクトボックス情報
   */
  private readonly createSelInfo = ({
    tbl,
    allTblRows,
    selectedRows,
  }: OpenDialogProcInput): { disabled: boolean; options: SelectOption[] } => {
    const col = OTHER_COL_LIST[tbl];

    // セレクトボックスの一致項目が無効化されている場合 true を設定
    const disabled = allTblRows[tbl].some(
      (row) => row[CMN_COL.ID] === selectedRows[0][col] && !row[CMN_COL.VALID],
    );
    // セレクトボックスの中身を設定
    const options = allTblRows[tbl]
      .filter((row) => {
        if (disabled) {
          // 非活性の場合
          return !!row[CMN_COL.LABEL];
        }
        // 上記以外
        return !!row[CMN_COL.LABEL] && !!row[CMN_COL.VALID];
      })
      .map((row) => ({
        value: row[CMN_COL.ID]!.toString(),
        label: row[CMN_COL.LABEL]!.toString(),
      }));
    // セレクトボックス情報を設定
    return { disabled, options };
  };

  /**
   * オートコンプリート用メモデータ作成処理
   * @param procInput
   * @param singleRow
   * @returns オートコンプリート用メモデータ
   */
  private readonly createAutocompMemo = (
    { tbl, allTblRows, selectedRows }: OpenDialogProcInput,
    singleRow: boolean,
  ): SelectOption[] => {
    const optLabelSet: Set<string> = new Set();
    return allTblRows[tbl].toReversed().reduce((arr, row) => {
      if (
        (singleRow && row[CMN_COL.ID] === selectedRows[0][CMN_COL.ID]) ||
        !row[MAIN_COL.MEMO]
      ) {
        // 編集対象、またはメモが空欄の場合、オートコンプリートに追加しない
        return arr;
      }

      const storageId = row[MAIN_COL.STORAGE]?.toString() ?? '';
      const storage =
        allTblRows[TBL.STORAGE]
          .find((dt) => dt[CMN_COL.ID] === storageId)
          ?.[CMN_COL.LABEL]?.toString() ?? '';
      const value = row[MAIN_COL.MEMO]?.toString() ?? '';
      const label = value + (!!storage ? `　${storage}` : '');

      if (!!label && !optLabelSet.has(label)) {
        optLabelSet.add(label);
        arr.push({
          id: row[CMN_COL.ID]?.toString() ?? '',
          value,
          label,
        });
      }
      return arr;
    }, [] as SelectOption[]);
  };

  /**
   * 支払日 setter 作成処理
   * @param procInput
   * @returns 支払日 setter
   */
  private readonly createPayDateSetter = ({
    allTblRows,
  }: OpenDialogProcInput): InputItemSetter => {
    return ({ form }) => {
      const useDate = form[MAIN_COL.USE_DATE]().value();
      const credit = form[MAIN_COL.CREDIT]().value();

      let val = '';
      if (useDate !== undefined && credit !== undefined) {
        val = getPayDate(useDate, credit, allTblRows[TBL.CREDIT]);
      }

      form[MAIN_COL.PAY_DATE]().value.set(val);
    };
  };

  /**
   * 計算結果 setter 作成処理
   * @returns 計算結果 setter
   */
  private readonly createCalcResultSetter = (): InputItemSetter => {
    return ({ form }) => {
      const amount = form[MAIN_COL.AMOUNT]().value();
      const val = cvtNumToPrice(calcResult(amount as string));

      form['calcResult']().value.set(val);
    };
  };

  /**
   * 出力データ作成処理
   * @param procInput
   * @returns 出力データ
   */
  protected override readonly createOutputRows = (
    procInput: OpenDialogProcOutput,
  ): Row[] => {
    const type = procInput?.option?.type;
    if (type in this.funcByInputOptionType) {
      return this.funcByInputOptionType[type].output(procInput);
    } else {
      throw new Error('Invalid input option type');
    }
  };

  /**
   * 出力データ作成処理(置換時)
   * @param procInput
   * @returns 出力データ
   */
  private readonly createOutputRowsRep = ({
    outputDatas,
    selectedRows,
  }: OpenDialogProcOutput): Row[] => {
    const [target, replace] = [
      DIALOG_INPUT_ID.TARGET_STRING,
      DIALOG_INPUT_ID.REPLACE_CHAR,
    ].map(
      (id) =>
        outputDatas.find((data) => data.key === id)?.value?.toString() ?? '',
    );
    return this.getRowsReplacedMemo(selectedRows, target, replace);
  };

  /**
   * 出力データ作成処理(連番付与時)
   * @param procInput
   * @returns 出力データ
   */
  private readonly createOutputRowsSerialNum = ({
    outputDatas,
    selectedRows,
  }: OpenDialogProcOutput): Row[] => {
    const [
      memo,
      serialNumInit,
      serialNumFreq,
      serialDateFormat,
      serialDateInit,
      serialDateFreq,
      serialDateFreqNum,
    ] = [
      MAIN_COL.MEMO,
      DIALOG_INPUT_ID.SERIAL_NUM_INIT,
      DIALOG_INPUT_ID.SERIAL_NUM_FREQ_NUM,
      DIALOG_INPUT_ID.DATE_FORMAT,
      DIALOG_INPUT_ID.SERIAL_DATE_INIT,
      DIALOG_INPUT_ID.SERIAL_DATE_FREQ,
      DIALOG_INPUT_ID.SERIAL_DATE_FREQ_NUM,
    ].map(
      (id) =>
        outputDatas.find((data) => data.key === id)?.value?.toString() ?? '',
    );
    return this.getRowsSerialNum(
      selectedRows,
      memo,
      serialNumInit,
      serialNumFreq,
      serialDateFormat,
      serialDateInit,
      serialDateFreq,
      serialDateFreqNum,
    );
  };

  /**
   * 出力データ作成処理(更新時)
   * @param procInput
   * @returns 出力データ
   */
  private readonly createOutputRowsUpd = ({
    outputDatas,
    selectedRows,
  }: OpenDialogProcOutput): Row[] => {
    const checkDatas = outputDatas.filter(({ key }) => key.endsWith(CHECK_ID));
    const targetDatas = outputDatas.filter(({ key }) => {
      if (key.endsWith(CHECK_ID)) {
        // チェックボックスの場合
        return false;
      }

      const data = checkDatas.find((check) => check.key === key + CHECK_ID);
      if (!!data) {
        // チェックボックスに紐づく入力項目の場合
        return data.value?.toString().length === 0;
      } else {
        // 上記以外の項目の場合
        return true;
      }
    });

    const newDatasUpd = structuredClone(selectedRows);
    for (const newData of newDatasUpd) {
      for (const { key, value } of targetDatas) {
        newData[key] = value;
      }

      // 金額(数値)設定
      newData[MAIN_COL.AMOUNT_NUM] = calcResult(newData[MAIN_COL.AMOUNT]);
      // 日付を設定
      if (!newData[MAIN_COL.DATE]) {
        newData[MAIN_COL.DATE] = newData[MAIN_COL.USE_DATE];
      }
    }

    return newDatasUpd;
  };

  /**
   * 出力データ作成処理(デフォルト)
   * @param procInput
   * @returns 出力データ
   */
  private readonly createOutputRowsDef = (
    procInput: OpenDialogProcOutput,
  ): Row[] => {
    const newRows = this.cvtOutputDatasToRows(procInput);
    // 金額(数値)設定
    newRows[0][MAIN_COL.AMOUNT_NUM] = calcResult(newRows[0][MAIN_COL.AMOUNT]);
    // 日付を設定
    if (!newRows[0][MAIN_COL.DATE]) {
      newRows[0][MAIN_COL.DATE] = newRows[0][MAIN_COL.USE_DATE];
    }
    return newRows;
  };

  /**
   * 更新・追加・削除以外のステータス返却時の処理(行編集Emitterデータ作成)
   * @param procInput
   * @returns 行編集データ
   */
  protected override readonly createCustomRowEdt = ({
    tbl,
    allTblRows,
    outputRows,
    status,
    rowIds,
  }: OpenDialogProcRowEdt): RowEdt[] => {
    const rowEdt: RowEdt[] = [];
    if (status === 'move') {
      // moveデータを更新
      rowEdt.push(getRowEdtUpd(tbl, outputRows, rowIds));

      // moveの相方を探す
      const memo = outputRows[0][MAIN_COL.MEMO] as string;
      const amtNum = Number(outputRows[0][MAIN_COL.AMOUNT_NUM]);
      const findRow = allTblRows[tbl].findLast((row) => {
        const num = Number(row[MAIN_COL.AMOUNT_NUM]);
        return (
          // メモが一致、かつ、金額の正負が逆になっている場合
          row[MAIN_COL.MEMO]?.toString().includes(memo) &&
          ((amtNum > 0 && num < 0) || (amtNum < 0 && num > 0))
        );
      });

      // 追加データ
      const addRows = [
        {
          ...outputRows[0],
          [MAIN_COL.AMOUNT]: (-amtNum).toString(),
          [MAIN_COL.AMOUNT_NUM]: -amtNum,
          [MAIN_COL.STORAGE]:
            findRow?.[MAIN_COL.STORAGE] ??
            getValByTblColAndCustomId(tbl, MAIN_COL.STORAGE),
          [MAIN_COL.CREDIT]:
            findRow?.[MAIN_COL.CREDIT] ??
            getValByTblColAndCustomId(tbl, MAIN_COL.CREDIT),
        },
      ];

      // moveの相方データを追加
      rowEdt.push(getRowEdtAdd(tbl, addRows, [], rowIds));
    }
    return [...rowEdt];
  };

  /**
   * 入力オプションタイプ別の処理関数マップ
   */
  private readonly funcByInputOptionType: Record<
    string,
    {
      input: (procInput: OpenDialogProcInput) => DialogCustomInputExt;
      output: (procInput: OpenDialogProcOutput) => Row[];
    }
  > = {
    // デフォルト
    [INPUT_OPTION_TYPE.DEFAULT]: {
      input: this.createDialogInputDataDef,
      output: this.createOutputRowsDef,
    },
    // 置換
    [INPUT_OPTION_TYPE.REPLACE]: {
      input: this.createDialogInputDataRep,
      output: this.createOutputRowsRep,
    },
    // 連番付与
    [INPUT_OPTION_TYPE.SERIAL_NUM]: {
      input: this.createDialogInputDataSerialNum,
      output: this.createOutputRowsSerialNum,
    },
    // 更新
    [INPUT_OPTION_TYPE.UPDATE]: {
      input: this.createDialogInputDataUpd,
      output: this.createOutputRowsUpd,
    },
  };
}
