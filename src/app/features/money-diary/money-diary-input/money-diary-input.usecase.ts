import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormRecord, ValidationErrors } from '@angular/forms';
import {
  CellClassParams,
  CellClickedEvent,
  CellStyle,
  ColDef,
  RowStyle,
  ValueFormatterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import * as DateUtil from 'date-fns';
import { RowData } from 'src/app/domain/row-data';
import { MoneyDiaryBaseUsecase } from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import * as Const from 'src/app/shared/constants/constants';
import {
  FormCtrl,
  MoneyDiaryColId,
  RowDataEdit,
  RowDataKey,
  ValueType,
} from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import * as Dialog from 'src/app/shared/dialog-input/dialog-input.component';
import {
  DialogInput,
  DialogInputButtonOption,
  DialogInputData,
  DialogOption,
  DialogOutput,
  DialogOutputData,
  DialogStatus,
  SetType,
} from 'src/app/shared/dialog-input/dialog-input.component';
import { DialogInputUsecase } from 'src/app/shared/dialog-input/dialog-input.usecase';
import { MoneyStatus } from 'src/app/shared/money-status/money-status.component';

export const INPUT_OPTION_TYPE = {
  REPLACE: 'replace',
  SERIAL_NUM: 'serialNumber',
};
export type InputOptionType =
  (typeof INPUT_OPTION_TYPE)[keyof typeof INPUT_OPTION_TYPE];
export type InputOption = {
  type?: InputOptionType;
  editPastData: boolean;
};

const DIALOG_BUTTON = {
  ...Dialog.DIALOG_BUTTON,
  MOVE: 'move',
} as const;
const DIALOG_STATUS = {
  ...Dialog.DIALOG_STATUS,
  MOVE: 'move',
} as const;

const DIALOG_INPUT_ID = {
  CALC_RESULT: 'calcResult',
  TARGET_STRING: 'targetString',
  REPLACE_CHAR: 'replaceChar',
  SERIAL_NUM_INIT: 'serialNumberInit',
  DATE_FORMAT: 'serialDateFormat',
  SERIAL_DATE_INIT: 'serialDateInit',
  SERIAL_DATE_FREQ: 'serialDateFreq',
  SERIAL_DATE_FREQ_NUM: 'serialDateFreqNum',
  BEFORE_REPLACE: 'beforeReplace',
  AFTER_REPLACE: 'afterReplace',
} as const;

@Injectable()
export class MoneyDiaryInputUsecase extends MoneyDiaryBaseUsecase {
  private readonly dialogUsecase = inject(DialogInputUsecase);

  /**
   * 列定義を返却する
   * @param storage
   * @param credit
   * @param item
   * @param remark
   * @returns 列定義
   */
  override readonly getColDefs = (
    storage: RowData[],
    credit: RowData[],
    item: RowData[],
    remark: RowData[],
  ): ColDef<RowData, ValueType>[] => [
    {
      headerName: 'Id',
      field: Const.ROW_DATA_COMMON_COL_ID.ID,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Date',
      field: Const.MONEY_DIARY_COL_ID.DATE,
      type: 'dateCol',
      pinned: 'left',
      rowDrag: true,
      width: 120,
      lockPosition: 'left',
      valueSetter: (params) => this.dateSetter(params, credit),
      valueFormatter: this.dateFormatter,
      comparator: (_a, _b, nodeA, nodeB) =>
        Util.sortCommonProc(nodeA.data, nodeB.data, [
          { col: Const.MONEY_DIARY_COL_ID.DATE },
          { col: Const.MONEY_DIARY_COL_ID.INPUT_MODE, asc: false },
        ]),
      cellStyle: this.colorCellStyle,
    },
    {
      headerName: 'Amount',
      field: Const.MONEY_DIARY_COL_ID.AMOUNT,
      type: 'amountCol',
      cellEditor: 'agTextCellEditor',
      filterValueGetter: `data.${Const.MONEY_DIARY_COL_ID.AMOUNT_NUM}`,
      width: 110,
      valueSetter: this.amountSetter,
      valueFormatter: this.amountFormatter,
      comparator: (_a, _b, nodeA, nodeB) =>
        Util.amountComparator(
          nodeA.data?.[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM],
          nodeB.data?.[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM],
        ),
      cellStyle: (params) =>
        Util.getStylePrice(params.data?.[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM]),
    },
    {
      headerName: 'AmountNum',
      field: Const.MONEY_DIARY_COL_ID.AMOUNT_NUM,
      cellEditor: 'agNumberCellEditor',
      hide: true,
    },
    {
      headerName: 'Memo',
      field: Const.MONEY_DIARY_COL_ID.MEMO,
      cellEditor: 'agLargeTextCellEditor',
      filter: 'agTextColumnFilter',
      width: 220,
      valueSetter: this.newValueSetter,
    },
    {
      headerName: 'Storage',
      field: Const.MONEY_DIARY_COL_ID.STORAGE,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: this.getComboboxValue(storage),
      },
      filter: 'agTextColumnFilter',
      width: 110,
      valueSetter: this.newValueSetter,
      valueFormatter: (params) => this.comboboxFormatter(storage, params.value),
      filterValueGetter: (params) =>
        this.comboboxFormatter(
          storage,
          params.getValue(Const.MONEY_DIARY_COL_ID.STORAGE),
        ),
    },
    {
      headerName: 'Credit',
      field: Const.MONEY_DIARY_COL_ID.CREDIT,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: this.getComboboxValue(credit),
      },
      filter: 'agTextColumnFilter',
      width: 110,
      valueSetter: (params) => this.dateSetter(params, credit),
      valueFormatter: (params) => this.comboboxFormatter(credit, params.value),
      filterValueGetter: (params) =>
        this.comboboxFormatter(
          credit,
          params.getValue(Const.MONEY_DIARY_COL_ID.CREDIT),
        ),
    },
    {
      headerName: 'Item',
      field: Const.MONEY_DIARY_COL_ID.ITEM,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: this.getComboboxValue(item),
      },
      filter: 'agTextColumnFilter',
      width: 100,
      valueSetter: this.newValueSetter,
      valueFormatter: (params) => this.comboboxFormatter(item, params.value),
      filterValueGetter: (params) =>
        this.comboboxFormatter(
          item,
          params.getValue(Const.MONEY_DIARY_COL_ID.ITEM),
        ),
    },
    {
      headerName: 'Remark',
      field: Const.MONEY_DIARY_COL_ID.REMARK,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: this.getComboboxValue(remark),
      },
      filter: 'agTextColumnFilter',
      width: 100,
      valueSetter: this.newValueSetter,
      valueFormatter: (params) => this.comboboxFormatter(remark, params.value),
      filterValueGetter: (params) =>
        this.comboboxFormatter(
          remark,
          params.getValue(Const.MONEY_DIARY_COL_ID.REMARK),
        ),
    },
    {
      headerName: 'Color',
      field: Const.MONEY_DIARY_COL_ID.COLOR,
      hide: true,
    },
    {
      headerName: 'Use Date',
      field: Const.MONEY_DIARY_COL_ID.USE_DATE,
      type: 'dateCol',
      hide: true,
      width: 100,
      valueSetter: (params) => this.dateSetter(params, credit),
      valueFormatter: this.dateFormatter,
      comparator: (_a, _b, nodeA, nodeB) =>
        Util.sortCommonProc(nodeA.data, nodeB.data, [
          { col: Const.MONEY_DIARY_COL_ID.USE_DATE },
          { col: Const.MONEY_DIARY_COL_ID.INPUT_MODE, asc: false },
        ]),
    },
    {
      headerName: 'Pay Date',
      field: Const.MONEY_DIARY_COL_ID.PAY_DATE,
      type: 'dateCol',
      width: 100,
      valueFormatter: this.dateFormatter,
      comparator: (_a, _b, nodeA, nodeB) =>
        Util.sortCommonProc(nodeA.data, nodeB.data, [
          { col: Const.MONEY_DIARY_COL_ID.PAY_DATE },
          { col: Const.MONEY_DIARY_COL_ID.INPUT_MODE, asc: false },
        ]),
    },
    {
      headerName: 'Input Mode',
      field: Const.MONEY_DIARY_COL_ID.INPUT_MODE,
      cellEditor: 'agNumberCellEditor',
      hide: true,
    },
    {
      // ※列定義の最後に配置する
      headerName: 'Update',
      field: Const.ROW_DATA_COMMON_COL_ID.UPDATE,
      cellEditor: 'agCheckboxCellEditor',
      hide: true,
    },
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
      params.data[Const.MONEY_DIARY_COL_ID.USE_DATE] ||
        params.data[Const.MONEY_DIARY_COL_ID.DATE],
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
        data[Const.MONEY_DIARY_COL_ID.USE_DATE] ||
          data[Const.MONEY_DIARY_COL_ID.DATE],
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
   * @param option
   * @default style = {}
   * @returns 行スタイル
   */
  protected override readonly getRowStyleCustom = (
    rowData: RowData,
    style: RowStyle = {},
    option: Record<string, boolean>,
  ): RowStyle => {
    const inputMode = Util.getInputMode(rowData);
    if (inputMode === Const.INPUT_MODE.NONE) {
      // Noneデータの場合
      style['backgroundColor'] = Const.GRID_ROW_COLOR.NONE;
    } else if (inputMode !== Const.INPUT_MODE.ALL_REQ) {
      // エラーデータの場合
      style['backgroundColor'] = Const.GRID_ROW_COLOR.ERROR;
    } else if (!!rowData[Const.ROW_DATA_COMMON_COL_ID.UPDATE]) {
      // // 更新済データの場合
      // style['backgroundColor'] = Const.GRID_ROW_COLOR.UPDATE;
    }

    const payDate =
      rowData[Const.MONEY_DIARY_COL_ID.PAY_DATE]?.toString() ?? '';
    const today = DateUtil.format(new Date(), Const.DATE_FORMAT.YYYY_MM_DD);
    if (!option['editPastData'] && !!payDate && payDate < today) {
      style['opacity'] = 0.6;
    }

    return style;
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
    const today = DateUtil.format(new Date(), Const.DATE_FORMAT.YYYY_MM_DD);

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
        data[Const.MONEY_DIARY_COL_ID.USE_DATE] ||
          data[Const.MONEY_DIARY_COL_ID.DATE],
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

  /**
   * 選択行の金額を計算して返却する
   * @param rowDatas
   * @returns
   */
  override readonly calcSelectStatus = (rowDatas: RowData[]): MoneyStatus[] => {
    const labels = ['Cnt', 'Sum', 'Inc', 'Exp'];
    const status = labels.map((label) => ({ label, amount: 0 }));
    // 収支計算
    for (const data of rowDatas) {
      const num = Number(data[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM]);
      if (!Util.isValidInteger(num)) {
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
      value: !idx ? rowDatas.length.toString() : Util.cvtNumToPrice(st.amount),
    }));
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
   * @param selectRowDatas
   * @param otherRowDatas
   * @param option
   * @returns 入力データ
   */
  override readonly createInputData = (
    selectRowDatas: RowData[],
    rowDataKey: RowDataKey,
    [mainRowDatas, ...otherRowDatas]: RowData[][],
    option: InputOption,
  ): DialogInput => {
    if (!option.type) {
      // デフォルト
      return this.createInputDataDef(
        selectRowDatas,
        rowDataKey,
        [mainRowDatas, ...otherRowDatas],
        option,
      );
    } else if (option.type === INPUT_OPTION_TYPE.REPLACE) {
      // 置換時
      return this.createInputDataRep(selectRowDatas, rowDataKey);
    } else if (option.type === INPUT_OPTION_TYPE.SERIAL_NUM) {
      // 連番付与
      return this.createInputDataSerialNum(selectRowDatas, rowDataKey);
    }
    return {} as DialogInput;
  };

  /**
   * ダイアログ入力データ作成(デフォルト)
   * @param selectRowDatas
   * @param rowDataKey
   * @param mainRowDatas
   * @param otherRowDatas
   * @param option
   * @returns 入力データ
   */
  private readonly createInputDataDef = (
    selectRowDatas: RowData[],
    rowDataKey: RowDataKey,
    [mainRowDatas, ...otherRowDatas]: RowData[][],
    option: InputOption,
  ): DialogInput => {
    // ボタンオプションの設定
    const buttonOptions: DialogInputButtonOption[] = [
      {
        id: DIALOG_BUTTON.DEL,
      },
      {
        id: DIALOG_BUTTON.ADD,
      },
      {
        id: DIALOG_BUTTON.CLEAR,
      },
      {
        id: DIALOG_BUTTON.RESET,
      },
      {
        id: DIALOG_BUTTON.OK,
      },
      {
        id: DIALOG_BUTTON.MOVE,
        label: 'Move',
        icon: 'drive_file_move',
        color: 'accent',
        clickEvent: (form, input, dialogRef) => {
          const value: DialogOutput = {
            datas: this.dialogUsecase.createOutputDatas(form, input),
            status: DIALOG_STATUS.MOVE,
          };
          dialogRef.close(value);
        },
      },
    ];

    const rowData = selectRowDatas[0];
    const disabledList = {} as Record<MoneyDiaryColId, boolean>;
    const optionsList = {} as Record<MoneyDiaryColId, DialogOption[]>;
    let creditDatasIdx = -1;
    let storageDatasIdx = -1;
    const linkList = Object.entries(Const.ROW_DATA_INFO[rowDataKey].link);
    for (const [idx, [moneyColId, { colId }]] of linkList.entries()) {
      const inCol = moneyColId as MoneyDiaryColId;
      // セレクトボックスの一致項目が無効化されている場合 true を設定
      disabledList[inCol] = otherRowDatas[idx].some(
        (data) =>
          data[colId] === rowData[inCol] &&
          !data[Const.ROW_DATA_COMMON_COL_ID.VALID],
      );
      // セレクトボックスの中身を設定
      optionsList[inCol] = otherRowDatas[idx]
        .filter((data) => {
          if (disabledList[inCol]) {
            // 非活性の場合
            return !!data[Const.ROW_DATA_COMMON_COL_ID.LABEL];
          }
          // 上記以外
          return (
            !!data[Const.ROW_DATA_COMMON_COL_ID.LABEL] &&
            !!data[Const.ROW_DATA_COMMON_COL_ID.VALID]
          );
        })
        .map((data) => ({
          id: data[colId]!.toString(),
          label: data[Const.ROW_DATA_COMMON_COL_ID.LABEL]!.toString(),
        }));
      // ストレージ情報のidxを設定
      if (inCol === Const.MONEY_DIARY_COL_ID.STORAGE) {
        storageDatasIdx = idx;
      }
      // クレジット情報のidxを設定
      if (inCol === Const.MONEY_DIARY_COL_ID.CREDIT) {
        creditDatasIdx = idx;
      }
    }

    // オートコンプリートデータ メモ
    const autocompMemoData: DialogOption[] = [];
    const optLabelSet: Set<string> = new Set();
    const reverseMainRowDatas = mainRowDatas.toReversed();
    for (const data of reverseMainRowDatas) {
      if (
        data[Const.ROW_DATA_COMMON_COL_ID.ID] ===
        rowData[Const.ROW_DATA_COMMON_COL_ID.ID]
      ) {
        // 編集対象の場合、オートコンプリートに追加しない
        continue;
      }

      const storageId =
        data[Const.MONEY_DIARY_COL_ID.STORAGE]?.toString() ?? '';
      const storage =
        otherRowDatas[storageDatasIdx]
          .find((dt) => dt[Const.ROW_DATA_COMMON_COL_ID.ID] === storageId)
          ?.[Const.ROW_DATA_COMMON_COL_ID.LABEL]?.toString() ?? '';
      const value = data[Const.MONEY_DIARY_COL_ID.MEMO]?.toString() ?? '';
      const label = value + (!!storage ? `　${storage}` : '');

      if (!!label && !optLabelSet.has(label)) {
        optLabelSet.add(label);
        autocompMemoData.push({
          id: data[Const.ROW_DATA_COMMON_COL_ID.ID]?.toString() ?? '',
          value,
          label,
        });
      }
    }

    // 支払日 setter
    const payDateSetter = (form: FormRecord): void => {
      const date = form.get(Const.MONEY_DIARY_COL_ID.DATE)?.value;
      const useDate = form.get(Const.MONEY_DIARY_COL_ID.USE_DATE)?.value;
      const credit = form.get(Const.MONEY_DIARY_COL_ID.CREDIT)?.value;

      let val = '';
      if (date !== undefined && useDate !== undefined && credit !== undefined) {
        val = Util.getPayDate(
          useDate || date,
          credit,
          otherRowDatas[creditDatasIdx],
        );
      }

      form.get(Const.MONEY_DIARY_COL_ID.PAY_DATE)?.setValue(val);
    };

    // 計算結果 setter
    const calcResultSetter = (form: FormRecord): void => {
      const amount = form.get(Const.MONEY_DIARY_COL_ID.AMOUNT)?.value;
      const val = Util.cvtNumToPrice(Util.calcResult(amount));

      form.get(DIALOG_INPUT_ID.CALC_RESULT)?.setValue(val);
    };

    // メモ setter
    const memoSetter = (
      form: FormRecord,
      _: Required<DialogInput>,
      options?: { type: SetType; option: DialogOption },
    ): void => {
      if (options?.type === 'select') {
        // オートコンプリートで選択した場合
        const data = reverseMainRowDatas.find(
          (dt) => dt[Const.ROW_DATA_COMMON_COL_ID.ID] === options.option.id,
        );

        if (!data) {
          // 選択したメモが空の場合
          return;
        }

        const checkKeys = [
          Const.MONEY_DIARY_COL_ID.STORAGE,
          Const.MONEY_DIARY_COL_ID.CREDIT,
          Const.MONEY_DIARY_COL_ID.ITEM,
          Const.MONEY_DIARY_COL_ID.REMARK,
          Const.MONEY_DIARY_COL_ID.COLOR,
        ];

        if (
          checkKeys.some(
            (key) =>
              form.get(key)?.value !== Util.getInitValue(rowDataKey, key),
          )
        ) {
          // 初期値でない入力値が1箇所でもある場合
          return;
        }

        const keys = [
          Const.MONEY_DIARY_COL_ID.DATE,
          Const.MONEY_DIARY_COL_ID.AMOUNT,
          Const.MONEY_DIARY_COL_ID.STORAGE,
          Const.MONEY_DIARY_COL_ID.CREDIT,
          Const.MONEY_DIARY_COL_ID.ITEM,
          Const.MONEY_DIARY_COL_ID.REMARK,
          Const.MONEY_DIARY_COL_ID.COLOR,
        ];

        for (const key of keys) {
          if (
            key === Const.MONEY_DIARY_COL_ID.DATE ||
            key === Const.MONEY_DIARY_COL_ID.AMOUNT
          ) {
            if (!!form.get(key)?.value) {
              // 日付or金額の入力値が既にある場合
              continue;
            }
          }
          form.get(key)?.setValue(data[key]);
        }
      }
    };

    // 日付初期値
    const initDate = (() => {
      if (Util.checkInputMode(rowData, Const.INPUT_MODE.NONE)) {
        return DateUtil.format(new Date(), Const.DATE_FORMAT.YYYY_MM_DD);
      }
      return rowData[Const.MONEY_DIARY_COL_ID.DATE];
    })();

    // 入力データ
    const initValues = Util.getInitRowData(rowDataKey);
    const datas: DialogInputData[] = [
      {
        id: Const.MONEY_DIARY_COL_ID.DATE,
        label: 'Date',
        value: initDate,
        type: Const.INPUT_TYPE.DATE,
        initValue: initValues[Const.MONEY_DIARY_COL_ID.DATE],
        setter: payDateSetter,
      },
      {
        id: Const.MONEY_DIARY_COL_ID.USE_DATE,
        label: 'Use Date',
        value: rowData[Const.MONEY_DIARY_COL_ID.USE_DATE],
        type: Const.INPUT_TYPE.DATE,
        initValue: initValues[Const.MONEY_DIARY_COL_ID.USE_DATE],
        setter: payDateSetter,
      },
      {
        id: Const.MONEY_DIARY_COL_ID.PAY_DATE,
        label: 'Pay Date',
        value: rowData[Const.MONEY_DIARY_COL_ID.PAY_DATE],
        type: Const.INPUT_TYPE.DATE,
        disabled: true,
        initValue: initValues[Const.MONEY_DIARY_COL_ID.PAY_DATE],
      },
      {
        id: Const.MONEY_DIARY_COL_ID.AMOUNT,
        label: 'Amount',
        value: rowData[Const.MONEY_DIARY_COL_ID.AMOUNT],
        required: true,
        initValue: initValues[Const.MONEY_DIARY_COL_ID.AMOUNT],
        placeholder: 'Ex. -(200+500)',
        forbiddenChars: [Const.FORBIDDEN_CHARS.FORMULA],
        setter: calcResultSetter,
      },
      {
        // 計算結果表示用
        id: DIALOG_INPUT_ID.CALC_RESULT,
        label: 'Calc Result',
        value: Util.cvtNumToPrice(
          Util.calcResult(rowData[Const.MONEY_DIARY_COL_ID.AMOUNT]),
        ),
        required: true,
        readonly: true,
        initValue: initValues[Const.MONEY_DIARY_COL_ID.AMOUNT],
        notReturn: true,
      },
      {
        id: Const.MONEY_DIARY_COL_ID.MEMO,
        label: 'Memo',
        value: rowData[Const.MONEY_DIARY_COL_ID.MEMO],
        type: Const.INPUT_TYPE.TEXTAREA,
        initValue: initValues[Const.MONEY_DIARY_COL_ID.MEMO],
        placeholder: 'Ex. 夕食代',
        autocomp: true,
        options: autocompMemoData,
        setter: memoSetter,
        style: {
          height: `${24 * 3}px`,
        },
      },
      {
        id: Const.MONEY_DIARY_COL_ID.STORAGE,
        label: 'Storage',
        value: rowData[Const.MONEY_DIARY_COL_ID.STORAGE],
        type: Const.INPUT_TYPE.SELECT,
        disabled: disabledList[Const.MONEY_DIARY_COL_ID.STORAGE],
        options: optionsList[Const.MONEY_DIARY_COL_ID.STORAGE],
        initValue: initValues[Const.MONEY_DIARY_COL_ID.STORAGE],
      },
      {
        id: Const.MONEY_DIARY_COL_ID.CREDIT,
        label: 'Credit',
        value: rowData[Const.MONEY_DIARY_COL_ID.CREDIT],
        type: Const.INPUT_TYPE.SELECT,
        disabled: disabledList[Const.MONEY_DIARY_COL_ID.CREDIT],
        options: optionsList[Const.MONEY_DIARY_COL_ID.CREDIT],
        initValue: initValues[Const.MONEY_DIARY_COL_ID.CREDIT],
        setter: payDateSetter,
      },
      {
        id: Const.MONEY_DIARY_COL_ID.ITEM,
        label: 'Item',
        value: rowData[Const.MONEY_DIARY_COL_ID.ITEM],
        type: Const.INPUT_TYPE.SELECT,
        disabled: disabledList[Const.MONEY_DIARY_COL_ID.ITEM],
        options: optionsList[Const.MONEY_DIARY_COL_ID.ITEM],
        initValue: initValues[Const.MONEY_DIARY_COL_ID.ITEM],
      },
      {
        id: Const.MONEY_DIARY_COL_ID.REMARK,
        label: 'Remark',
        value: rowData[Const.MONEY_DIARY_COL_ID.REMARK],
        type: Const.INPUT_TYPE.SELECT,
        disabled: disabledList[Const.MONEY_DIARY_COL_ID.REMARK],
        options: optionsList[Const.MONEY_DIARY_COL_ID.REMARK],
        initValue: initValues[Const.MONEY_DIARY_COL_ID.REMARK],
      },
      {
        id: Const.MONEY_DIARY_COL_ID.COLOR,
        label: 'Color',
        value: rowData[Const.MONEY_DIARY_COL_ID.COLOR],
        type: Const.INPUT_TYPE.COLOR,
        initValue: initValues[Const.MONEY_DIARY_COL_ID.COLOR],
        hide: true, // 利用することがないため非表示にする
      },
    ];

    // バリデーションチェック用コールバック関数
    let validatorFn:
      | ((
          control: AbstractControl,
          datas: DialogInputData[],
        ) => ValidationErrors)
      | null;
    if (option.editPastData) {
      // 過去データが編集可能である場合
      validatorFn = null;
    } else {
      // 過去データが編集可能でない場合
      const initPayDate = rowData[Const.MONEY_DIARY_COL_ID.PAY_DATE];
      if (
        !!initPayDate &&
        initPayDate < DateUtil.format(new Date(), Const.DATE_FORMAT.YYYY_MM_DD)
      ) {
        // 支払日が過去の場合
        validatorFn = (control: AbstractControl): ValidationErrors => {
          const errors: ValidationErrors = {};
          const payDate = control.get(Const.MONEY_DIARY_COL_ID.PAY_DATE)?.value;
          const today = DateUtil.format(
            new Date(),
            Const.DATE_FORMAT.YYYY_MM_DD,
          );

          // 削除/更新/移動ボタン押下不可
          errors[DIALOG_BUTTON.DEL] = true;
          errors[DIALOG_BUTTON.OK] = true;
          errors[DIALOG_BUTTON.MOVE] = true;

          if (payDate === initPayDate) {
            // 初期表示 or 支払日以外が更新されている場合
            errors[DIALOG_BUTTON.ADD] = true;
          } else {
            // 支払日が更新されている場合
            if (!!payDate && payDate < today) {
              // 支払日が過去
              errors[DIALOG_BUTTON.ADD] = true;
            }
          }

          return errors;
        };
      } else {
        // 支払日が本日以降もしくはnullの場合
        validatorFn = (
          control: AbstractControl,
          datas: DialogInputData[],
        ): ValidationErrors => {
          const errors: ValidationErrors = {};
          const payDate = control.get(Const.MONEY_DIARY_COL_ID.PAY_DATE)?.value;
          const today = DateUtil.format(
            new Date(),
            Const.DATE_FORMAT.YYYY_MM_DD,
          );

          if (
            datas.some((data) => !data.hide && control.get(data.id)?.invalid)
          ) {
            // 表示状態 かつ 入力誤り の項目が１つ以上ある場合
            errors[DIALOG_BUTTON.MOVE] = true;
          }

          if (payDate !== initPayDate && !!payDate && payDate < today) {
            // 支払日が更新されている かつ 過去の場合
            errors[DIALOG_BUTTON.ADD] = true;
            errors[DIALOG_BUTTON.OK] = true;
            errors[DIALOG_BUTTON.MOVE] = true;
          }

          return errors;
        };
      }
    }

    return {
      title: Util.getScreenTitle2(rowDataKey) + ' Input',
      datas,
      buttonOptions,
      validatorFn,
    };
  };

  /**
   * ダイアログ入力データ作成(更新時)
   * @param selectRowDatas
   * @param rowDataKey
   * @param mainRowDatas
   * @param otherRowDatas
   * @param option
   * @returns 入力データ
   */
  private readonly createInputDataUpd = (
    selectRowDatas: RowData[],
    rowDataKey: RowDataKey,
    [mainRowDatas, ...otherRowDatas]: RowData[][],
    option: InputOption,
  ): DialogInput => {
    return {} as DialogInput;
  };

  /**
   * ダイアログ入力データ作成(置換時)
   * @param selectRowDatas
   * @param rowDataKey
   * @returns 入力データ
   */
  private readonly createInputDataRep = (
    selectRowDatas: RowData[],
    rowDataKey: RowDataKey,
  ): DialogInput => {
    // ボタンオプションの設定
    const buttonOptions: DialogInputButtonOption[] = [
      {
        id: DIALOG_BUTTON.DEL,
        hide: true,
      },
      {
        id: DIALOG_BUTTON.ADD,
        hide: true,
      },
      {
        id: DIALOG_BUTTON.RESET,
        hide: true,
      },
    ];
    // Preview Setter
    const replacePreviewValue = this.getRowDatasReplacedMemo(
      selectRowDatas,
      '',
      '',
    )
      .map((data) => data[Const.MONEY_DIARY_COL_ID.MEMO])
      .join('\n');
    const previewSetter = (form: FormRecord<FormCtrl>): void => {
      const target =
        form.get(DIALOG_INPUT_ID.TARGET_STRING)?.value?.toString() ?? '';
      const replace =
        form.get(DIALOG_INPUT_ID.REPLACE_CHAR)?.value?.toString() ?? '';

      const val = this.getRowDatasReplacedMemo(selectRowDatas, target, replace)
        .map((data) => data[Const.MONEY_DIARY_COL_ID.MEMO])
        .join('\n');
      form.get(DIALOG_INPUT_ID.AFTER_REPLACE)?.setValue(val);
    };
    // 入力データ
    const datas: DialogInputData[] = [
      {
        id: DIALOG_INPUT_ID.TARGET_STRING,
        label: 'Target String',
        value: '',
        required: true,
        setter: previewSetter,
      },
      {
        id: DIALOG_INPUT_ID.REPLACE_CHAR,
        label: 'Replace Char',
        value: '',
        setter: previewSetter,
      },
      {
        id: DIALOG_INPUT_ID.BEFORE_REPLACE,
        label: 'Before Memo',
        type: Const.INPUT_TYPE.TEXTAREA,
        disabled: true,
        value: replacePreviewValue,
        notReturn: true,
        style: {
          height: `${24 * 3}px`,
          'text-wrap-mode': 'nowrap',
        },
      },
      {
        id: DIALOG_INPUT_ID.AFTER_REPLACE,
        label: 'After Memo',
        type: Const.INPUT_TYPE.TEXTAREA,
        disabled: true,
        value: replacePreviewValue,
        notReturn: true,
        style: {
          height: `${24 * 3}px`,
          'text-wrap-mode': 'nowrap',
        },
      },
    ];
    // ダイアログスタイル
    const style = {
      // width: '80vw',
    };
    return {
      title: Util.getScreenTitle2(rowDataKey) + ' Replace',
      datas,
      buttonOptions,
      style,
    };
  };

  /**
   * ダイアログ入力データ作成(連番付与時)
   * @param selectRowDatas
   * @param rowDataKey
   * @returns 入力データ
   */
  private readonly createInputDataSerialNum = (
    selectRowDatas: RowData[],
    rowDataKey: RowDataKey,
  ): DialogInput => {
    // ボタンオプションの設定
    const buttonOptions: DialogInputButtonOption[] = [
      {
        id: DIALOG_BUTTON.DEL,
        hide: true,
      },
      {
        id: DIALOG_BUTTON.ADD,
        hide: true,
      },
      {
        id: DIALOG_BUTTON.RESET,
        hide: true,
      },
    ];
    // Preview Setter
    const previewValue = selectRowDatas
      .map((data) => data[Const.MONEY_DIARY_COL_ID.MEMO])
      .join('\n');

    const previewSetter = (
      form: FormRecord<FormCtrl>,
      input: Required<DialogInput>,
    ): void => {
      const [
        memo,
        serialNumInit,
        serialDateFormat,
        serialDateInit,
        serialDateFreq,
        serialDateFreqNum,
      ] = [
        Const.MONEY_DIARY_COL_ID.MEMO,
        DIALOG_INPUT_ID.SERIAL_NUM_INIT,
        DIALOG_INPUT_ID.DATE_FORMAT,
        DIALOG_INPUT_ID.SERIAL_DATE_INIT,
        DIALOG_INPUT_ID.SERIAL_DATE_FREQ,
        DIALOG_INPUT_ID.SERIAL_DATE_FREQ_NUM,
      ].map((id) => form.get(id)?.value?.toString() ?? '');

      // 入力内容によって、表示項目を制御
      const [
        ,
        inputSerialNumInit,
        inputSerialDateFormat,
        inputSerialDateInit,
        inputSerialDateFreq,
        inputSerialDateFreqNum,
      ] = input.datas;
      if (memo.includes(Const.RESERVED_STRING.SERIAL_NUM)) {
        // 連番あり
        inputSerialNumInit.hide = false;
      } else {
        // 連番なし
        inputSerialNumInit.hide = true;
      }
      if (memo.includes(Const.RESERVED_STRING.SERIAL_DATE)) {
        // 日付連番あり
        inputSerialDateFormat.hide = false;
        inputSerialDateInit.hide = false;
        inputSerialDateFreq.hide = false;
        inputSerialDateFreqNum.hide = false;
      } else {
        // 日付連番なし
        inputSerialDateFormat.hide = true;
        inputSerialDateInit.hide = true;
        inputSerialDateFreq.hide = true;
        inputSerialDateFreqNum.hide = true;
      }

      // 表示内容を更新
      const val = this.getRowDatasSerialNum(
        selectRowDatas,
        memo,
        serialNumInit,
        serialDateFormat,
        serialDateInit,
        serialDateFreq,
        serialDateFreqNum,
      )
        .map((data) => data[Const.MONEY_DIARY_COL_ID.MEMO])
        .join('\n');
      form.get(DIALOG_INPUT_ID.AFTER_REPLACE)?.setValue(val);
    };
    // 入力データ
    const datas: DialogInputData[] = [
      {
        id: Const.MONEY_DIARY_COL_ID.MEMO,
        label: 'Memo',
        value: Const.RESERVED_STRING.ORIGINAL,
        initValue: '',
        type: Const.INPUT_TYPE.TEXTAREA,
        placeholder: '@o:以前の文字を使用, @c:連番付与, @d:日付連番付与',
        setter: previewSetter,
      },
      {
        id: DIALOG_INPUT_ID.SERIAL_NUM_INIT,
        label: 'Serial Number Init',
        value: 1,
        initValue: 1,
        type: Const.INPUT_TYPE.NUM,
        hide: true,
        setter: previewSetter,
      },
      {
        id: DIALOG_INPUT_ID.DATE_FORMAT,
        label: 'Serial Date Format',
        value: Const.DATE_FORMAT.YYYY_MM,
        initValue: Const.DATE_FORMAT.YYYY_MM,
        type: Const.INPUT_TYPE.SELECT,
        options: Const.SERIAL_DATE_FORMAT_SELECT,
        hide: true,
        setter: previewSetter,
      },
      {
        id: DIALOG_INPUT_ID.SERIAL_DATE_INIT,
        label: 'Serial Date Init',
        value: null,
        type: Const.INPUT_TYPE.DATE,
        hide: true,
        setter: previewSetter,
      },
      {
        id: DIALOG_INPUT_ID.SERIAL_DATE_FREQ,
        label: 'Serial Date Freq',
        value: Const.DATE_FORMAT.YYYY_MM,
        initValue: Const.DATE_FORMAT.YYYY_MM,
        type: Const.INPUT_TYPE.SELECT,
        options: Const.SERIAL_DATE_FORMAT_SELECT,
        hide: true,
        setter: previewSetter,
      },
      {
        id: DIALOG_INPUT_ID.SERIAL_DATE_FREQ_NUM,
        label: 'Serial Date Freq Num',
        value: 1,
        initValue: 1,
        type: Const.INPUT_TYPE.NUM,
        min: 1,
        hide: true,
        setter: previewSetter,
      },
      {
        id: DIALOG_INPUT_ID.BEFORE_REPLACE,
        label: 'Before Memo',
        type: Const.INPUT_TYPE.TEXTAREA,
        disabled: true,
        value: previewValue,
        notReturn: true,
        style: {
          height: `${24 * 3}px`,
          'text-wrap-mode': 'nowrap',
        },
      },
      {
        id: DIALOG_INPUT_ID.AFTER_REPLACE,
        label: 'After Memo',
        type: Const.INPUT_TYPE.TEXTAREA,
        disabled: true,
        value: previewValue,
        notReturn: true,
        style: {
          height: `${24 * 3}px`,
          'text-wrap-mode': 'nowrap',
        },
      },
    ];
    // ダイアログスタイル
    const style = {
      // width: '80vw',
    };
    // 予約語無効
    const invalidReservedWord = true;
    return {
      title: Util.getScreenTitle2(rowDataKey) + ' Serial Number',
      datas,
      buttonOptions,
      style,
      invalidReservedWord,
    };
  };

  private readonly getRowDatasReplacedMemo = (
    rowDatas: RowData[],
    target: string,
    replace: string,
  ): RowData[] => {
    const newDatas = structuredClone(rowDatas);
    const targetRegExp = new RegExp(target, 'g');
    for (const data of newDatas) {
      data[Const.MONEY_DIARY_COL_ID.MEMO] =
        data[Const.MONEY_DIARY_COL_ID.MEMO]
          ?.toString()
          .replace(targetRegExp, replace) ?? null;
    }
    return newDatas;
  };

  private readonly getRowDatasSerialNum = (
    rowDatas: RowData[],
    memo: string,
    numInit: string,
    dateFormat: string,
    dateInit: string,
    dateFreq: string,
    dateFreqNumStr: string,
  ): RowData[] => {
    const newDatas = structuredClone(rowDatas);
    let serialNum = Number(numInit);
    let serialDate = dateInit;
    let dateFreqNum = Number(dateFreqNumStr);

    for (const data of newDatas) {
      // 連番
      const serialNumStr = serialNum.toString();
      serialNum++;
      // 日付連番
      let serialDateStr = '';
      if (!!serialDate) {
        serialDateStr = DateUtil.format(
          serialDate,
          dateFormat || Const.DATE_FORMAT.YYYY_MM_DD,
        );
      } else {
        serialDateStr = '';
      }
      if (!!serialDate) {
        let date = new Date(serialDate);
        if (dateFreq === Const.DATE_FORMAT.YYYY) {
          date = DateUtil.addYears(serialDate, dateFreqNum);
        } else if (dateFreq === Const.DATE_FORMAT.YYYY_MM) {
          date = DateUtil.addMonths(serialDate, dateFreqNum);
        } else if (dateFreq === Const.DATE_FORMAT.YY_MM_DD) {
          date = DateUtil.addDays(serialDate, dateFreqNum);
        }
        serialDate = DateUtil.format(date, Const.DATE_FORMAT.YYYY_MM_DD);
      }

      // 連番付与
      const [originalRegExp, serialNumRegExp, serialDateRegExp] = [
        Const.RESERVED_STRING.ORIGINAL,
        Const.RESERVED_STRING.SERIAL_NUM,
        Const.RESERVED_STRING.SERIAL_DATE,
      ].map((str) => new RegExp(str, 'g'));
      data[Const.MONEY_DIARY_COL_ID.MEMO] = memo
        // オリジナルのメモ内容を反映
        .replace(
          originalRegExp,
          data[Const.MONEY_DIARY_COL_ID.MEMO]?.toString() ?? '',
        )
        // 連番情報を反映
        .replace(serialNumRegExp, serialNumStr)
        // 日付連番情報を反映
        .replace(serialDateRegExp, serialDateStr)
        // 予約語を除去
        .replace(Const.RESERVED_WORD, '');
    }

    return newDatas;
  };

  /**
   * 入力項目反映(行編集Emitterデータ作成)
   * @param selectRowDatas
   * @param outputDatas
   * @param option
   * @returns 行データ項目追加後データ
   */
  protected override readonly reflectRowDatas = <InputOption>(
    selectRowDatas: RowData[],
    outputDatas: DialogOutputData[],
    option?: InputOption,
  ): RowData[] => {
    if (!option) {
      // デフォルト
      const newDatas = this.reflectRowDatasDefault(selectRowDatas, outputDatas);
      // 金額(数値)設定
      newDatas[0][Const.MONEY_DIARY_COL_ID.AMOUNT_NUM] = Util.calcResult(
        newDatas[0][Const.MONEY_DIARY_COL_ID.AMOUNT],
      );
      // 入力モード設定
      newDatas[0][Const.MONEY_DIARY_COL_ID.INPUT_MODE] = Util.getInputMode(
        newDatas[0],
      );
      // 更新フラグ設定
      newDatas[0][Const.ROW_DATA_COMMON_COL_ID.UPDATE] = true;
      return newDatas;
    } else if (option === INPUT_OPTION_TYPE.REPLACE) {
      // 置換時
      const [target, replace] = [
        DIALOG_INPUT_ID.TARGET_STRING,
        DIALOG_INPUT_ID.REPLACE_CHAR,
      ].map(
        (id) =>
          outputDatas.find((data) => data.id === id)?.value?.toString() ?? '',
      );
      return this.getRowDatasReplacedMemo(selectRowDatas, target, replace);
    } else if (option === INPUT_OPTION_TYPE.SERIAL_NUM) {
      // 連番付与時
      const [
        memo,
        serialNumInit,
        serialDateFormat,
        serialDateInit,
        serialDateFreq,
        serialDateFreqNum,
      ] = [
        Const.MONEY_DIARY_COL_ID.MEMO,
        DIALOG_INPUT_ID.SERIAL_NUM_INIT,
        DIALOG_INPUT_ID.DATE_FORMAT,
        DIALOG_INPUT_ID.SERIAL_DATE_INIT,
        DIALOG_INPUT_ID.SERIAL_DATE_FREQ,
        DIALOG_INPUT_ID.SERIAL_DATE_FREQ_NUM,
      ].map(
        (id) =>
          outputDatas.find((data) => data.id === id)?.value?.toString() ?? '',
      );
      return this.getRowDatasSerialNum(
        selectRowDatas,
        memo,
        serialNumInit,
        serialDateFormat,
        serialDateInit,
        serialDateFreq,
        serialDateFreqNum,
      );
    }

    return selectRowDatas;
  };

  /**
   * 更新・追加・削除以外のステータス返却時の処理(行編集Emitterデータ作成)
   * @param status
   * @param selectNewDatas
   * @param rowDatas
   * @param rowDataKey
   * @param editInfo
   * @returns [編集後行データ、行編集情報]
   */
  protected override readonly procOtherStatus = (
    status: DialogStatus,
    selectNewDatas: RowData[],
    rowDatas: RowData[],
    rowDataKey: RowDataKey,
    editInfo: RowDataEdit[],
  ): [RowData[], RowDataEdit[]] => {
    let newDatas = structuredClone(rowDatas);
    let newEditInfo = structuredClone(editInfo);

    if (status === DIALOG_STATUS.MOVE) {
      // moveデータを更新
      [newDatas, newEditInfo] = this.procUpdStatus(
        selectNewDatas,
        newDatas,
        rowDataKey,
        newEditInfo,
      );

      // moveの相方を探す
      const targetData = structuredClone(selectNewDatas[0]);
      const memo = targetData[Const.MONEY_DIARY_COL_ID.MEMO] as string;
      const findData = newDatas.findLast(
        (dt) =>
          dt[Const.MONEY_DIARY_COL_ID.MEMO]?.toString().includes(memo) &&
          Number(dt[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM]) > 0,
      );
      const num = -Number(targetData[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM]);
      // 追加データ
      const data = {
        ...structuredClone(targetData),
        [Const.MONEY_DIARY_COL_ID.AMOUNT]: num.toString(),
        [Const.MONEY_DIARY_COL_ID.AMOUNT_NUM]: num,
        [Const.MONEY_DIARY_COL_ID.STORAGE]:
          findData?.[Const.MONEY_DIARY_COL_ID.STORAGE] ??
          Util.getInitValue(rowDataKey, Const.MONEY_DIARY_COL_ID.STORAGE),
        [Const.MONEY_DIARY_COL_ID.CREDIT]:
          findData?.[Const.MONEY_DIARY_COL_ID.CREDIT] ??
          Util.getInitValue(rowDataKey, Const.MONEY_DIARY_COL_ID.CREDIT),
      };
      // moveの相方データを追加
      [newDatas, newEditInfo] = this.procAddStatus(
        [data],
        newDatas,
        rowDataKey,
        newEditInfo,
      );
    }
    return [newDatas, newEditInfo];
  };

  /**
   * 空データ追加チェック(行編集Emitterデータ作成)
   * @param newDatas
   * @returns チェック結果
   */
  protected override readonly checkAddEmptyData = (
    newDatas: RowData[],
  ): boolean => {
    return !newDatas.some((data) =>
      Util.checkInputMode(data, Const.INPUT_MODE.NONE),
    );
  };
}
