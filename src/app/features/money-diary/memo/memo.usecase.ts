import { Injectable } from '@angular/core';
import { AbstractControl, FormRecord, ValidationErrors } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { Row, TblMap } from 'src/app/domain/row-data';
import { MoneyDiaryBaseUsecase } from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { FormCtrl, RowEdt, Tbl, ValType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import * as Dialog from 'src/app/shared/dialog-input/dialog-input.component';
import {
  DIALOG_BUTTON,
  DialogInput,
  DialogInputButtonOption,
  DialogInputDatas,
  DialogOutputData,
  DialogStatus,
} from 'src/app/shared/dialog-input/dialog-input.component';

const DSP_COLS = {
  DATE: 'dt',
  AMOUNT: 'am',
  STATUS: 'st',
  // COMPLETE_DATE: 'cd',
} as const;
type DspCols = (typeof DSP_COLS)[keyof typeof DSP_COLS];
const DSP_COLS_LIST = [
  { id: DSP_COLS.DATE, lb: 'Date' },
  { id: DSP_COLS.AMOUNT, lb: 'Amount' },
  { id: DSP_COLS.STATUS, lb: 'Status' },
  // { id: DSP_COLS.COMPLETE_DATE, lb: 'Complete Date' },
] as const satisfies { id: DspCols; lb: string }[];

export type InputOptionType =
  (typeof Const.MEMO_MODE)[keyof typeof Const.MEMO_MODE];
export type InputOption = {
  type: InputOptionType;
  fltKey: string;
};

const DIALOG_INPUT_ID = {
  CALC_RESULT: 'calcResult',
} as const;

const DIALOG_STATUS = {
  ...Dialog.DIALOG_STATUS,
  DEL_PLUS: 'plusDel',
} as const;

@Injectable()
export class MemoUsecase extends MoneyDiaryBaseUsecase {
  /**
   * 列定義を返却する
   * @returns 列定義
   */
  override readonly getColDefs = (rows: Row[]): ColDef<Row, ValType>[] => [
    ...this.addCmnColDefs([
      {
        headerName: 'Label',
        field: Const.MEM_COL.LABEL,
        cellEditor: 'agTextCellEditor',
        rowDrag: true,
        filter: false,
        flex: 2,
        cellStyle: Util.getCellCmnStyle,
      },
      {
        headerName: 'Display Columns',
        field: Const.MEM_COL.DISPLAY_COLUMNS,
        cellEditor: 'agTextCellEditor',
        hide: true,
        filter: false,
        valueFormatter: (params) =>
          this.chkboxFormatter(DSP_COLS_LIST, params.value),
        filterValueGetter: (params) =>
          this.chkboxFormatter(
            DSP_COLS_LIST,
            params.getValue(Const.MEM_COL.DISPLAY_COLUMNS),
          ),
      },
      {
        headerName: 'Valid Columns',
        field: Const.MEM_COL.VALID_COLUMNS,
        cellEditor: 'agTextCellEditor',
        hide: true,
        filter: false,
        valueFormatter: (params) =>
          this.chkboxFormatter(DSP_COLS_LIST, params.value),
        filterValueGetter: (params) =>
          this.chkboxFormatter(
            DSP_COLS_LIST,
            params.getValue(Const.MEM_COL.VALID_COLUMNS),
          ),
      },
      {
        headerName: 'Detail Count',
        field: Const.MEM_COL.DETAIL_COUNT,
        type: 'numericCol',
        filter: false,
        flex: 1,
        valueFormatter: (param) => {
          const id = param.data?.[Const.MEM_COL.ID];
          return rows
            .filter(
              (row) =>
                row[Const.MEM_COL.MODE] === Const.MEMO_MODE.DETAIL &&
                row[Const.MEM_COL.LABEL] === id,
            )
            .length.toString();
        },
      },
      {
        headerName: 'Mode',
        field: Const.MEM_COL.MODE,
        cellEditor: 'agTextCellEditor',
        hide: true,
        filter: false,
      },
    ]),
  ];

  /**
   * 列定義を返却する（詳細情報）
   */
  readonly getColDefsDetail = (
    rows: Row[],
    fltKey: string,
  ): ColDef<Row, ValType>[] => {
    const findRow = rows.find((row) => row[Const.MEM_COL.ID] === fltKey);
    const dspChkArr = (findRow?.[Const.MEM_COL.DISPLAY_COLUMNS] ??
      []) as ValType[];

    return [
      ...this.addCmnColDefs([
        {
          headerName: 'Label',
          field: Const.MEM_COL.LABEL,
          cellEditor: 'agTextCellEditor',
          hide: true,
          filter: false,
        },
        {
          headerName: findRow?.[Const.MEM_COL.LABEL]?.toString() ?? '',
          field: Const.MEM_COL.DETAIL,
          cellEditor: 'agLargeTextCellEditor',
          rowDrag: true,
          filter: false,
          flex: 1,
          minWidth: 300,
          cellStyle: Util.getCellCmnStyle,
        },
        {
          headerName: 'Date',
          field: Const.MEM_COL.DATE,
          type: 'dateCol',
          hide: !dspChkArr.includes(DSP_COLS.DATE),
          filter: false,
          width: 110,
          valueFormatter: this.dateFormatter,
        },
        {
          headerName: 'Amount',
          field: Const.MEM_COL.AMOUNT,
          type: 'amountCol',
          cellEditor: 'agTextCellEditor',
          filterValueGetter: `data.${Const.MEM_COL.AMOUNT_NUM}`,
          hide: !dspChkArr.includes(DSP_COLS.AMOUNT),
          filter: false,
          width: 110,
          valueFormatter: (params) =>
            Util.cvtNumToPrice(params.data?.[Const.MEM_COL.AMOUNT_NUM]),
          comparator: (_a, _b, nodeA, nodeB) =>
            Util.compAmt(
              nodeA.data?.[Const.MEM_COL.AMOUNT_NUM],
              nodeB.data?.[Const.MEM_COL.AMOUNT_NUM],
            ),
          cellStyle: (params) =>
            Util.getStylePrice(params.data?.[Const.MEM_COL.AMOUNT_NUM]),
        },
        {
          headerName: 'AmountNum',
          field: Const.MEM_COL.AMOUNT_NUM,
          cellEditor: 'agNumberCellEditor',
          hide: true,
          filter: false,
        },
        {
          headerName: 'Status',
          field: Const.MEM_COL.STATUS,
          cellEditor: 'agSelectCellEditor',
          hide: !dspChkArr.includes(DSP_COLS.STATUS),
          filter: false,
          width: 110,
          valueFormatter: (params) =>
            Const.COMP_STATUS_LIST.find((data) => data.id === params.value)
              ?.lb ?? '',
          filterValueGetter: (params) =>
            Const.COMP_STATUS_LIST.find(
              (data) => data.id === params.getValue(Const.MEM_COL.STATUS),
            )?.lb ?? '',
        },
        // {
        //   headerName: 'Complete Date',
        //   field: Const.MEM_COL.COMPLETE_DATE,
        //   type: 'dateCol',
        //   hide: !dspChkArr.includes(DSP_COLS.COMPLETE_DATE),
        //   filter: false,
        //   width: 110,
        //   valueFormatter: this.dateFormatter,
        // },
        {
          headerName: 'Mode',
          field: Const.MEM_COL.MODE,
          cellEditor: 'agTextCellEditor',
          hide: true,
          filter: false,
        },
      ]),
    ];
  };

  /**
   * 行データ取得
   * @param rows
   * @returns 行データ
   */
  override readonly getRows = (rows: Row[]): Row[] => {
    return structuredClone(rows);
  };

  /**
   * ダイアログ入力データ作成
   * @param edtRows
   * @param tbl
   * @param TblMap
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
      // 一覧データ編集
      case Const.MEMO_MODE.LIST:
        return this.createInputDataList(edtRows, tbl, tblMap);
      // 詳細データ編集
      case Const.MEMO_MODE.DETAIL:
        return this.createInputDataDetail(edtRows, tbl, tblMap, option);
      // 上記以外
      default:
        throw new Error('No Create Function');
    }
  };

  /**
   * ダイアログ入力データ作成(一覧データ編集時)
   * @param edtRows
   * @param tbl
   * @param tblMap
   * @returns 入力データ
   */
  private readonly createInputDataList = (
    edtRows: Row[],
    tbl: Tbl,
    tblMap: TblMap,
  ): DialogInput => {
    /*************************
     * ボタンオプションの設定
     *************************/
    const buttonOptions: DialogInputButtonOption[] = [
      {
        id: DIALOG_BUTTON.DEL,
        status: DIALOG_STATUS.DEL_PLUS,
      },
    ];

    /*************************
     * 入力データの設定
     *************************/
    const edtRow = structuredClone(edtRows[0]);
    const defRow = Util.getTblDefRow(tbl);
    const inDatas: DialogInputDatas = [
      {
        id: Const.MEM_COL.LABEL,
        label: 'Label',
        value: edtRow[Const.MEM_COL.LABEL],
        type: Const.INPUT_TYPE.TEXT,
        initValue: defRow[Const.MEM_COL.LABEL],
        required: true,
      },
      {
        id: Const.MEM_COL.DISPLAY_COLUMNS,
        label: 'Display Columns',
        value: edtRow[Const.MEM_COL.DISPLAY_COLUMNS],
        type: Const.INPUT_TYPE.CHECK,
        initValue: defRow[Const.MEM_COL.DISPLAY_COLUMNS],
        options: DSP_COLS_LIST,
      },
      {
        id: Const.MEM_COL.VALID_COLUMNS,
        label: 'Valid Columns',
        value: edtRow[Const.MEM_COL.VALID_COLUMNS],
        type: Const.INPUT_TYPE.CHECK,
        initValue: defRow[Const.MEM_COL.VALID_COLUMNS],
        options: DSP_COLS_LIST,
      },
      {
        id: Const.MEM_COL.VALID,
        label: 'Valid',
        value: edtRow[Const.MEM_COL.VALID],
        type: Const.INPUT_TYPE.TOGGLE,
        initValue: defRow[Const.MEM_COL.VALID],
      },
      {
        id: Const.MEM_COL.UPD_DATE_TIME,
        label: 'Upd Date',
        value: edtRow[Const.MEM_COL.UPD_DATE_TIME],
        initValue: defRow[Const.MEM_COL.UPD_DATE_TIME],
        disabled: true,
      },
      {
        id: Const.MEM_COL.MODE,
        label: 'Mode',
        value: Const.MEMO_MODE.LIST,
        initValue: Const.MEMO_MODE.LIST,
        hide: true,
        disabled: true,
      },
    ];

    /*************************
     * バリデーションチェック用コールバックの設定
     *************************/
    // 非選択行、かつ有効なデータ、かつ一覧のデータを取得
    const labelList = tblMap[tbl]
      .filter(
        (row) =>
          row[Const.MEM_COL.ID] !== edtRow[Const.MEM_COL.ID] &&
          !!row[Const.MEM_COL.LABEL] &&
          row[Const.MEM_COL.MODE] === Const.MEMO_MODE.LIST,
      )
      .map((row) => row[Const.MEM_COL.LABEL]);

    // バリデーションチェック用コールバック関数
    const validatorFn = (control: AbstractControl): ValidationErrors => {
      const errors: ValidationErrors = {};
      const label = control.get(Const.MEM_COL.LABEL)?.value;

      // 他データのラベルと重複している場合、OK/Addボタン非活性
      if (labelList.includes(label)) {
        errors[DIALOG_BUTTON.OK] = true;
        errors[DIALOG_BUTTON.ADD] = true;
      }

      // 選択行のラベルと同じ場合、Addボタン非活性
      if (label === edtRow[Const.MEM_COL.LABEL]) {
        errors[DIALOG_BUTTON.ADD] = true;
      }

      return errors;
    };

    return {
      title: `${Util.getTblName(tbl)} List`,
      datas: inDatas,
      buttonOptions,
      validatorFn,
    };
  };

  /**
   * ダイアログ入力データ作成(詳細データ編集時)
   * @param edtRows
   * @param tbl
   * @param tblMap
   * @param option
   * @returns 入力データ
   */
  private readonly createInputDataDetail = (
    edtRows: Row[],
    tbl: Tbl,
    tblMap: TblMap,
    option: InputOption,
  ): DialogInput => {
    // 入力データ
    const defRow = Util.getTblDefRow(tbl);
    const edtRow = edtRows[0];
    const findRow = tblMap[tbl].find(
      (row) => row[Const.MEM_COL.ID] === option.fltKey,
    );
    const validChkArr = (findRow?.[Const.MEM_COL.VALID_COLUMNS] ??
      []) as ValType[];
    // 計算結果 setter
    const calcResultSetter = (form: FormRecord): void => {
      const amount = form.get(Const.MEM_COL.AMOUNT)?.value;
      const val = Util.cvtNumToPrice(Util.calcResult(amount));

      form.get(DIALOG_INPUT_ID.CALC_RESULT)?.setValue(val);
    };

    const inDatas: DialogInputDatas = [
      {
        id: Const.MEM_COL.LABEL,
        label: 'Label',
        value: option.fltKey,
        hide: true,
        disabled: true,
      },
      {
        id: Const.MEM_COL.DETAIL,
        label: 'Detail',
        value: edtRow[Const.MEM_COL.DETAIL],
        type: Const.INPUT_TYPE.TEXTAREA,
        initValue: defRow[Const.MEM_COL.DETAIL],
        style: { height: 'calc(30vh)' },
        required: true,
      },
      {
        id: Const.MEM_COL.DATE,
        label: 'Date',
        value: edtRow[Const.MEM_COL.DATE] ?? Util.getDate(),
        type: Const.INPUT_TYPE.DATE,
        initValue: defRow[Const.MEM_COL.DATE],
        hide: !validChkArr.includes(DSP_COLS.DATE),
      },
      [
        {
          id: Const.MEM_COL.AMOUNT,
          label: 'Amount',
          value: edtRow[Const.MEM_COL.AMOUNT],
          initValue: defRow[Const.MEM_COL.AMOUNT],
          placeholder: 'Ex. -(200+500)',
          forbiddenChars: [Const.INPUT_CHARS.FORMULA_FORBIDDEN],
          setter: calcResultSetter,
          hide: !validChkArr.includes(DSP_COLS.AMOUNT),
        },
        {
          // 計算結果表示用
          id: DIALOG_INPUT_ID.CALC_RESULT,
          label: 'Calc Result',
          value: Util.cvtNumToPrice(
            Util.calcResult(edtRow[Const.MEM_COL.AMOUNT]),
          ),
          readonly: true,
          initValue: defRow[Const.MEM_COL.AMOUNT],
          notReturn: true,
          hide: !validChkArr.includes(DSP_COLS.AMOUNT),
        },
      ],
      {
        id: Const.MEM_COL.STATUS,
        label: 'Status',
        value: edtRow[Const.MEM_COL.STATUS],
        type: Const.INPUT_TYPE.SELECT,
        options: Const.COMP_STATUS_LIST,
        initValue: defRow[Const.MEM_COL.STATUS],
        hide: !validChkArr.includes(DSP_COLS.STATUS),
        setter: (form: FormRecord<FormCtrl>): void => {
          const status = Number(form.get(Const.MEM_COL.STATUS)?.value);
          const validOffSts = [
            Const.COMP_STATUS.CANCELED,
            Const.COMP_STATUS.CLOSE,
          ] as number[];
          form
            .get(Const.MEM_COL.VALID)
            ?.setValue(!validOffSts.includes(status), {
              emitEvent: false,
            });
        },
      },
      // {
      //   id: Const.MEM_COL.COMPLETE_DATE,
      //   label: 'Complete Date',
      //   value: edtRow[Const.MEM_COL.COMPLETE_DATE],
      //   type: Const.INPUT_TYPE.DATE,
      //   initValue: defRow[Const.MEM_COL.COMPLETE_DATE],
      //   hide: !validChkArr.includes(DSP_COLS.COMPLETE_DATE),
      // },
      {
        id: Const.MEM_COL.VALID,
        label: 'Valid',
        value: edtRow[Const.MEM_COL.VALID],
        type: Const.INPUT_TYPE.TOGGLE,
        initValue: defRow[Const.MEM_COL.VALID],
        hide: true,
      },
      {
        id: Const.MEM_COL.UPD_DATE_TIME,
        label: 'Upd Date',
        value: edtRow[Const.MEM_COL.UPD_DATE_TIME],
        disabled: true,
        initValue: defRow[Const.MEM_COL.UPD_DATE_TIME],
      },
      {
        id: Const.MEM_COL.MODE,
        label: 'Mode',
        value: Const.MEMO_MODE.DETAIL,
        initValue: Const.MEMO_MODE.DETAIL,
        hide: true,
        disabled: true,
      },
    ];

    return {
      title: `${Util.getTblName(tbl)} Detail`,
      datas: inDatas,
      option: { sameDataOk: true },
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
      // 一覧データ編集時
      case Const.MEMO_MODE.LIST:
        return this.reflectRowsDef(edtRows, outDatas);
      // 詳細データ編集時
      case Const.MEMO_MODE.DETAIL:
        const newDatasDef = this.reflectRowsDef(edtRows, outDatas);
        // 金額(数値)設定
        newDatasDef[0][Const.MEM_COL.AMOUNT_NUM] = Util.calcResult(
          newDatasDef[0][Const.MEM_COL.AMOUNT],
        );
        return newDatasDef;
      // デフォルト
      default:
        return [];
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
    if (status === DIALOG_STATUS.DEL_PLUS) {
      // 対象データのID一覧を取得
      const tgtIds = edtRows.map((row) => row[Const.MEM_COL.ID]);
      // 一覧データの削除
      rowEdt.push(Util.getRowEdtDel(tbl, tgtIds, rowIds));
      // 関連する詳細データの取得
      const detailIds = tblMap[tbl]
        .filter(
          (row) =>
            row[Const.MEM_COL.MODE] === Const.MEMO_MODE.DETAIL &&
            tgtIds.includes(row[Const.MEM_COL.LABEL]),
        )
        .map((row) => row[Const.MEM_COL.ID]);
      // 詳細データの削除
      rowEdt.push(Util.getRowEdtDel(tbl, detailIds, rowIds));
    }
    return [...rowEdt];
  };
}
