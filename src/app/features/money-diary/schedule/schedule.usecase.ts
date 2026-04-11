import { Injectable, signal } from '@angular/core';
import {
  ColDef,
  ValueFormatterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import {
  DialogCustomInputExt,
  MoneyDiaryBaseUsecase,
  OpenDialogProcInput,
} from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import { MoneyStatus } from 'src/app/shared/money-status/money-status.component';
import { ValType } from 'src/app/shared/signal-form/signal-form.component';
import {
  calcResult,
  cvtNumToPrice,
  isValidInt,
} from 'src/app/shared/utils/util-formula';
import {
  checkInputMode,
  CMN_COL,
  cvtDateToStr,
  getInputMode,
  getPayDate,
  getValByTblColAndCustomId,
  INPUT_MODE,
  MAIN_COL,
  SCD_COL,
  TBL,
} from 'src/app/shared/utils/util-row';

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

@Injectable()
export class ScheduleUsecase extends MoneyDiaryBaseUsecase {
  // TODO: 後で改めて作成する必要あり
  protected override createDialogInputData = (
    procInput: OpenDialogProcInput,
  ): DialogCustomInputExt => {
    return {
      data: signal({}),
      param: {
        body: {
          items: [],
        },
      },
    };
  };
  /**
   * 列定義を返却する
   * @returns 列定義
   */
  override readonly getColDefs = (): ColDef<Row, ValType>[] => [
    {
      headerName: 'Id',
      field: CMN_COL.ID,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Repeat Interval',
      field: CMN_COL.LABEL,
      cellEditor: 'agTextCellEditor',
      hide: false,
    },
    {
      headerName: 'a',
      field: SCD_COL.SEARCH_MEMO,
      cellEditor: 'agTextCellEditor',
      hide: false,
    },
    {
      headerName: 'b',
      field: SCD_COL.MEMO_PLUS_A,
      cellEditor: 'agTextCellEditor',
      hide: false,
    },
    // {
    //   headerName: 'Date',
    //   field: MAIN_COL.DATE,
    //   type: 'dateCol',
    //   pinned: 'left',
    //   rowDrag: true,
    //   width: 120,
    //   lockPosition: 'left',
    //   valueSetter: (params) => this.dateSetter(params, credit),
    //   valueFormatter: this.dateFormatter,
    //   comparator: (_a, _b, nodeA, nodeB) =>
    //     Usecase.sortCommonProc(nodeA.data, nodeB.data, [
    //       { col: MAIN_COL.DATE },
    //       { col: MAIN_COL.INPUT_MODE, asc: false },
    //     ]),
    //   cellStyle: this.getCellCmnStyle,
    // },
    // {
    //   headerName: 'Amount',
    //   field: MAIN_COL.AMOUNT,
    //   type: 'amountCol',
    //   cellEditor: 'agTextCellEditor',
    //   filterValueGetter: `data.${MAIN_COL.AMOUNT_NUM}`,
    //   width: 110,
    //   valueSetter: this.amountSetter,
    //   valueFormatter: this.amountFormatter,
    //   comparator: (_a, _b, nodeA, nodeB) =>
    //     Usecase.amountComparator(
    //       nodeA.data?.[MAIN_COL.AMOUNT_NUM],
    //       nodeB.data?.[MAIN_COL.AMOUNT_NUM],
    //     ),
    //   cellStyle: (params) =>
    //     Usecase.getStylePrice(params.data?.[MAIN_COL.AMOUNT_NUM]),
    // },
    // {
    //   headerName: 'AmountNum',
    //   field: MAIN_COL.AMOUNT_NUM,
    //   cellEditor: 'agNumberCellEditor',
    //   hide: true,
    // },
    // {
    //   headerName: 'Memo',
    //   field: MAIN_COL.MEMO,
    //   cellEditor: 'agLargeTextCellEditor',
    //   filter: 'agTextColumnFilter',
    //   width: 220,
    //   valueSetter: this.newValueSetter,
    // },
    // {
    //   headerName: 'Storage',
    //   field: MAIN_COL.STORAGE,
    //   cellEditor: 'agSelectCellEditor',
    //   cellEditorParams: {
    //     values: this.getComboboxValue(storage),
    //   },
    //   filter: 'agTextColumnFilter',
    //   width: 110,
    //   valueSetter: this.newValueSetter,
    //   valueFormatter: (params) => this.comboboxFormatter(storage, params.value),
    //   filterValueGetter: (params) =>
    //     this.comboboxFormatter(
    //       storage,
    //       params.getValue(MAIN_COL.STORAGE),
    //     ),
    // },
    // {
    //   headerName: 'Credit',
    //   field: MAIN_COL.CREDIT,
    //   cellEditor: 'agSelectCellEditor',
    //   cellEditorParams: {
    //     values: this.getComboboxValue(credit),
    //   },
    //   filter: 'agTextColumnFilter',
    //   width: 110,
    //   valueSetter: (params) => this.dateSetter(params, credit),
    //   valueFormatter: (params) => this.comboboxFormatter(credit, params.value),
    //   filterValueGetter: (params) =>
    //     this.comboboxFormatter(
    //       credit,
    //       params.getValue(MAIN_COL.CREDIT),
    //     ),
    // },
    // {
    //   headerName: 'Item',
    //   field: MAIN_COL.ITEM,
    //   cellEditor: 'agSelectCellEditor',
    //   cellEditorParams: {
    //     values: this.getComboboxValue(item),
    //   },
    //   filter: 'agTextColumnFilter',
    //   width: 100,
    //   valueSetter: this.newValueSetter,
    //   valueFormatter: (params) => this.comboboxFormatter(item, params.value),
    //   filterValueGetter: (params) =>
    //     this.comboboxFormatter(item, params.getValue(MAIN_COL.ITEM)),
    // },
    // {
    //   headerName: 'Remark',
    //   field: MAIN_COL.REMARK,
    //   cellEditor: 'agSelectCellEditor',
    //   cellEditorParams: {
    //     values: this.getComboboxValue(remark),
    //   },
    //   filter: 'agTextColumnFilter',
    //   width: 100,
    //   valueSetter: this.newValueSetter,
    //   valueFormatter: (params) => this.comboboxFormatter(remark, params.value),
    //   filterValueGetter: (params) =>
    //     this.comboboxFormatter(
    //       remark,
    //       params.getValue(MAIN_COL.REMARK),
    //     ),
    // },
    // {
    //   headerName: 'Color',
    //   field: MAIN_COL.COLOR,
    //   hide: true,
    // },
    // {
    //   headerName: 'Use Date',
    //   field: MAIN_COL.USE_DATE,
    //   type: 'dateCol',
    //   hide: true,
    //   width: 100,
    //   valueSetter: (params) => this.dateSetter(params, credit),
    //   valueFormatter: this.dateFormatter,
    //   comparator: (_a, _b, nodeA, nodeB) =>
    //     Usecase.sortCommonProc(nodeA.data, nodeB.data, [
    //       { col: MAIN_COL.USE_DATE },
    //       { col: MAIN_COL.INPUT_MODE, asc: false },
    //     ]),
    // },
    // {
    //   headerName: 'Pay Date',
    //   field: MAIN_COL.PAY_DATE,
    //   type: 'dateCol',
    //   width: 100,
    //   valueFormatter: this.dateFormatter,
    //   comparator: (_a, _b, nodeA, nodeB) =>
    //     Usecase.sortCommonProc(nodeA.data, nodeB.data, [
    //       { col: MAIN_COL.PAY_DATE },
    //       { col: MAIN_COL.INPUT_MODE, asc: false },
    //     ]),
    // },
    // {
    //   headerName: 'Input Mode',
    //   field: MAIN_COL.INPUT_MODE,
    //   cellEditor: 'agNumberCellEditor',
    //   hide: true,
    // },
    // {
    //   // ※列定義の最後に配置する
    //   headerName: 'Update',
    //   field: CMN_COL.UPDATE,
    //   cellEditor: 'agCheckboxCellEditor',
    //   hide: true,
    // },
  ];

  /**
   * 日付セッター
   * @param params
   * @param credit
   * @returns 真偽値
   */
  private readonly dateSetter = (
    params: ValueSetterParams<Row, ValType>,
    credit: Row[],
  ): boolean => {
    if (!this.newValSetter(params)) {
      return false;
    }
    params.data[MAIN_COL.PAY_DATE] = getPayDate(
      params.data[MAIN_COL.USE_DATE],
      params.data[MAIN_COL.CREDIT],
      credit,
    );
    return true;
  };

  /**
   * 金額セッター
   * @param params
   * @returns 金額
   */
  private readonly amountSetter = (
    params: ValueSetterParams<Row, ValType>,
  ): boolean => {
    const val =
      params.newValue || getValByTblColAndCustomId(TBL.MAIN, MAIN_COL.AMOUNT);

    params.data[MAIN_COL.AMOUNT] = val;
    params.data[MAIN_COL.AMOUNT_NUM] = calcResult(val);
    this.commonSetter(params);
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
   * 共通セッター
   */
  private readonly commonSetter = (
    params: ValueSetterParams<Row, ValType>,
  ): boolean => {
    params.data[MAIN_COL.INPUT_MODE] = getInputMode(params.data);
    params.data[CMN_COL.UPDATE] = true;
    return true;
  };

  /**
   * 行データを初期化する
   * @param rows
   * @param creditDatas
   * @returns 初期化後の行データ
   */
  override readonly getRows = (rows: Row[], creditDatas: Row[]): Row[] => {
    const datas = structuredClone(rows);
    for (const data of datas) {
      // 支払日
      data[MAIN_COL.PAY_DATE] = getPayDate(
        data[MAIN_COL.USE_DATE],
        data[MAIN_COL.CREDIT],
        creditDatas,
      );
    }
    return datas;
  };

  /**
   * ダイアログ入力データ作成
   * @param edtRows
   * @param tbl
   * @returns 入力データ
   */
  // override readonly createInputData = (
  //   edtRows: Row[],
  //   tbl: Tbl,
  // ): DialogInput => {
  //   const row = edtRows[0];
  //   // コンボボックスリスト (invalid項目を設定している場合は非活性とする)
  //   // const tblList = [
  //   //   ROW_DATA_KEY.STORAGE,
  //   //   ROW_DATA_KEY.CREDIT,
  //   //   ROW_DATA_KEY.ITEM,
  //   //   ROW_DATA_KEY.REMARK,
  //   // ];
  //   // const moneyDiaryKeyList = [
  //   //   MAIN_COL.STORAGE,
  //   //   MAIN_COL.CREDIT,
  //   //   MAIN_COL.ITEM,
  //   //   MAIN_COL.REMARK,
  //   // ];
  //   // const selectOptionsList: Record<string, DialogOption[]> = {};
  //   // const edtableList: Record<string, boolean> = {};
  //   // for (const [idx, key] of tblList.entries()) {
  //   //   const value = row[moneyDiaryKeyList[idx]];
  //   //   edtableList[moneyDiaryKeyList[idx]] = !otherRows[idx].some(
  //   //     (data) =>
  //   //       data[CMN_COL.ID] === value &&
  //   //       !data[CMN_COL.VALID],
  //   //   );
  //   //   selectOptionsList[key] = otherRows[idx]
  //   //     .filter(
  //   //       (data) =>
  //   //         !edtableList[moneyDiaryKeyList[idx]] ||
  //   //         (!!data[CMN_COL.VALID] &&
  //   //           !!data[CMN_COL.LABEL]),
  //   //     )
  //   //     .map<DialogOption>((data) => ({
  //   //       id: data[CMN_COL.ID]?.toString() ?? '',
  //   //       label: data[CMN_COL.LABEL]?.toString() ?? '',
  //   //     }));
  //   // }

  //   // // オートコンプリートデータ メモ
  //   // const autocompMemoData: DialogOption[] = [];
  //   // const optLabelSet: Set<string> = new Set();
  //   // for (const data of rows) {
  //   //   if (
  //   //     data[CMN_COL.ID] === row[CMN_COL.ID]
  //   //   ) {
  //   //     // 編集対象の場合、オートコンプリートに追加しない
  //   //     continue;
  //   //   }

  //   //   const val = data[MAIN_COL.MEMO]?.toString() ?? '';
  //   //   if (!!val && !optLabelSet.has(val)) {
  //   //     optLabelSet.add(val);
  //   //     autocompMemoData.push({ id: val, label: val });
  //   //   }
  //   // }
  //   // // 入力の新しい順に並び替える
  //   // autocompMemoData.reverse();

  //   // // 支払日 setter
  //   // const payDateSetter = (form: FormGroup): void => {
  //   //   const date = form.get(MAIN_COL.DATE)?.value;
  //   //   const useDate = form.get(MAIN_COL.USE_DATE)?.value;
  //   //   const credit = form.get(MAIN_COL.CREDIT)?.value;

  //   //   let val = '';
  //   //   if (date !== undefined && useDate !== undefined && credit !== undefined) {
  //   //     const idx = tblList.findIndex(
  //   //       (key) => key === ROW_DATA_KEY.CREDIT,
  //   //     );
  //   //     val = Usecase.getPayDate(useDate || date, credit, otherRows[idx]);
  //   //   }

  //   //   form.get(MAIN_COL.PAY_DATE)?.setValue(val);
  //   // };

  //   // setter
  //   const labelSetter = (
  //     form: FormGroup,
  //     input: Required<DialogInput>,
  //   ): void => {
  //     const val = form.get(SCD_COL.LABEL)?.value;
  //     const search = (input.datas as DialogInputData[]).find(
  //       (data) => data.id === SCD_COL.SEARCH_MEMO,
  //     );
  //     const memo = (input.datas as DialogInputData[]).find(
  //       (data) => data.id === SCD_COL.MEMO_PLUS_A,
  //     );

  //     if (!!search && !!memo) {
  //       if (val === 'bbb') {
  //         search.hide = true;
  //         memo.hide = false;
  //       } else {
  //         search.hide = false;
  //         memo.hide = true;
  //       }
  //     }
  //   };

  //   const selectTest = FREQ_DWMY_LIST.map((select) => ({
  //     id: select.id,
  //     lb: select.lb,
  //   }));

  //   // 入力データ
  //   const initValues = getTblDefRow(tbl);
  //   const datas: DialogInputDatas = [
  //     {
  //       id: SCD_COL.LABEL,
  //       label: 'Label',
  //       value: row[SCD_COL.LABEL],
  //       type: INPUT_TYPE.TEXT,
  //       initValue: initValues[SCD_COL.LABEL],
  //       required: true,
  //       setter: labelSetter,
  //     },
  //     // {
  //     //   id: SCD_COL.UPDATE,
  //     //   label: 'Number',
  //     //   value: null,
  //     //   type: 'number',
  //     //   hide: true,
  //     // },
  //     // {
  //     //   id: SCD_COL.UPD_DATE,
  //     //   label: 'Date',
  //     //   value: null,
  //     //   type: 'date',
  //     //   hide: true,
  //     // },
  //     {
  //       id: SCD_COL.SEARCH_MEMO,
  //       label: 'radio',
  //       value: row[SCD_COL.SEARCH_MEMO],
  //       type: INPUT_TYPE.RADIO,
  //       initValue: initValues[SCD_COL.SEARCH_MEMO],
  //       options: selectTest,
  //       required: true,
  //     },
  //     {
  //       id: SCD_COL.MEMO_PLUS_A,
  //       label: 'checkbox',
  //       value: row[SCD_COL.MEMO_PLUS_A],
  //       type: 'checkbox',
  //       initValue: initValues[SCD_COL.MEMO_PLUS_A],
  //       options: DAY_OF_WEEK_LIST,
  //       required: true,
  //     },
  //     // {
  //     //   id: SCD_COL.MEMO_PLUS_A,
  //     //   label: 'Memo Plus A',
  //     //   value: row[SCD_COL.MEMO_PLUS_A],
  //     //   type: INPUT_TYPE.TEXT,
  //     //   initValue: initValues[SCD_COL.MEMO_PLUS_A],
  //     // },
  //   ];

  //   return { title: getTblName(tbl), datas };
  // };

  /**
   * ステータスリストを返却する
   * @param rows
   * @param creditDatas
   * @returns
   */
  readonly calcStatusList = (
    rows: Row[],
    creditDatas: Row[],
  ): MoneyStatus[] => {
    let cnt = 0;
    let savings = 0;
    let savingsLast = 0;
    const today = cvtDateToStr();

    for (const data of rows) {
      const num = data?.[MAIN_COL.AMOUNT_NUM];
      if (
        !data ||
        !checkInputMode(data, INPUT_MODE.ALL_REQ) ||
        !isValidInt(num)
      ) {
        continue;
      }

      const payDate = getPayDate(
        data[MAIN_COL.USE_DATE],
        data[MAIN_COL.CREDIT],
        creditDatas,
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
}
