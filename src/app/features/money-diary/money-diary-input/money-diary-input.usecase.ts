import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormRecord, ValidationErrors } from '@angular/forms';
import {
  CellClassParams,
  CellStyle,
  ColDef,
  ValueFormatterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import * as DateUtil from 'date-fns';
import { Row, TblMap } from 'src/app/domain/row-data';
import { MoneyDiaryBaseUsecase } from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import * as Const from 'src/app/shared/constants/constants';
import {
  FormCtrl,
  MainCol,
  RowEdt,
  Tbl,
  ValType,
} from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import * as Dialog from 'src/app/shared/dialog-input/dialog-input.component';
import {
  DialogInput,
  DialogInputButtonOption,
  DialogInputData,
  DialogInputDatas,
  DialogOutput,
  DialogOutputData,
  DialogStatus,
  SetType,
} from 'src/app/shared/dialog-input/dialog-input.component';
import { DialogInputUsecase } from 'src/app/shared/dialog-input/dialog-input.usecase';
import { SelectOption } from 'src/app/shared/forms/forms.component';
import { MoneyStatus } from 'src/app/shared/money-status/money-status.component';

export const INPUT_OPTION_TYPE = {
  REPLACE: 'replace',
  SERIAL_NUM: 'serialNumber',
  UPDATE: 'update',
};
export type InputOptionType =
  (typeof INPUT_OPTION_TYPE)[keyof typeof INPUT_OPTION_TYPE];
export type InputOption = {
  type?: InputOptionType;
  edtPastData: boolean;
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

const CHECK_ID = '-check' as const;

const OTHER_COL_LIST = {
  [Const.TBL.STORAGE]: Const.MAIN_COL.STORAGE,
  [Const.TBL.CREDIT]: Const.MAIN_COL.CREDIT,
  [Const.TBL.ITEM]: Const.MAIN_COL.ITEM,
  [Const.TBL.REMARK]: Const.MAIN_COL.REMARK,
} as const satisfies Record<string, MainCol>;

@Injectable()
export class MoneyDiaryInputUsecase extends MoneyDiaryBaseUsecase {
  private readonly dialogUsecase = inject(DialogInputUsecase);

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
        field: Const.MAIN_COL.DATE,
        type: 'dateCol',
        pinned: 'left',
        rowDrag: true,
        width: 120,
        lockPosition: 'left',
        valueSetter: (params) => this.dateSetter(params, crdRows),
        valueFormatter: this.dateFormatter,
        comparator: (_a, _b, nodeA, nodeB) =>
          Util.sortCmnPrc(nodeA.data, nodeB.data, [
            { col: Const.MAIN_COL.INPUT_MODE, asc: false },
            { col: Const.MAIN_COL.DATE },
          ]),
        cellStyle: this.colorCellStyle,
      },
      {
        headerName: 'Amount',
        field: Const.MAIN_COL.AMOUNT,
        type: 'amountCol',
        cellEditor: 'agTextCellEditor',
        filterValueGetter: `data.${Const.MAIN_COL.AMOUNT_NUM}`,
        width: 110,
        valueFormatter: this.amountFormatter,
        comparator: (_a, _b, nodeA, nodeB) =>
          Util.compAmt(
            nodeA.data?.[Const.MAIN_COL.AMOUNT_NUM],
            nodeB.data?.[Const.MAIN_COL.AMOUNT_NUM],
          ),
        cellStyle: (params) =>
          Util.getStylePrice(params.data?.[Const.MAIN_COL.AMOUNT_NUM]),
      },
      {
        headerName: 'AmountNum',
        field: Const.MAIN_COL.AMOUNT_NUM,
        cellEditor: 'agNumberCellEditor',
        hide: true,
      },
      {
        headerName: 'Memo',
        field: Const.MAIN_COL.MEMO,
        cellEditor: 'agLargeTextCellEditor',
        filter: 'agTextColumnFilter',
        width: 220,
      },
      {
        headerName: 'Storage',
        field: Const.MAIN_COL.STORAGE,
        cellEditor: 'agSelectCellEditor',
        filter: 'agTextColumnFilter',
        width: 110,
        valueFormatter: (params) => this.listFormatter(stgRows, params.value),
        filterValueGetter: (params) =>
          this.listFormatter(stgRows, params.getValue(Const.MAIN_COL.STORAGE)),
      },
      {
        headerName: 'Credit',
        field: Const.MAIN_COL.CREDIT,
        cellEditor: 'agSelectCellEditor',
        filter: 'agTextColumnFilter',
        width: 110,
        valueSetter: (params) => this.dateSetter(params, crdRows),
        valueFormatter: (params) => this.listFormatter(crdRows, params.value),
        filterValueGetter: (params) =>
          this.listFormatter(crdRows, params.getValue(Const.MAIN_COL.CREDIT)),
      },
      {
        headerName: 'Item',
        field: Const.MAIN_COL.ITEM,
        cellEditor: 'agSelectCellEditor',
        filter: 'agTextColumnFilter',
        width: 100,
        valueFormatter: (params) => this.listFormatter(itmRows, params.value),
        filterValueGetter: (params) =>
          this.listFormatter(itmRows, params.getValue(Const.MAIN_COL.ITEM)),
      },
      {
        headerName: 'Remark',
        field: Const.MAIN_COL.REMARK,
        cellEditor: 'agSelectCellEditor',
        filter: 'agTextColumnFilter',
        width: 100,
        valueFormatter: (params) => this.listFormatter(rmkRows, params.value),
        filterValueGetter: (params) =>
          this.listFormatter(rmkRows, params.getValue(Const.MAIN_COL.REMARK)),
      },
      {
        headerName: 'Color',
        field: Const.MAIN_COL.COLOR,
        hide: true,
      },
      {
        headerName: 'Use Date',
        field: Const.MAIN_COL.USE_DATE,
        type: 'dateCol',
        hide: true,
        width: 100,
        valueSetter: (params) => this.dateSetter(params, crdRows),
        valueFormatter: this.dateFormatter,
        comparator: (_a, _b, nodeA, nodeB) =>
          Util.sortCmnPrc(nodeA.data, nodeB.data, [
            { col: Const.MAIN_COL.USE_DATE },
            { col: Const.MAIN_COL.INPUT_MODE, asc: false },
          ]),
      },
      {
        headerName: 'Pay Date',
        field: Const.MAIN_COL.PAY_DATE,
        type: 'dateCol',
        width: 100,
        valueFormatter: this.dateFormatter,
        comparator: (_a, _b, nodeA, nodeB) =>
          Util.sortCmnPrc(nodeA.data, nodeB.data, [
            { col: Const.MAIN_COL.PAY_DATE },
            { col: Const.MAIN_COL.INPUT_MODE, asc: false },
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
    params.data[Const.MAIN_COL.PAY_DATE] = Util.getPayDate(
      params.data[Const.MAIN_COL.USE_DATE],
      params.data[Const.MAIN_COL.CREDIT],
      crdRows,
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
   * 行データを初期化する
   * @param rows
   * @param crdRows
   * @returns 初期化後の行データ
   */
  override readonly getRows = (rows: Row[], crdRows: Row[]): Row[] => {
    const datas = structuredClone(rows);
    for (const data of datas) {
      // 支払日
      data[Const.MAIN_COL.PAY_DATE] = Util.getPayDate(
        data[Const.MAIN_COL.USE_DATE],
        data[Const.MAIN_COL.CREDIT],
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
    const today = Util.getDate();

    for (const row of rows) {
      const num = row?.[Const.MAIN_COL.AMOUNT_NUM];
      if (
        !row ||
        !Util.checkInputMode(row, Const.INPUT_MODE.ALL_REQ) ||
        !Util.isValidInt(num)
      ) {
        continue;
      }

      const payDate = Util.getPayDate(
        row[Const.MAIN_COL.USE_DATE],
        row[Const.MAIN_COL.CREDIT],
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
   * @param rows
   * @returns
   */
  override readonly calcSelStatus = (rows: Row[]): MoneyStatus[] => {
    const labels = ['Cnt', 'Sum', 'Inc', 'Exp'];
    const status = labels.map((label) => ({ label, amount: 0 }));
    // 収支計算
    for (const data of rows) {
      const num = Number(data[Const.MAIN_COL.AMOUNT_NUM]);
      if (!Util.isValidInt(num)) {
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
      value: !idx ? rows.length.toString() : Util.cvtNumToPrice(st.amount),
    }));
  };

  /**
   * ダイアログ入力データ作成
   * @param edtRows
   * @param tbl
   * @param tblMap
   * @param option
   * @returns 入力データ
   */
  override readonly createInputData = (
    edtRows: Row[],
    tbl: Tbl,
    tblMap: TblMap,
    option: InputOption,
  ): DialogInput => {
    switch (option.type) {
      // 置換
      case INPUT_OPTION_TYPE.REPLACE:
        return this.createInputDataRep(edtRows, tbl);
      // 連番付与
      case INPUT_OPTION_TYPE.SERIAL_NUM:
        return this.createInputDataSerialNum(edtRows, tbl);
      // まとめて更新
      case INPUT_OPTION_TYPE.UPDATE:
        return this.createInputDataUpd(edtRows, tbl, tblMap, option);
      // デフォルト
      default:
        return this.createInputDataDef(edtRows, tbl, tblMap, option);
    }
  };

  /**
   * ダイアログ入力データ作成(デフォルト)
   * @param edtRows
   * @param tbl
   * @param tblMap
   * @param option
   * @returns 入力データ
   */
  private readonly createInputDataDef = (
    edtRows: Row[],
    tbl: Tbl,
    tblMap: TblMap,
    option: InputOption,
  ): DialogInput => {
    /*************************
     * ボタンオプションの設定
     *************************/
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

    /*************************
     * セレクトボックスの設定
     *************************/
    const selRec = {} as Record<
      MainCol,
      { disabled: boolean; options: SelectOption[] }
    >;
    for (const [key, col] of Object.entries(OTHER_COL_LIST)) {
      const tblKey = key as Tbl;
      // セレクトボックスの一致項目が無効化されている場合 true を設定
      const disabled = tblMap[tblKey].some(
        (row) =>
          row[Const.CMN_COL.ID] === edtRows[0][col] &&
          !row[Const.CMN_COL.VALID],
      );
      // セレクトボックスの中身を設定
      const options = tblMap[tblKey]
        .filter((row) => {
          if (disabled) {
            // 非活性の場合
            return !!row[Const.CMN_COL.LABEL];
          }
          // 上記以外
          return !!row[Const.CMN_COL.LABEL] && !!row[Const.CMN_COL.VALID];
        })
        .map((row) => ({
          id: row[Const.CMN_COL.ID]!.toString(),
          lb: row[Const.CMN_COL.LABEL]!.toString(),
        }));
      // セレクトボックス情報を設定
      selRec[col] = { disabled, options };
    }

    /*************************
     * オートコンプリートメモデータの設定
     *************************/
    const autocompMemoData: SelectOption[] = [];
    const optLabelSet: Set<string> = new Set();
    const reverseMainRows = tblMap[tbl].toReversed();
    for (const row of reverseMainRows) {
      if (
        row[Const.CMN_COL.ID] === edtRows[0][Const.CMN_COL.ID] ||
        !row[Const.MAIN_COL.MEMO]
      ) {
        // 編集対象、またはメモが空欄の場合、オートコンプリートに追加しない
        continue;
      }

      const storageId = row[Const.MAIN_COL.STORAGE]?.toString() ?? '';
      const storage =
        tblMap[Const.TBL.STORAGE]
          .find((dt) => dt[Const.CMN_COL.ID] === storageId)
          ?.[Const.CMN_COL.LABEL]?.toString() ?? '';
      const value = row[Const.MAIN_COL.MEMO]?.toString() ?? '';
      const label = value + (!!storage ? `　${storage}` : '');

      if (!!label && !optLabelSet.has(label)) {
        optLabelSet.add(label);
        autocompMemoData.push({
          id: row[Const.CMN_COL.ID]?.toString() ?? '',
          value,
          lb: label,
        });
      }
    }

    /*************************
     * 各setterの設定
     *************************/
    // 支払日 setter
    const payDateSetter = (form: FormRecord): void => {
      const useDate = form.get(Const.MAIN_COL.USE_DATE)?.value;
      const credit = form.get(Const.MAIN_COL.CREDIT)?.value;

      let val = '';
      if (useDate !== undefined && credit !== undefined) {
        val = Util.getPayDate(useDate, credit, tblMap[Const.TBL.CREDIT]);
      }

      form.get(Const.MAIN_COL.PAY_DATE)?.setValue(val);
    };

    // 計算結果 setter
    const calcResultSetter = (form: FormRecord): void => {
      const amount = form.get(Const.MAIN_COL.AMOUNT)?.value;
      const val = Util.cvtNumToPrice(Util.calcResult(amount));

      form.get(DIALOG_INPUT_ID.CALC_RESULT)?.setValue(val);
    };

    // メモ setter
    const memoSetter = (
      form: FormRecord,
      _: Required<DialogInput>,
      options?: { type: SetType; option: SelectOption },
    ): void => {
      if (options?.type === 'select') {
        // オートコンプリートで選択した場合
        const data = reverseMainRows.find(
          (dt) => dt[Const.CMN_COL.ID] === options.option.id,
        );
        if (!data) {
          // 選択したメモが空の場合
          return;
        }

        const checkKeys = [
          Const.MAIN_COL.STORAGE,
          Const.MAIN_COL.CREDIT,
          Const.MAIN_COL.ITEM,
          Const.MAIN_COL.REMARK,
          Const.MAIN_COL.COLOR,
        ];
        if (
          checkKeys.some(
            (key) => form.get(key)?.value !== Util.getTblDefVal(tbl, key),
          )
        ) {
          // 初期値でない入力値が1箇所でもある場合
          return;
        }

        const keys = [
          Const.MAIN_COL.AMOUNT,
          Const.MAIN_COL.STORAGE,
          Const.MAIN_COL.CREDIT,
          Const.MAIN_COL.ITEM,
          Const.MAIN_COL.REMARK,
          Const.MAIN_COL.COLOR,
        ];
        for (const key of keys) {
          if (key === Const.MAIN_COL.AMOUNT && !!form.get(key)?.value) {
            // 金額の入力値が既にある場合
            continue;
          }
          form.get(key)?.setValue(data[key]);
        }

        const dateKeys = [Const.MAIN_COL.DATE, Const.MAIN_COL.USE_DATE];
        if (dateKeys.some((key) => !!form.get(key)?.value)) {
          // 日付/利用日のどちらかが入力済の場合
          return;
        }
        for (const key of dateKeys) {
          form.get(key)?.setValue(data[key]);
        }
      }
    };

    /*************************
     * 初期表示データの設定
     *************************/
    // 日付 初期表示
    const initDate = (id: string) => {
      if (Util.checkInputMode(edtRows[0], Const.INPUT_MODE.NONE)) {
        return Util.getDate();
      }
      return edtRows[0][id];
    };

    /*************************
     * 入力データの設定
     *************************/
    const initValues = Util.getTblDefRow(tbl);
    const datas: DialogInputDatas = [
      [
        {
          id: Const.MAIN_COL.DATE,
          label: 'Date',
          value: initDate(Const.MAIN_COL.DATE),
          type: Const.INPUT_TYPE.DATE,
          initValue: initValues[Const.MAIN_COL.DATE],
        },
        {
          id: Const.MAIN_COL.USE_DATE,
          label: 'Use Date',
          value: initDate(Const.MAIN_COL.USE_DATE),
          type: Const.INPUT_TYPE.DATE,
          initValue: initValues[Const.MAIN_COL.USE_DATE],
          setter: payDateSetter,
        },
      ],
      {
        id: Const.MAIN_COL.PAY_DATE,
        label: 'Pay Date',
        value: edtRows[0][Const.MAIN_COL.PAY_DATE],
        type: Const.INPUT_TYPE.DATE,
        disabled: true,
        initValue: initValues[Const.MAIN_COL.PAY_DATE],
      },
      [
        {
          id: Const.MAIN_COL.AMOUNT,
          label: 'Amount',
          value: edtRows[0][Const.MAIN_COL.AMOUNT],
          initValue: initValues[Const.MAIN_COL.AMOUNT],
          placeholder: 'Ex. -(200+500)',
          forbiddenChars: [Const.INPUT_CHARS.FORMULA_FORBIDDEN],
          setter: calcResultSetter,
        },
        {
          // 計算結果表示用
          id: DIALOG_INPUT_ID.CALC_RESULT,
          label: 'Calc Result',
          value: Util.cvtNumToPrice(
            Util.calcResult(edtRows[0][Const.MAIN_COL.AMOUNT]),
          ),
          readonly: true,
          initValue: initValues[Const.MAIN_COL.AMOUNT],
          notReturn: true,
        },
      ],
      {
        id: Const.MAIN_COL.MEMO,
        label: 'Memo',
        value: edtRows[0][Const.MAIN_COL.MEMO],
        type: Const.INPUT_TYPE.TEXTAREA,
        initValue: initValues[Const.MAIN_COL.MEMO],
        placeholder: 'Ex. 夕食代',
        autocomp: true,
        options: autocompMemoData,
        setter: memoSetter,
        style: {
          height: `${24 * 3}px`,
        },
      },
      [
        {
          id: Const.MAIN_COL.STORAGE,
          label: 'Storage',
          value: edtRows[0][Const.MAIN_COL.STORAGE],
          type: Const.INPUT_TYPE.SELECT,
          disabled: selRec[Const.MAIN_COL.STORAGE].disabled,
          options: selRec[Const.MAIN_COL.STORAGE].options,
          initValue: initValues[Const.MAIN_COL.STORAGE],
        },
        {
          id: Const.MAIN_COL.CREDIT,
          label: 'Credit',
          value: edtRows[0][Const.MAIN_COL.CREDIT],
          type: Const.INPUT_TYPE.SELECT,
          disabled: selRec[Const.MAIN_COL.CREDIT].disabled,
          options: selRec[Const.MAIN_COL.CREDIT].options,
          initValue: initValues[Const.MAIN_COL.CREDIT],
          setter: payDateSetter,
        },
      ],
      [
        {
          id: Const.MAIN_COL.ITEM,
          label: 'Item',
          value: edtRows[0][Const.MAIN_COL.ITEM],
          type: Const.INPUT_TYPE.SELECT,
          disabled: selRec[Const.MAIN_COL.ITEM].disabled,
          options: selRec[Const.MAIN_COL.ITEM].options,
          initValue: initValues[Const.MAIN_COL.ITEM],
        },
        {
          id: Const.MAIN_COL.REMARK,
          label: 'Remark',
          value: edtRows[0][Const.MAIN_COL.REMARK],
          type: Const.INPUT_TYPE.SELECT,
          disabled: selRec[Const.MAIN_COL.REMARK].disabled,
          options: selRec[Const.MAIN_COL.REMARK].options,
          initValue: initValues[Const.MAIN_COL.REMARK],
        },
      ],
      {
        id: Const.MAIN_COL.COLOR,
        label: 'Color',
        value: edtRows[0][Const.MAIN_COL.COLOR],
        type: Const.INPUT_TYPE.COLOR,
        initValue: initValues[Const.MAIN_COL.COLOR],
        hide: true, // 利用することがないため非表示にする
      },
    ];

    /*************************
     * バリデーションチェック用コールバックの設定
     *************************/
    let validatorFn:
      | ((
          control: AbstractControl,
          datas: DialogInputDatas,
        ) => ValidationErrors)
      | null;
    if (option.edtPastData) {
      // 過去データが編集可能である場合
      validatorFn = null;
    } else {
      // 過去データが編集可能でない場合
      const initPayDate = edtRows[0][Const.MAIN_COL.PAY_DATE];
      if (!!initPayDate && initPayDate < Util.getDate()) {
        // 支払日が過去の場合
        validatorFn = (control: AbstractControl): ValidationErrors => {
          const errors: ValidationErrors = {};
          const payDate = control.get(Const.MAIN_COL.PAY_DATE)?.value;
          const today = Util.getDate();

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
          datas: DialogInputDatas,
        ): ValidationErrors => {
          const errors: ValidationErrors = {};
          const payDate = control.get(Const.MAIN_COL.PAY_DATE)?.value;
          const today = Util.getDate();
          const checkInvalid = (data: DialogInputData) =>
            !data.hide && control.get(data.id)?.invalid;

          if (
            datas.some((data) =>
              Array.isArray(data)
                ? data.some(checkInvalid)
                : checkInvalid(data),
            )
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
      title: Util.getTblName(tbl),
      datas,
      buttonOptions,
      validatorFn,
    };
  };

  /**
   * ダイアログ入力データ作成(置換時)
   * @param edtRows
   * @param tbl
   * @returns 入力データ
   */
  private readonly createInputDataRep = (
    edtRows: Row[],
    tbl: Tbl,
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
    const replacePreviewValue = this.getRowsReplacedMemo(edtRows, '', '')
      .map((row) => row[Const.MAIN_COL.MEMO])
      .join('\n');
    const previewSetter = (form: FormRecord<FormCtrl>): void => {
      const target =
        form.get(DIALOG_INPUT_ID.TARGET_STRING)?.value?.toString() ?? '';
      const replace =
        form.get(DIALOG_INPUT_ID.REPLACE_CHAR)?.value?.toString() ?? '';

      const val = this.getRowsReplacedMemo(edtRows, target, replace)
        .map((row) => row[Const.MAIN_COL.MEMO])
        .join('\n');
      form.get(DIALOG_INPUT_ID.AFTER_REPLACE)?.setValue(val);
    };
    // 入力データ
    const datas: DialogInputDatas = [
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
    return {
      title: Util.getTblName(tbl) + ' Replace',
      datas,
      buttonOptions,
    };
  };

  /**
   * ダイアログ入力データ作成(連番付与時)
   * @param edtRows
   * @param tbl
   * @returns 入力データ
   */
  private readonly createInputDataSerialNum = (
    edtRows: Row[],
    tbl: Tbl,
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
    const previewValue = edtRows
      .map((row) => row[Const.MAIN_COL.MEMO])
      .join('\n');

    const previewSetter = (
      form: FormRecord<FormCtrl>,
      input: Required<DialogInput>,
    ): void => {
      const targetDataIds = [
        DIALOG_INPUT_ID.SERIAL_NUM_INIT,
        DIALOG_INPUT_ID.DATE_FORMAT,
        DIALOG_INPUT_ID.SERIAL_DATE_INIT,
        DIALOG_INPUT_ID.SERIAL_DATE_FREQ,
        DIALOG_INPUT_ID.SERIAL_DATE_FREQ_NUM,
      ];
      const [
        memo,
        serialNumInit,
        serialDateFormat,
        serialDateInit,
        serialDateFreq,
        serialDateFreqNum,
      ] = [Const.MAIN_COL.MEMO, ...targetDataIds].map(
        (id) => form.get(id)?.value?.toString() ?? '',
      );

      // 入力内容によって、表示項目を制御
      const inputDatas: DialogInputData[] = [...new Array(5)].fill({
        id: '',
      });
      for (const data of input.datas) {
        if (Array.isArray(data)) {
          for (const child of data) {
            const targetDataIdx = targetDataIds.findIndex(
              (id) => id === child.id,
            );
            if (targetDataIdx >= 0) {
              inputDatas[targetDataIdx] = child;
            }
          }
        } else {
          const targetDataIdx = targetDataIds.findIndex((id) => id === data.id);
          if (targetDataIdx >= 0) {
            inputDatas[targetDataIdx] = data;
          }
        }
      }
      const [
        inputSerialNumInit,
        inputSerialDateFormat,
        inputSerialDateInit,
        inputSerialDateFreq,
        inputSerialDateFreqNum,
      ] = inputDatas;

      if (memo.includes(Const.RESERVED_STR.SERIAL_NUM)) {
        // 連番あり
        inputSerialNumInit.hide = false;
      } else {
        // 連番なし
        inputSerialNumInit.hide = true;
      }
      if (memo.includes(Const.RESERVED_STR.SERIAL_DATE)) {
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
      const val = this.getRowsSerialNum(
        edtRows,
        memo,
        serialNumInit,
        serialDateFormat,
        serialDateInit,
        serialDateFreq,
        serialDateFreqNum,
      )
        .map((row) => row[Const.MAIN_COL.MEMO])
        .join('\n');
      form.get(DIALOG_INPUT_ID.AFTER_REPLACE)?.setValue(val);
    };
    // 入力データ
    const datas: DialogInputDatas = [
      {
        id: Const.MAIN_COL.MEMO,
        label: 'Memo',
        value: Const.RESERVED_STR.ORG,
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
      [
        {
          id: DIALOG_INPUT_ID.DATE_FORMAT,
          label: 'Serial Date Format',
          value: Const.DATE_FMT.YYYY_MM,
          initValue: Const.DATE_FMT.YYYY_MM,
          type: Const.INPUT_TYPE.SELECT,
          options: Const.SERIAL_DATE_FMT_LIST,
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
      ],
      [
        {
          id: DIALOG_INPUT_ID.SERIAL_DATE_FREQ,
          label: 'Serial Date Freq',
          value: Const.DATE_FMT.YYYY_MM,
          initValue: Const.DATE_FMT.YYYY_MM,
          type: Const.INPUT_TYPE.SELECT,
          options: Const.SERIAL_DATE_FMT_LIST,
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
      ],
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
    return {
      title: Util.getTblName(tbl) + ' Serial Number',
      datas,
      buttonOptions,
      invalidReservedWord: true, // 予約語無効
    };
  };

  private readonly getRowsReplacedMemo = (
    rows: Row[],
    target: string,
    replace: string,
  ): Row[] => {
    rows = structuredClone(rows);
    const targetRegExp = new RegExp(target, 'g');
    for (const row of rows) {
      row[Const.MAIN_COL.MEMO] =
        row[Const.MAIN_COL.MEMO]?.toString().replace(targetRegExp, replace) ??
        null;
    }
    return rows;
  };

  private readonly getRowsSerialNum = (
    rows: Row[],
    memo: string,
    numInit: string,
    dateFormat: string,
    dateInit: string,
    dateFreq: string,
    dateFreqNumStr: string,
  ): Row[] => {
    rows = structuredClone(rows);
    let serialNum = Number(numInit);
    let serialDate = dateInit;
    let dateFreqNum = Number(dateFreqNumStr);

    for (const row of rows) {
      // 連番
      const serialNumStr = serialNum.toString();
      serialNum++;
      // 日付連番
      let serialDateStr = '';
      if (!!serialDate) {
        serialDateStr = Util.getDate(serialDate, dateFormat || undefined);
      } else {
        serialDateStr = '';
      }
      if (!!serialDate) {
        let date = new Date(serialDate);
        if (dateFreq === Const.DATE_FMT.YYYY) {
          date = DateUtil.addYears(serialDate, dateFreqNum);
        } else if (dateFreq === Const.DATE_FMT.YYYY_MM) {
          date = DateUtil.addMonths(serialDate, dateFreqNum);
        } else if (dateFreq === Const.DATE_FMT.YY_MM_DD) {
          date = DateUtil.addDays(serialDate, dateFreqNum);
        }
        serialDate = Util.getDate(date);
      }

      // 連番付与
      const [originalRegExp, serialNumRegExp, serialDateRegExp] = [
        Const.RESERVED_STR.ORG,
        Const.RESERVED_STR.SERIAL_NUM,
        Const.RESERVED_STR.SERIAL_DATE,
      ].map((str) => new RegExp(str, 'g'));
      row[Const.MAIN_COL.MEMO] = memo
        // オリジナルのメモ内容を反映
        .replace(originalRegExp, row[Const.MAIN_COL.MEMO]?.toString() ?? '')
        // 連番情報を反映
        .replace(serialNumRegExp, serialNumStr)
        // 日付連番情報を反映
        .replace(serialDateRegExp, serialDateStr)
        // 予約語を除去
        .replace(Const.RESERVED_WORD, '');
    }

    return rows;
  };

  /**
   * ダイアログ入力データ作成(更新時)
   * @param edtRows
   * @param tbl
   * @param tblMap
   * @param option
   * @returns 入力データ
   */
  private readonly createInputDataUpd = (
    edtRows: Row[],
    tbl: Tbl,
    tblMap: TblMap,
    option: InputOption,
  ): DialogInput => {
    /*************************
     * ボタンオプションの設定
     *************************/
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
        id: DIALOG_BUTTON.CLEAR,
      },
      {
        id: DIALOG_BUTTON.RESET,
      },
      {
        id: DIALOG_BUTTON.OK,
      },
    ];

    /******************************
     * 全行データの各項目の一致確認
     ******************************/
    const matchInfRec: Record<string, { match: boolean; val: ValType }> = {};
    const firstRowEntries = Object.entries(edtRows[0]);
    for (const [key, val] of firstRowEntries) {
      matchInfRec[key] = { match: false, val: '' };
      matchInfRec[key].match = edtRows.every((data) => data[key] === val);
      matchInfRec[key].val = matchInfRec[key].match ? edtRows[0][key] : '';
    }

    /*************************
     * セレクトボックスの設定
     *************************/
    const selRec = {} as Record<
      MainCol,
      { disabled: boolean; options: SelectOption[] }
    >;
    for (const [key, col] of Object.entries(OTHER_COL_LIST)) {
      const tblKey = key as Tbl;
      // セレクトボックスの一致項目が無効化されている場合 true を設定
      const disabled = (() => {
        if (matchInfRec[col].match) {
          // 全選択行のセレクトボックスの値が同じ場合
          return false;
        }
        // 上記以外
        return tblMap[tblKey].some(
          (row) =>
            row[Const.CMN_COL.ID] === edtRows[0][col] &&
            !row[Const.CMN_COL.VALID],
        );
      })();
      // セレクトボックスの中身を設定
      const options = tblMap[tblKey]
        .filter((row) => {
          if (disabled) {
            // 非活性の場合
            return !!row[Const.CMN_COL.LABEL];
          }
          // 上記以外
          return !!row[Const.CMN_COL.LABEL] && !!row[Const.CMN_COL.VALID];
        })
        .map((row) => ({
          id: row[Const.CMN_COL.ID]!.toString(),
          lb: row[Const.CMN_COL.LABEL]!.toString(),
        }));
      // セレクトボックス情報を設定
      selRec[col] = { disabled, options };
    }

    /*************************
     * オートコンプリートメモデータの設定
     *************************/
    const autocompMemoData: SelectOption[] = [];
    const optLabelSet: Set<string> = new Set();
    const reverseMainRows = tblMap[tbl].toReversed();
    for (const row of reverseMainRows) {
      if (!row[Const.MAIN_COL.MEMO]) {
        // メモが空欄の場合、オートコンプリートに追加しない
        continue;
      }

      const storageId = row[Const.MAIN_COL.STORAGE]?.toString() ?? '';
      const storage =
        tblMap[Const.TBL.STORAGE]
          .find((dt) => dt[Const.CMN_COL.ID] === storageId)
          ?.[Const.CMN_COL.LABEL]?.toString() ?? '';
      const value = row[Const.MAIN_COL.MEMO]?.toString() ?? '';
      const label = value + (!!storage ? `　${storage}` : '');

      if (!!label && !optLabelSet.has(label)) {
        optLabelSet.add(label);
        autocompMemoData.push({
          id: row[Const.CMN_COL.ID]?.toString() ?? '',
          value,
          lb: label,
        });
      }
    }

    /*************************
     * 各setterの設定
     *************************/
    // 支払日 setter
    const payDateSetter = (form: FormRecord): void => {
      const useDate = form.get(Const.MAIN_COL.USE_DATE)?.value;
      const credit = form.get(Const.MAIN_COL.CREDIT)?.value;

      let val = '';
      if (useDate !== undefined && credit !== undefined) {
        val = Util.getPayDate(useDate, credit, tblMap[Const.TBL.CREDIT]);
      }

      form.get(Const.MAIN_COL.PAY_DATE)?.setValue(val);
    };

    // 計算結果 setter
    const calcResultSetter = (form: FormRecord): void => {
      const amount = form.get(Const.MAIN_COL.AMOUNT)?.value;
      const val = Util.cvtNumToPrice(Util.calcResult(amount));

      form.get(DIALOG_INPUT_ID.CALC_RESULT)?.setValue(val);
    };

    // チェックボックス setter
    const checkSetter =
      (id: string) =>
      (form: FormRecord): void => {
        if (!!form.get(id + CHECK_ID)?.get('1')?.value) {
          form.get(id)?.disable();
          if (id === Const.MAIN_COL.AMOUNT) {
            // Amountの場合、計算後の値も非活性にする
            form.get(DIALOG_INPUT_ID.CALC_RESULT)?.disable();
          }
        } else {
          form.get(id)?.enable();
          if (id === Const.MAIN_COL.AMOUNT) {
            // Amountの場合、計算後の値も活性にする
            form.get(DIALOG_INPUT_ID.CALC_RESULT)?.enable();
          }
        }
      };

    /*************************
     * チェックボックス項目の設定
     *************************/
    const checkData = (id: string) => ({
      id: id + CHECK_ID,
      value: ['1'],
      type: Const.INPUT_TYPE.CHECK,
      options: [{ id: '1', lb: '' }],
      setter: checkSetter(id),
      formStyle: { width: '40px' },
    });

    /*************************
     * 入力データの設定
     *************************/
    const initValues = Util.getTblDefRow(tbl);
    const datas: DialogInputDatas = [
      [
        {
          id: Const.MAIN_COL.DATE,
          label: 'Date',
          value: matchInfRec[Const.MAIN_COL.DATE].val,
          type: Const.INPUT_TYPE.DATE,
          initValue: initValues[Const.MAIN_COL.DATE],
          formStyle: { width: 'calc(100% - 45px)' },
        },
        checkData(Const.MAIN_COL.DATE),
      ],
      [
        {
          id: Const.MAIN_COL.USE_DATE,
          label: 'Use Date',
          value: matchInfRec[Const.MAIN_COL.USE_DATE].val,
          type: Const.INPUT_TYPE.DATE,
          initValue: initValues[Const.MAIN_COL.USE_DATE],
          setter: payDateSetter,
          formStyle: { width: 'calc(100% - 45px)' },
        },
        checkData(Const.MAIN_COL.USE_DATE),
      ],
      {
        id: Const.MAIN_COL.PAY_DATE,
        label: 'Pay Date',
        value: matchInfRec[Const.MAIN_COL.PAY_DATE].val,
        type: Const.INPUT_TYPE.DATE,
        disabled: true,
        initValue: initValues[Const.MAIN_COL.PAY_DATE],
        formStyle: { width: 'calc(100% - 45px)' },
      },
      [
        {
          id: Const.MAIN_COL.AMOUNT,
          label: 'Amount',
          value: matchInfRec[Const.MAIN_COL.AMOUNT].val,
          initValue: initValues[Const.MAIN_COL.AMOUNT],
          placeholder: 'Ex. -(200+500)',
          forbiddenChars: [Const.INPUT_CHARS.FORMULA_FORBIDDEN],
          setter: calcResultSetter,
          formStyle: { width: 'calc((100% - 45px) / 2)' },
        },
        {
          // 計算結果表示用
          id: DIALOG_INPUT_ID.CALC_RESULT,
          label: 'Calc Result',
          value: Util.cvtNumToPrice(
            Util.calcResult(matchInfRec[Const.MAIN_COL.AMOUNT].val),
          ),
          readonly: true,
          initValue: initValues[Const.MAIN_COL.AMOUNT],
          notReturn: true,
          formStyle: { width: 'calc((100% - 45px) / 2)' },
        },
        checkData(Const.MAIN_COL.AMOUNT),
      ],
      [
        {
          id: Const.MAIN_COL.MEMO,
          label: 'Memo',
          value: matchInfRec[Const.MAIN_COL.MEMO].val,
          type: Const.INPUT_TYPE.TEXTAREA,
          initValue: initValues[Const.MAIN_COL.MEMO],
          placeholder: 'Ex. 夕食代',
          autocomp: true,
          options: autocompMemoData,
          style: {
            height: `${24 * 3}px`,
          },
          formStyle: { width: 'calc(100% - 45px)' },
        },
        checkData(Const.MAIN_COL.MEMO),
      ],
      [
        {
          id: Const.MAIN_COL.STORAGE,
          label: 'Storage',
          value: matchInfRec[Const.MAIN_COL.STORAGE].val,
          required: true,
          type: Const.INPUT_TYPE.SELECT,
          disabled: selRec[Const.MAIN_COL.STORAGE].disabled,
          options: selRec[Const.MAIN_COL.STORAGE].options,
          initValue: initValues[Const.MAIN_COL.STORAGE],
          formStyle: { width: 'calc((100% - 90px) / 2)' },
        },
        checkData(Const.MAIN_COL.STORAGE),
        {
          id: Const.MAIN_COL.CREDIT,
          label: 'Credit',
          value: matchInfRec[Const.MAIN_COL.CREDIT].val,
          required: true,
          type: Const.INPUT_TYPE.SELECT,
          disabled: selRec[Const.MAIN_COL.CREDIT].disabled,
          options: selRec[Const.MAIN_COL.CREDIT].options,
          initValue: initValues[Const.MAIN_COL.CREDIT],
          setter: payDateSetter,
          formStyle: { width: 'calc((100% - 90px) / 2)' },
        },
        checkData(Const.MAIN_COL.CREDIT),
      ],
      [
        {
          id: Const.MAIN_COL.ITEM,
          label: 'Item',
          value: matchInfRec[Const.MAIN_COL.ITEM].val,
          required: true,
          type: Const.INPUT_TYPE.SELECT,
          disabled: selRec[Const.MAIN_COL.ITEM].disabled,
          options: selRec[Const.MAIN_COL.ITEM].options,
          initValue: initValues[Const.MAIN_COL.ITEM],
          formStyle: { width: 'calc((100% - 90px) / 2)' },
        },
        checkData(Const.MAIN_COL.ITEM),
        {
          id: Const.MAIN_COL.REMARK,
          label: 'Remark',
          value: matchInfRec[Const.MAIN_COL.REMARK].val,
          required: true,
          type: Const.INPUT_TYPE.SELECT,
          disabled: selRec[Const.MAIN_COL.REMARK].disabled,
          options: selRec[Const.MAIN_COL.REMARK].options,
          initValue: initValues[Const.MAIN_COL.REMARK],
          formStyle: { width: 'calc((100% - 90px) / 2)' },
        },
        checkData(Const.MAIN_COL.REMARK),
      ],
    ];

    /*************************
     * バリデーションチェック用コールバックの設定
     *************************/
    const validatorFn = (control: AbstractControl): ValidationErrors => {
      const errors: ValidationErrors = {};
      const checkKeys = Object.keys(control.value).filter((key) =>
        key.endsWith(CHECK_ID),
      );

      if (checkKeys.every((key) => !!control.get(key)?.get('1')?.value)) {
        // チェックボックスが全て選択されている場合
        errors[DIALOG_BUTTON.OK] = true;
      }

      return errors;
    };

    return {
      title: Util.getTblName(tbl),
      datas,
      buttonOptions,
      validatorFn,
    };
  };

  /**
   * 入力項目反映(行編集Emitterデータ作成)
   * @param edtRows
   * @param outDatas
   * @param option
   * @returns 行データ項目追加後データ
   */
  protected override readonly reflectRows = (
    edtRows: Row[],
    outDatas: DialogOutputData[],
    option: InputOption,
  ): Row[] => {
    switch (option.type) {
      // 置換時
      case INPUT_OPTION_TYPE.REPLACE:
        const [target, replace] = [
          DIALOG_INPUT_ID.TARGET_STRING,
          DIALOG_INPUT_ID.REPLACE_CHAR,
        ].map(
          (id) =>
            outDatas.find((data) => data.id === id)?.value?.toString() ?? '',
        );
        return this.getRowsReplacedMemo(edtRows, target, replace);
      // 連番付与時
      case INPUT_OPTION_TYPE.SERIAL_NUM:
        const [
          memo,
          serialNumInit,
          serialDateFormat,
          serialDateInit,
          serialDateFreq,
          serialDateFreqNum,
        ] = [
          Const.MAIN_COL.MEMO,
          DIALOG_INPUT_ID.SERIAL_NUM_INIT,
          DIALOG_INPUT_ID.DATE_FORMAT,
          DIALOG_INPUT_ID.SERIAL_DATE_INIT,
          DIALOG_INPUT_ID.SERIAL_DATE_FREQ,
          DIALOG_INPUT_ID.SERIAL_DATE_FREQ_NUM,
        ].map(
          (id) =>
            outDatas.find((data) => data.id === id)?.value?.toString() ?? '',
        );
        return this.getRowsSerialNum(
          edtRows,
          memo,
          serialNumInit,
          serialDateFormat,
          serialDateInit,
          serialDateFreq,
          serialDateFreqNum,
        );
      // 更新時
      case INPUT_OPTION_TYPE.UPDATE:
        const checkDatas = outDatas.filter(({ id }) => id.endsWith(CHECK_ID));
        const targetDatas = outDatas.filter(({ id }) => {
          if (id.endsWith(CHECK_ID)) {
            // チェックボックスの場合
            return false;
          }

          const data = checkDatas.find((check) => check.id === id + CHECK_ID);
          if (!!data) {
            // チェックボックスに紐づく入力項目の場合
            return data.value?.toString().length === 0;
          } else {
            // 上記以外の項目の場合
            return true;
          }
        });

        const newDatasUpd = structuredClone(edtRows);
        for (const newData of newDatasUpd) {
          for (const { id, value } of targetDatas) {
            newData[id] = value;
          }

          // 金額(数値)設定
          newData[Const.MAIN_COL.AMOUNT_NUM] = Util.calcResult(
            newData[Const.MAIN_COL.AMOUNT],
          );
          // 日付を設定
          if (!newData[Const.MAIN_COL.DATE]) {
            newData[Const.MAIN_COL.DATE] = newData[Const.MAIN_COL.USE_DATE];
          }
        }

        return newDatasUpd;
      // デフォルト
      default:
        const newDatasDef = this.reflectRowsDef(edtRows, outDatas);
        // 金額(数値)設定
        newDatasDef[0][Const.MAIN_COL.AMOUNT_NUM] = Util.calcResult(
          newDatasDef[0][Const.MAIN_COL.AMOUNT],
        );
        // 日付を設定
        if (!newDatasDef[0][Const.MAIN_COL.DATE]) {
          newDatasDef[0][Const.MAIN_COL.DATE] =
            newDatasDef[0][Const.MAIN_COL.USE_DATE];
        }
        return newDatasDef;
    }
  };

  /**
   * 更新・追加・削除以外のステータス返却時の処理(行編集Emitterデータ作成)
   * @param status
   * @param edtRows
   * @param tbl
   * @param tblMap
   * @param rowIds
   * @returns
   */
  protected override readonly getRowEdts = (
    status: DialogStatus,
    edtRows: Row[],
    tbl: Tbl,
    tblMap: TblMap,
    rowIds = new Set<ValType>(),
  ): RowEdt[] => {
    const rowEdt: RowEdt[] = [];
    if (status === DIALOG_STATUS.MOVE) {
      // moveデータを更新
      rowEdt.push(Util.getRowEdtUpd(tbl, edtRows));

      // moveの相方を探す
      const memo = edtRows[0][Const.MAIN_COL.MEMO] as string;
      const amtNum = Number(edtRows[0][Const.MAIN_COL.AMOUNT_NUM]);
      const findRow = tblMap[tbl].findLast((row) => {
        const num = Number(row[Const.MAIN_COL.AMOUNT_NUM]);
        return (
          // メモが一致、かつ、金額の正負が逆になっている場合
          row[Const.MAIN_COL.MEMO]?.toString().includes(memo) &&
          ((amtNum > 0 && num < 0) || (amtNum < 0 && num > 0))
        );
      });

      // 追加データ
      const addRows = [
        {
          ...edtRows[0],
          [Const.MAIN_COL.AMOUNT]: (-amtNum).toString(),
          [Const.MAIN_COL.AMOUNT_NUM]: -amtNum,
          [Const.MAIN_COL.STORAGE]:
            findRow?.[Const.MAIN_COL.STORAGE] ??
            Util.getTblDefVal(tbl, Const.MAIN_COL.STORAGE),
          [Const.MAIN_COL.CREDIT]:
            findRow?.[Const.MAIN_COL.CREDIT] ??
            Util.getTblDefVal(tbl, Const.MAIN_COL.CREDIT),
        },
      ];

      // moveの相方データを追加
      rowEdt.push(Util.getRowEdtAdd(tbl, addRows, [], rowIds));
    }
    return [...rowEdt];
  };
}
