import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CellClassParams,
  CellClickedEvent,
  CellStyle,
  ColDef,
  RowStyle,
  ValueFormatterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import { format } from 'date-fns';
import { RowData } from 'src/app/domain/row-data';
import { MoneyDiaryBaseUsecase } from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { RowDataKey, ValueType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DialogInput,
  DialogInputData,
  DialogOutputData,
} from 'src/app/shared/dialog-input/dialog-input.component';
import { MoneyStatus } from 'src/app/shared/money-status/money-status.component';

@Injectable()
export class ScheduleUsecase extends MoneyDiaryBaseUsecase {
  /**
   * 列定義を返却する
   * @returns 列定義
   */
  override readonly getColDefs = (): ColDef<RowData, ValueType>[] => [
    {
      headerName: 'Id',
      field: Const.ROW_DATA_COMMON_COL_ID.ID,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Repeat Interval',
      field: Const.ROW_DATA_COMMON_COL_ID.LABEL,
      cellEditor: 'agTextCellEditor',
      hide: false,
    },
    {
      headerName: 'a',
      field: Const.SCHEDULE_COL_ID.SEARCH_MEMO,
      cellEditor: 'agTextCellEditor',
      hide: false,
    },
    {
      headerName: 'b',
      field: Const.SCHEDULE_COL_ID.MEMO_PLUS_A,
      cellEditor: 'agTextCellEditor',
      hide: false,
    },
    // {
    //   headerName: 'Date',
    //   field: Const.MONEY_DIARY_COL_ID.DATE,
    //   type: 'dateCol',
    //   pinned: 'left',
    //   rowDrag: true,
    //   width: 120,
    //   lockPosition: 'left',
    //   valueSetter: (params) => this.dateSetter(params, credit),
    //   valueFormatter: this.dateFormatter,
    //   comparator: (_a, _b, nodeA, nodeB) =>
    //     Usecase.sortCommonProc(nodeA.data, nodeB.data, [
    //       { col: Const.MONEY_DIARY_COL_ID.DATE },
    //       { col: Const.MONEY_DIARY_COL_ID.INPUT_MODE, asc: false },
    //     ]),
    //   cellStyle: this.colorCellStyle,
    // },
    // {
    //   headerName: 'Amount',
    //   field: Const.MONEY_DIARY_COL_ID.AMOUNT,
    //   type: 'amountCol',
    //   cellEditor: 'agTextCellEditor',
    //   filterValueGetter: `data.${Const.MONEY_DIARY_COL_ID.AMOUNT_NUM}`,
    //   width: 110,
    //   valueSetter: this.amountSetter,
    //   valueFormatter: this.amountFormatter,
    //   comparator: (_a, _b, nodeA, nodeB) =>
    //     Usecase.amountComparator(
    //       nodeA.data?.[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM],
    //       nodeB.data?.[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM],
    //     ),
    //   cellStyle: (params) =>
    //     Usecase.getStylePrice(params.data?.[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM]),
    // },
    // {
    //   headerName: 'AmountNum',
    //   field: Const.MONEY_DIARY_COL_ID.AMOUNT_NUM,
    //   cellEditor: 'agNumberCellEditor',
    //   hide: true,
    // },
    // {
    //   headerName: 'Memo',
    //   field: Const.MONEY_DIARY_COL_ID.MEMO,
    //   cellEditor: 'agLargeTextCellEditor',
    //   filter: 'agTextColumnFilter',
    //   width: 220,
    //   valueSetter: this.newValueSetter,
    // },
    // {
    //   headerName: 'Storage',
    //   field: Const.MONEY_DIARY_COL_ID.STORAGE,
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
    //       params.getValue(Const.MONEY_DIARY_COL_ID.STORAGE),
    //     ),
    // },
    // {
    //   headerName: 'Credit',
    //   field: Const.MONEY_DIARY_COL_ID.CREDIT,
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
    //       params.getValue(Const.MONEY_DIARY_COL_ID.CREDIT),
    //     ),
    // },
    // {
    //   headerName: 'Item',
    //   field: Const.MONEY_DIARY_COL_ID.ITEM,
    //   cellEditor: 'agSelectCellEditor',
    //   cellEditorParams: {
    //     values: this.getComboboxValue(item),
    //   },
    //   filter: 'agTextColumnFilter',
    //   width: 100,
    //   valueSetter: this.newValueSetter,
    //   valueFormatter: (params) => this.comboboxFormatter(item, params.value),
    //   filterValueGetter: (params) =>
    //     this.comboboxFormatter(item, params.getValue(Const.MONEY_DIARY_COL_ID.ITEM)),
    // },
    // {
    //   headerName: 'Remark',
    //   field: Const.MONEY_DIARY_COL_ID.REMARK,
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
    //       params.getValue(Const.MONEY_DIARY_COL_ID.REMARK),
    //     ),
    // },
    // {
    //   headerName: 'Color',
    //   field: Const.MONEY_DIARY_COL_ID.COLOR,
    //   hide: true,
    // },
    // {
    //   headerName: 'Use Date',
    //   field: Const.MONEY_DIARY_COL_ID.USE_DATE,
    //   type: 'dateCol',
    //   hide: true,
    //   width: 100,
    //   valueSetter: (params) => this.dateSetter(params, credit),
    //   valueFormatter: this.dateFormatter,
    //   comparator: (_a, _b, nodeA, nodeB) =>
    //     Usecase.sortCommonProc(nodeA.data, nodeB.data, [
    //       { col: Const.MONEY_DIARY_COL_ID.USE_DATE },
    //       { col: Const.MONEY_DIARY_COL_ID.INPUT_MODE, asc: false },
    //     ]),
    // },
    // {
    //   headerName: 'Pay Date',
    //   field: Const.MONEY_DIARY_COL_ID.PAY_DATE,
    //   type: 'dateCol',
    //   width: 100,
    //   valueFormatter: this.dateFormatter,
    //   comparator: (_a, _b, nodeA, nodeB) =>
    //     Usecase.sortCommonProc(nodeA.data, nodeB.data, [
    //       { col: Const.MONEY_DIARY_COL_ID.PAY_DATE },
    //       { col: Const.MONEY_DIARY_COL_ID.INPUT_MODE, asc: false },
    //     ]),
    // },
    // {
    //   headerName: 'Input Mode',
    //   field: Const.MONEY_DIARY_COL_ID.INPUT_MODE,
    //   cellEditor: 'agNumberCellEditor',
    //   hide: true,
    // },
    // {
    //   // ※列定義の最後に配置する
    //   headerName: 'Update',
    //   field: Const.ROW_DATA_COMMON_COL_ID.UPDATE,
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
    params: ValueSetterParams<RowData, ValueType>,
    credit: RowData[],
  ): boolean => {
    if (!this.newValueSetter(params)) {
      return false;
    }
    params.data[Const.MONEY_DIARY_COL_ID.PAY_DATE] = Util.getPayDate(
      params.data[Const.MONEY_DIARY_COL_ID.USE_DATE],
      params.data[Const.MONEY_DIARY_COL_ID.CREDIT],
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
    params: CellClassParams<RowData, ValueType>,
  ): CellStyle => {
    const cellStyle = Util.getCellCommonStyle(params);
    const color = params.data?.[Const.MONEY_DIARY_COL_ID.COLOR];
    const defaultColor = Util.getInitValue(
      Const.ROW_DATA_KEY.MONEY_DIARY,
      Const.MONEY_DIARY_COL_ID.COLOR,
    );
    if (!!color && typeof color === 'string' && color !== defaultColor) {
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
    params: ValueSetterParams<RowData, ValueType>,
  ): boolean => {
    const val =
      params.newValue ||
      Util.getInitValue(
        Const.ROW_DATA_KEY.MONEY_DIARY,
        Const.MONEY_DIARY_COL_ID.AMOUNT,
      );

    params.data[Const.MONEY_DIARY_COL_ID.AMOUNT] = val;
    params.data[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM] = Util.calcResult(val);
    this.commonSetter(params);
    return true;
  };

  /**
   * 金額フォーマッター
   * @param params
   * @returns 金額
   */
  private readonly amountFormatter = (
    params: ValueFormatterParams<RowData, ValueType>,
  ): string => {
    return Util.cvtNumToPrice(
      params.data?.[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM],
    );
  };

  /**
   * 共通セッター
   */
  private readonly commonSetter = (
    params: ValueSetterParams<RowData, ValueType>,
  ): boolean => {
    params.data[Const.MONEY_DIARY_COL_ID.INPUT_MODE] = Util.getInputMode(
      params.data,
    );
    params.data[Const.ROW_DATA_COMMON_COL_ID.UPDATE] = true;
    return true;
  };

  /**
   * 行データを初期化する
   * @param rowDatas
   * @param creditDatas
   * @returns 初期化後の行データ
   */
  override readonly getRowDatas = (
    rowDatas: RowData[],
    creditDatas: RowData[],
  ): RowData[] => {
    const datas = structuredClone(rowDatas);
    for (const data of datas) {
      // 支払日
      data[Const.MONEY_DIARY_COL_ID.PAY_DATE] = Util.getPayDate(
        data[Const.MONEY_DIARY_COL_ID.USE_DATE],
        data[Const.MONEY_DIARY_COL_ID.CREDIT],
        creditDatas,
      );
    }
    return datas;
  };

  /**
   * 行スタイル返却(Custom)
   * @param rowData
   * @param style
   * @default style = {}
   * @returns 行スタイル
   */
  protected override readonly getRowStyleCustom = (
    rowData: RowData,
    style: RowStyle = {},
  ): RowStyle => {
    if (!rowData[Const.ROW_DATA_COMMON_COL_ID.LABEL]) {
      // 空データの場合
      style['backgroundColor'] = Const.GRID_ROW_COLOR.NONE;
    } else if (!!rowData[Const.ROW_DATA_COMMON_COL_ID.UPDATE]) {
      // // 更新済データの場合
      // style['backgroundColor'] = Const.GRID_ROW_COLOR.UPDATE;
    }

    return style;
  };

  /**
   * 入力チェック(ダイアログオープン前)
   * @param event
   * @returns チェック結果
   */
  override readonly checkInputData = (
    event: CellClickedEvent<RowData, ValueType>,
  ): boolean => {
    if (!event.node.id || !event.data) {
      // 選択行がない、または、入力データがない場合
      return false;
    }

    return true;
  };

  /**
   * ダイアログ入力データ作成
   * @param selectRowDatas
   * @param rowDataKey
   * @returns 入力データ
   */
  override readonly createInputData = (
    selectRowDatas: RowData[],
    rowDataKey: RowDataKey,
  ): DialogInput => {
    const rowData = selectRowDatas[0];
    // コンボボックスリスト (invalid項目を設定している場合は非活性とする)
    // const rowDataskeyList = [
    //   Const.ROW_DATA_KEY.STORAGE,
    //   Const.ROW_DATA_KEY.CREDIT,
    //   Const.ROW_DATA_KEY.ITEM,
    //   Const.ROW_DATA_KEY.REMARK,
    // ];
    // const moneyDiaryKeyList = [
    //   Const.MONEY_DIARY_COL_ID.STORAGE,
    //   Const.MONEY_DIARY_COL_ID.CREDIT,
    //   Const.MONEY_DIARY_COL_ID.ITEM,
    //   Const.MONEY_DIARY_COL_ID.REMARK,
    // ];
    // const selectOptionsList: Record<string, DialogOption[]> = {};
    // const editableList: Record<string, boolean> = {};
    // for (const [idx, key] of rowDataskeyList.entries()) {
    //   const value = rowData[moneyDiaryKeyList[idx]];
    //   editableList[moneyDiaryKeyList[idx]] = !otherRowDatas[idx].some(
    //     (data) =>
    //       data[Const.ROW_DATA_COMMON_COL_ID.ID] === value &&
    //       !data[Const.ROW_DATA_COMMON_COL_ID.VALID],
    //   );
    //   selectOptionsList[key] = otherRowDatas[idx]
    //     .filter(
    //       (data) =>
    //         !editableList[moneyDiaryKeyList[idx]] ||
    //         (!!data[Const.ROW_DATA_COMMON_COL_ID.VALID] &&
    //           !!data[Const.ROW_DATA_COMMON_COL_ID.LABEL]),
    //     )
    //     .map<DialogOption>((data) => ({
    //       id: data[Const.ROW_DATA_COMMON_COL_ID.ID]?.toString() ?? '',
    //       label: data[Const.ROW_DATA_COMMON_COL_ID.LABEL]?.toString() ?? '',
    //     }));
    // }

    // // オートコンプリートデータ メモ
    // const autocompMemoData: DialogOption[] = [];
    // const optLabelSet: Set<string> = new Set();
    // for (const data of rowDatas) {
    //   if (
    //     data[Const.ROW_DATA_COMMON_COL_ID.ID] === rowData[Const.ROW_DATA_COMMON_COL_ID.ID]
    //   ) {
    //     // 編集対象の場合、オートコンプリートに追加しない
    //     continue;
    //   }

    //   const val = data[Const.MONEY_DIARY_COL_ID.MEMO]?.toString() ?? '';
    //   if (!!val && !optLabelSet.has(val)) {
    //     optLabelSet.add(val);
    //     autocompMemoData.push({ id: val, label: val });
    //   }
    // }
    // // 入力の新しい順に並び替える
    // autocompMemoData.reverse();

    // // 支払日 setter
    // const payDateSetter = (form: FormGroup): void => {
    //   const date = form.get(Const.MONEY_DIARY_COL_ID.DATE)?.value;
    //   const useDate = form.get(Const.MONEY_DIARY_COL_ID.USE_DATE)?.value;
    //   const credit = form.get(Const.MONEY_DIARY_COL_ID.CREDIT)?.value;

    //   let val = '';
    //   if (date !== undefined && useDate !== undefined && credit !== undefined) {
    //     const idx = rowDataskeyList.findIndex(
    //       (key) => key === Const.ROW_DATA_KEY.CREDIT,
    //     );
    //     val = Usecase.getPayDate(useDate || date, credit, otherRowDatas[idx]);
    //   }

    //   form.get(Const.MONEY_DIARY_COL_ID.PAY_DATE)?.setValue(val);
    // };

    // setter
    const labelSetter = (
      form: FormGroup,
      input: Required<DialogInput>,
    ): void => {
      const val = form.get(Const.SCHEDULE_COL_ID.LABEL)?.value;
      const search = input.datas.find(
        (data) => data.id === Const.SCHEDULE_COL_ID.SEARCH_MEMO,
      );
      const memo = input.datas.find(
        (data) => data.id === Const.SCHEDULE_COL_ID.MEMO_PLUS_A,
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

    const selectTest = Const.FREQ_DWMY_SELECT.map((select) => ({
      id: select.id,
      label: select.label,
    }));

    // 入力データ
    const initValues = Util.getInitRowData(rowDataKey);
    const datas: DialogInputData[] = [
      {
        id: Const.SCHEDULE_COL_ID.LABEL,
        label: 'Label',
        value: rowData[Const.SCHEDULE_COL_ID.LABEL],
        type: Const.INPUT_TYPE.TEXT,
        initValue: initValues[Const.SCHEDULE_COL_ID.LABEL],
        required: true,
        setter: labelSetter,
      },
      // {
      //   id: Const.SCHEDULE_COL_ID.UPDATE,
      //   label: 'Number',
      //   value: null,
      //   type: Const.INPUT_TYPE.NUM,
      //   hide: true,
      // },
      // {
      //   id: Const.SCHEDULE_COL_ID.UPD_DATE,
      //   label: 'Date',
      //   value: null,
      //   type: Const.INPUT_TYPE.DATE,
      //   hide: true,
      // },
      {
        id: Const.SCHEDULE_COL_ID.SEARCH_MEMO,
        label: 'radio',
        value: rowData[Const.SCHEDULE_COL_ID.SEARCH_MEMO],
        type: Const.INPUT_TYPE.RADIO,
        initValue: initValues[Const.SCHEDULE_COL_ID.SEARCH_MEMO],
        options: selectTest,
        required: true,
      },
      {
        id: Const.SCHEDULE_COL_ID.MEMO_PLUS_A,
        label: 'checkbox',
        value: rowData[Const.SCHEDULE_COL_ID.MEMO_PLUS_A],
        type: Const.INPUT_TYPE.CHECK,
        initValue: initValues[Const.SCHEDULE_COL_ID.MEMO_PLUS_A],
        options: Const.DAY_OF_WEEK_SELECT,
        required: true,
      },
      // {
      //   id: Const.SCHEDULE_COL_ID.MEMO_PLUS_A,
      //   label: 'Memo Plus A',
      //   value: rowData[Const.SCHEDULE_COL_ID.MEMO_PLUS_A],
      //   type: Const.INPUT_TYPE.TEXT,
      //   initValue: initValues[Const.SCHEDULE_COL_ID.MEMO_PLUS_A],
      // },
    ];

    return { title: Util.getScreenTitle2(rowDataKey), datas };
  };

  /**
   * 入力項目反映(行編集Emitterデータ作成)
   * @param selectRowDatas
   * @param outputDatas
   * @returns 行データ項目追加後データ
   */
  protected override readonly reflectRowDatas = (
    selectRowDatas: RowData[],
    outputDatas: DialogOutputData[],
  ): RowData[] => {
    const newDatas = this.reflectRowDatasDefault(selectRowDatas, outputDatas);
    // 更新日時設定
    newDatas[0][Const.ROW_DATA_COMMON_COL_ID.UPD_DATE] = format(
      new Date(),
      Const.DATE_FORMAT.YY_MM_DD_HH_MM_SS,
    );
    // 更新フラグ設定
    newDatas[0][Const.ROW_DATA_COMMON_COL_ID.UPDATE] = true;

    return newDatas;
  };

  /**
   * 空データ追加チェック(行編集Emitterデータ作成)
   * @param newDatas
   * @returns チェック結果
   */
  protected override readonly checkAddEmptyData = (
    newDatas: RowData[],
  ): boolean => {
    return !newDatas.some((data) => !data[Const.ROW_DATA_COMMON_COL_ID.LABEL]);
  };

  /**
   * ステータスリストを返却する
   * @param rowDatas
   * @param creditDatas
   * @returns
   */
  readonly calcStatusList = (
    rowDatas: RowData[],
    creditDatas: RowData[],
  ): MoneyStatus[] => {
    let cnt = 0;
    let savings = 0;
    let savingsLast = 0;
    const today = format(new Date(), Const.DATE_FORMAT.YYYY_MM_DD);

    for (const data of rowDatas) {
      const num = data?.[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM];
      if (
        !data ||
        !Util.checkInputMode(data, Const.INPUT_MODE.ALL_REQ) ||
        !Util.isValidInteger(num)
      ) {
        continue;
      }

      const payDate = Util.getPayDate(
        data[Const.MONEY_DIARY_COL_ID.USE_DATE],
        data[Const.MONEY_DIARY_COL_ID.CREDIT],
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
