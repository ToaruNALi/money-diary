import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CellClassParams,
  CellStyle,
  ColDef,
  ValueFormatterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { MoneyDiaryBaseUsecase } from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { Tbl, ValType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DialogInput,
  DialogInputData,
  DialogInputDatas,
} from 'src/app/shared/dialog-input/dialog-input.component';
import { MoneyStatus } from 'src/app/shared/money-status/money-status.component';

@Injectable()
export class ScheduleUsecase extends MoneyDiaryBaseUsecase {
  /**
   * 列定義を返却する
   * @returns 列定義
   */
  override readonly getColDefs = (): ColDef<Row, ValType>[] => [
    {
      headerName: 'Id',
      field: Const.CMN_COL.ID,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Repeat Interval',
      field: Const.CMN_COL.LABEL,
      cellEditor: 'agTextCellEditor',
      hide: false,
    },
    {
      headerName: 'a',
      field: Const.SCD_COL.SEARCH_MEMO,
      cellEditor: 'agTextCellEditor',
      hide: false,
    },
    {
      headerName: 'b',
      field: Const.SCD_COL.MEMO_PLUS_A,
      cellEditor: 'agTextCellEditor',
      hide: false,
    },
    // {
    //   headerName: 'Date',
    //   field: Const.MAIN_COL.DATE,
    //   type: 'dateCol',
    //   pinned: 'left',
    //   rowDrag: true,
    //   width: 120,
    //   lockPosition: 'left',
    //   valueSetter: (params) => this.dateSetter(params, credit),
    //   valueFormatter: this.dateFormatter,
    //   comparator: (_a, _b, nodeA, nodeB) =>
    //     Usecase.sortCommonProc(nodeA.data, nodeB.data, [
    //       { col: Const.MAIN_COL.DATE },
    //       { col: Const.MAIN_COL.INPUT_MODE, asc: false },
    //     ]),
    //   cellStyle: this.colorCellStyle,
    // },
    // {
    //   headerName: 'Amount',
    //   field: Const.MAIN_COL.AMOUNT,
    //   type: 'amountCol',
    //   cellEditor: 'agTextCellEditor',
    //   filterValueGetter: `data.${Const.MAIN_COL.AMOUNT_NUM}`,
    //   width: 110,
    //   valueSetter: this.amountSetter,
    //   valueFormatter: this.amountFormatter,
    //   comparator: (_a, _b, nodeA, nodeB) =>
    //     Usecase.amountComparator(
    //       nodeA.data?.[Const.MAIN_COL.AMOUNT_NUM],
    //       nodeB.data?.[Const.MAIN_COL.AMOUNT_NUM],
    //     ),
    //   cellStyle: (params) =>
    //     Usecase.getStylePrice(params.data?.[Const.MAIN_COL.AMOUNT_NUM]),
    // },
    // {
    //   headerName: 'AmountNum',
    //   field: Const.MAIN_COL.AMOUNT_NUM,
    //   cellEditor: 'agNumberCellEditor',
    //   hide: true,
    // },
    // {
    //   headerName: 'Memo',
    //   field: Const.MAIN_COL.MEMO,
    //   cellEditor: 'agLargeTextCellEditor',
    //   filter: 'agTextColumnFilter',
    //   width: 220,
    //   valueSetter: this.newValueSetter,
    // },
    // {
    //   headerName: 'Storage',
    //   field: Const.MAIN_COL.STORAGE,
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
    //       params.getValue(Const.MAIN_COL.STORAGE),
    //     ),
    // },
    // {
    //   headerName: 'Credit',
    //   field: Const.MAIN_COL.CREDIT,
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
    //       params.getValue(Const.MAIN_COL.CREDIT),
    //     ),
    // },
    // {
    //   headerName: 'Item',
    //   field: Const.MAIN_COL.ITEM,
    //   cellEditor: 'agSelectCellEditor',
    //   cellEditorParams: {
    //     values: this.getComboboxValue(item),
    //   },
    //   filter: 'agTextColumnFilter',
    //   width: 100,
    //   valueSetter: this.newValueSetter,
    //   valueFormatter: (params) => this.comboboxFormatter(item, params.value),
    //   filterValueGetter: (params) =>
    //     this.comboboxFormatter(item, params.getValue(Const.MAIN_COL.ITEM)),
    // },
    // {
    //   headerName: 'Remark',
    //   field: Const.MAIN_COL.REMARK,
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
    //       params.getValue(Const.MAIN_COL.REMARK),
    //     ),
    // },
    // {
    //   headerName: 'Color',
    //   field: Const.MAIN_COL.COLOR,
    //   hide: true,
    // },
    // {
    //   headerName: 'Use Date',
    //   field: Const.MAIN_COL.USE_DATE,
    //   type: 'dateCol',
    //   hide: true,
    //   width: 100,
    //   valueSetter: (params) => this.dateSetter(params, credit),
    //   valueFormatter: this.dateFormatter,
    //   comparator: (_a, _b, nodeA, nodeB) =>
    //     Usecase.sortCommonProc(nodeA.data, nodeB.data, [
    //       { col: Const.MAIN_COL.USE_DATE },
    //       { col: Const.MAIN_COL.INPUT_MODE, asc: false },
    //     ]),
    // },
    // {
    //   headerName: 'Pay Date',
    //   field: Const.MAIN_COL.PAY_DATE,
    //   type: 'dateCol',
    //   width: 100,
    //   valueFormatter: this.dateFormatter,
    //   comparator: (_a, _b, nodeA, nodeB) =>
    //     Usecase.sortCommonProc(nodeA.data, nodeB.data, [
    //       { col: Const.MAIN_COL.PAY_DATE },
    //       { col: Const.MAIN_COL.INPUT_MODE, asc: false },
    //     ]),
    // },
    // {
    //   headerName: 'Input Mode',
    //   field: Const.MAIN_COL.INPUT_MODE,
    //   cellEditor: 'agNumberCellEditor',
    //   hide: true,
    // },
    // {
    //   // ※列定義の最後に配置する
    //   headerName: 'Update',
    //   field: Const.CMN_COL.UPDATE,
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
    params.data[Const.MAIN_COL.PAY_DATE] = Util.getPayDate(
      params.data[Const.MAIN_COL.USE_DATE],
      params.data[Const.MAIN_COL.CREDIT],
      credit,
    );
    return true;
  };

  /**
   * カラースタイル
   * @param params
   * @returns セルスタイル
   */
  private readonly colorCellStyle = (
    params: CellClassParams<Row, ValType>,
  ): CellStyle => {
    const cellStyle = Util.getCellCmnStyle(params);
    const color = params.data?.[Const.MAIN_COL.COLOR];
    const defColor = Util.getTblDefVal(Const.TBL.MAIN, Const.MAIN_COL.COLOR);
    if (!!color && typeof color === 'string' && color !== defColor) {
      cellStyle['background-color'] = color;
    }

    return cellStyle;
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
      params.newValue ||
      Util.getTblDefVal(Const.TBL.MAIN, Const.MAIN_COL.AMOUNT);

    params.data[Const.MAIN_COL.AMOUNT] = val;
    params.data[Const.MAIN_COL.AMOUNT_NUM] = Util.calcResult(val);
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
    return Util.cvtNumToPrice(params.data?.[Const.MAIN_COL.AMOUNT_NUM]);
  };

  /**
   * 共通セッター
   */
  private readonly commonSetter = (
    params: ValueSetterParams<Row, ValType>,
  ): boolean => {
    params.data[Const.MAIN_COL.INPUT_MODE] = Util.getInputMode(params.data);
    params.data[Const.CMN_COL.UPDATE] = true;
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
      data[Const.MAIN_COL.PAY_DATE] = Util.getPayDate(
        data[Const.MAIN_COL.USE_DATE],
        data[Const.MAIN_COL.CREDIT],
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
  override readonly createInputData = (
    edtRows: Row[],
    tbl: Tbl,
  ): DialogInput => {
    const row = edtRows[0];
    // コンボボックスリスト (invalid項目を設定している場合は非活性とする)
    // const tblList = [
    //   Const.ROW_DATA_KEY.STORAGE,
    //   Const.ROW_DATA_KEY.CREDIT,
    //   Const.ROW_DATA_KEY.ITEM,
    //   Const.ROW_DATA_KEY.REMARK,
    // ];
    // const moneyDiaryKeyList = [
    //   Const.MAIN_COL.STORAGE,
    //   Const.MAIN_COL.CREDIT,
    //   Const.MAIN_COL.ITEM,
    //   Const.MAIN_COL.REMARK,
    // ];
    // const selectOptionsList: Record<string, DialogOption[]> = {};
    // const edtableList: Record<string, boolean> = {};
    // for (const [idx, key] of tblList.entries()) {
    //   const value = row[moneyDiaryKeyList[idx]];
    //   edtableList[moneyDiaryKeyList[idx]] = !otherRows[idx].some(
    //     (data) =>
    //       data[Const.CMN_COL.ID] === value &&
    //       !data[Const.CMN_COL.VALID],
    //   );
    //   selectOptionsList[key] = otherRows[idx]
    //     .filter(
    //       (data) =>
    //         !edtableList[moneyDiaryKeyList[idx]] ||
    //         (!!data[Const.CMN_COL.VALID] &&
    //           !!data[Const.CMN_COL.LABEL]),
    //     )
    //     .map<DialogOption>((data) => ({
    //       id: data[Const.CMN_COL.ID]?.toString() ?? '',
    //       label: data[Const.CMN_COL.LABEL]?.toString() ?? '',
    //     }));
    // }

    // // オートコンプリートデータ メモ
    // const autocompMemoData: DialogOption[] = [];
    // const optLabelSet: Set<string> = new Set();
    // for (const data of rows) {
    //   if (
    //     data[Const.CMN_COL.ID] === row[Const.CMN_COL.ID]
    //   ) {
    //     // 編集対象の場合、オートコンプリートに追加しない
    //     continue;
    //   }

    //   const val = data[Const.MAIN_COL.MEMO]?.toString() ?? '';
    //   if (!!val && !optLabelSet.has(val)) {
    //     optLabelSet.add(val);
    //     autocompMemoData.push({ id: val, label: val });
    //   }
    // }
    // // 入力の新しい順に並び替える
    // autocompMemoData.reverse();

    // // 支払日 setter
    // const payDateSetter = (form: FormGroup): void => {
    //   const date = form.get(Const.MAIN_COL.DATE)?.value;
    //   const useDate = form.get(Const.MAIN_COL.USE_DATE)?.value;
    //   const credit = form.get(Const.MAIN_COL.CREDIT)?.value;

    //   let val = '';
    //   if (date !== undefined && useDate !== undefined && credit !== undefined) {
    //     const idx = tblList.findIndex(
    //       (key) => key === Const.ROW_DATA_KEY.CREDIT,
    //     );
    //     val = Usecase.getPayDate(useDate || date, credit, otherRows[idx]);
    //   }

    //   form.get(Const.MAIN_COL.PAY_DATE)?.setValue(val);
    // };

    // setter
    const labelSetter = (
      form: FormGroup,
      input: Required<DialogInput>,
    ): void => {
      const val = form.get(Const.SCD_COL.LABEL)?.value;
      const search = (input.datas as DialogInputData[]).find(
        (data) => data.id === Const.SCD_COL.SEARCH_MEMO,
      );
      const memo = (input.datas as DialogInputData[]).find(
        (data) => data.id === Const.SCD_COL.MEMO_PLUS_A,
      );

      if (!!search && !!memo) {
        if (val === 'bbb') {
          search.hide = true;
          memo.hide = false;
        } else {
          search.hide = false;
          memo.hide = true;
        }
      }
    };

    const selectTest = Const.FREQ_DWMY_LIST.map((select) => ({
      id: select.id,
      lb: select.lb,
    }));

    // 入力データ
    const initValues = Util.getTblDefRow(tbl);
    const datas: DialogInputDatas = [
      {
        id: Const.SCD_COL.LABEL,
        label: 'Label',
        value: row[Const.SCD_COL.LABEL],
        type: Const.INPUT_TYPE.TEXT,
        initValue: initValues[Const.SCD_COL.LABEL],
        required: true,
        setter: labelSetter,
      },
      // {
      //   id: Const.SCD_COL.UPDATE,
      //   label: 'Number',
      //   value: null,
      //   type: Const.INPUT_TYPE.NUM,
      //   hide: true,
      // },
      // {
      //   id: Const.SCD_COL.UPD_DATE,
      //   label: 'Date',
      //   value: null,
      //   type: Const.INPUT_TYPE.DATE,
      //   hide: true,
      // },
      {
        id: Const.SCD_COL.SEARCH_MEMO,
        label: 'radio',
        value: row[Const.SCD_COL.SEARCH_MEMO],
        type: Const.INPUT_TYPE.RADIO,
        initValue: initValues[Const.SCD_COL.SEARCH_MEMO],
        options: selectTest,
        required: true,
      },
      {
        id: Const.SCD_COL.MEMO_PLUS_A,
        label: 'checkbox',
        value: row[Const.SCD_COL.MEMO_PLUS_A],
        type: Const.INPUT_TYPE.CHECK,
        initValue: initValues[Const.SCD_COL.MEMO_PLUS_A],
        options: Const.DAY_OF_WEEK_LIST,
        required: true,
      },
      // {
      //   id: Const.SCD_COL.MEMO_PLUS_A,
      //   label: 'Memo Plus A',
      //   value: row[Const.SCD_COL.MEMO_PLUS_A],
      //   type: Const.INPUT_TYPE.TEXT,
      //   initValue: initValues[Const.SCD_COL.MEMO_PLUS_A],
      // },
    ];

    return { title: Util.getTblName(tbl), datas };
  };

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
    const today = Util.getDate();

    for (const data of rows) {
      const num = data?.[Const.MAIN_COL.AMOUNT_NUM];
      if (
        !data ||
        !Util.checkInputMode(data, Const.INPUT_MODE.ALL_REQ) ||
        !Util.isValidInt(num)
      ) {
        continue;
      }

      const payDate = Util.getPayDate(
        data[Const.MAIN_COL.USE_DATE],
        data[Const.MAIN_COL.CREDIT],
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
        value: Util.cvtNumToPrice(savings),
      },
      {
        label: 'Last Savings',
        value: Util.cvtNumToPrice(savingsLast),
      },
    ];
  };
}
