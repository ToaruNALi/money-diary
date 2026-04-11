import { Injectable, signal } from '@angular/core';
import { disabled, hidden, required } from '@angular/forms/signals';
import { ColDef } from 'ag-grid-community';
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
  DIALOG_OUTPUT_STATUS,
  DialogButton,
  InputItems,
  InputItemSetter,
} from 'src/app/shared/dialog-custom-input/dialog-custom-input.component';
import { INPUT_RESTRICTIONS } from 'src/app/shared/signal-form/signal-form-value.derective';
import { ValType } from 'src/app/shared/signal-form/signal-form.component';
import { calcResult, cvtNumToPrice } from 'src/app/shared/utils/util-formula';
import {
  COMP_STATUS,
  COMP_STATUS_LIST,
  cvtDateToStr,
  getRowEdtDel,
  MEM_COL,
  MEMO_MODE,
  RowEdt,
} from 'src/app/shared/utils/util-row';

const DSP_COLS = {
  DATE: 'dt',
  AMOUNT: 'am',
  STATUS: 'st',
} as const;
type DspCols = (typeof DSP_COLS)[keyof typeof DSP_COLS];
const DSP_COLS_LIST = [
  { value: DSP_COLS.DATE, label: 'Date' },
  { value: DSP_COLS.AMOUNT, label: 'Amount' },
  { value: DSP_COLS.STATUS, label: 'Status' },
] as const satisfies { value: DspCols; label: string }[];

export type InputOptionType = (typeof MEMO_MODE)[keyof typeof MEMO_MODE];
export type InputOption = {
  type: InputOptionType;
  fltKey: string;
};

const DIALOG_STATUS = {
  ...DIALOG_OUTPUT_STATUS,
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
        field: MEM_COL.LABEL,
        cellEditor: 'agTextCellEditor',
        rowDrag: true,
        filter: false,
        flex: 2,
        cellStyle: this.getCellCmnStyle,
      },
      {
        headerName: 'Display Columns',
        field: MEM_COL.DISPLAY_COLUMNS,
        cellEditor: 'agTextCellEditor',
        hide: true,
        filter: false,
        valueFormatter: (params) =>
          this.chkboxFormatter(DSP_COLS_LIST, params.value),
        filterValueGetter: (params) =>
          this.chkboxFormatter(
            DSP_COLS_LIST,
            params.getValue(MEM_COL.DISPLAY_COLUMNS),
          ),
      },
      {
        headerName: 'Valid Columns',
        field: MEM_COL.VALID_COLUMNS,
        cellEditor: 'agTextCellEditor',
        hide: true,
        filter: false,
        valueFormatter: (params) =>
          this.chkboxFormatter(DSP_COLS_LIST, params.value),
        filterValueGetter: (params) =>
          this.chkboxFormatter(
            DSP_COLS_LIST,
            params.getValue(MEM_COL.VALID_COLUMNS),
          ),
      },
      {
        headerName: 'Detail Count',
        field: MEM_COL.DETAIL_COUNT,
        type: 'numericCol',
        filter: false,
        flex: 1,
        comparator: this.compAmt,
        valueFormatter: (param) => {
          const id = param.data?.[MEM_COL.ID];
          return rows
            .filter(
              (row) =>
                row[MEM_COL.MODE] === MEMO_MODE.DETAIL &&
                row[MEM_COL.LABEL] === id,
            )
            .length.toString();
        },
        cellStyle: (params) => this.getStylePrice(params.value),
      },
      {
        headerName: 'Mode',
        field: MEM_COL.MODE,
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
    const findRow = rows.find((row) => row[MEM_COL.ID] === fltKey);
    const dspChkArr = (findRow?.[MEM_COL.DISPLAY_COLUMNS] ?? []) as ValType[];

    return [
      ...this.addCmnColDefs([
        {
          headerName: 'Label',
          field: MEM_COL.LABEL,
          cellEditor: 'agTextCellEditor',
          hide: true,
          filter: false,
        },
        {
          headerName: findRow?.[MEM_COL.LABEL]?.toString() ?? '',
          field: MEM_COL.DETAIL,
          cellEditor: 'agLargeTextCellEditor',
          rowDrag: true,
          filter: false,
          flex: 1,
          minWidth: 300,
          wrapText: true,
          autoHeight: true,
          cellStyle: this.getCellCmnStyle,
        },
        {
          headerName: 'Date',
          field: MEM_COL.DATE,
          type: 'dateCol',
          hide: !dspChkArr.includes(DSP_COLS.DATE),
          filter: false,
          width: 110,
          valueFormatter: this.dateFormatter,
        },
        {
          headerName: 'Amount',
          field: MEM_COL.AMOUNT,
          type: 'amountCol',
          cellEditor: 'agTextCellEditor',
          filterValueGetter: `data.${MEM_COL.AMOUNT_NUM}`,
          hide: !dspChkArr.includes(DSP_COLS.AMOUNT),
          filter: false,
          width: 110,
          valueFormatter: (params) =>
            cvtNumToPrice(params.data?.[MEM_COL.AMOUNT_NUM]),
          comparator: (_a, _b, nodeA, nodeB) =>
            this.compAmt(
              nodeA.data?.[MEM_COL.AMOUNT_NUM],
              nodeB.data?.[MEM_COL.AMOUNT_NUM],
            ),
          cellStyle: (params) =>
            this.getStylePrice(params.data?.[MEM_COL.AMOUNT_NUM]),
        },
        {
          headerName: 'AmountNum',
          field: MEM_COL.AMOUNT_NUM,
          cellEditor: 'agNumberCellEditor',
          hide: true,
          filter: false,
        },
        {
          headerName: 'Status',
          field: MEM_COL.STATUS,
          cellEditor: 'agSelectCellEditor',
          hide: !dspChkArr.includes(DSP_COLS.STATUS),
          filter: false,
          width: 110,
          valueFormatter: (params) =>
            COMP_STATUS_LIST.find((data) => data.value === params.value)
              ?.label ?? '',
          filterValueGetter: (params) =>
            COMP_STATUS_LIST.find(
              (data) => data.value === params.getValue(MEM_COL.STATUS),
            )?.label ?? '',
        },
        {
          headerName: 'Mode',
          field: MEM_COL.MODE,
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
   * @param procInput
   * @returns 入力データ
   */
  protected readonly createDialogInputData = (
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
   * ダイアログ入力データ作成(一覧データ編集時)
   * @param procInput
   * @returns 入力データ
   */
  private readonly createDialogInputDataList = (
    procInput: OpenDialogProcInput,
  ): DialogCustomInputExt => {
    const { selectedRows } = procInput;
    const [selectedRow] = selectedRows;

    /*************************
     * 入力データ
     *************************/
    const data = signal({
      [MEM_COL.LABEL]: selectedRow[MEM_COL.LABEL],
      [MEM_COL.DISPLAY_COLUMNS]: selectedRow[MEM_COL.DISPLAY_COLUMNS],
      [MEM_COL.VALID_COLUMNS]: selectedRow[MEM_COL.VALID_COLUMNS],
      [MEM_COL.VALID]: selectedRow[MEM_COL.VALID],
      [MEM_COL.UPD_DATE_TIME]: selectedRow[MEM_COL.UPD_DATE_TIME],
    });

    /*************************
     * 表示項目
     *************************/
    const items: InputItems = [
      {
        id: MEM_COL.LABEL,
        label: 'Label',
      },
      {
        id: MEM_COL.DISPLAY_COLUMNS,
        label: 'Display Columns',
        type: 'checkbox',
        options: DSP_COLS_LIST,
      },
      {
        id: MEM_COL.VALID_COLUMNS,
        label: 'Valid Columns',
        type: 'checkbox',
        options: DSP_COLS_LIST,
      },
      {
        id: MEM_COL.VALID,
        label: 'Valid',
        type: 'toggle',
      },
      {
        id: MEM_COL.UPD_DATE_TIME,
        label: 'Upd Date',
      },
      {
        id: MEM_COL.MODE,
        defVal: MEMO_MODE.LIST,
      },
    ];

    /*************************
     * スキーマ
     *************************/
    const schema: BodyParamSchema = (tree) => {
      required(tree[MEM_COL.LABEL]);
      disabled(tree[MEM_COL.UPD_DATE_TIME]);
      disabled(tree[MEM_COL.MODE]);
      hidden(tree[MEM_COL.MODE], (_) => true);
    };

    // ダイアログパラメータ
    const input: DialogCustomInputExt = {
      data,
      param: {
        header: {
          title: 'Memo List',
        },
        body: {
          items,
          schema,
        },
      },
    };

    return input;
  };

  /**
   * ダイアログ入力データ作成(詳細データ編集時)
   * @param procInput
   * @returns 入力データ
   */
  private readonly createDialogInputDataDetail = (
    procInput: OpenDialogProcInput,
  ): DialogCustomInputExt => {
    const { allTblRows, tbl, selectedRows, option } = procInput;
    const [selectedRow] = selectedRows;

    /*************************
     * 入力データ
     *************************/
    const data = signal({
      [MEM_COL.DETAIL]: selectedRow[MEM_COL.DETAIL],
      [MEM_COL.DATE]: selectedRow[MEM_COL.DATE] ?? cvtDateToStr(),
      [MEM_COL.AMOUNT]: selectedRow[MEM_COL.AMOUNT],
      [MEM_COL.STATUS]: selectedRow[MEM_COL.STATUS],
      [MEM_COL.VALID]: selectedRow[MEM_COL.VALID],
      [MEM_COL.UPD_DATE_TIME]: selectedRow[MEM_COL.UPD_DATE_TIME],
    });

    /*************************
     * 各setterの設定
     *************************/
    // 計算結果 setter
    const calcResultSetter = this.createCalcResultSetter();

    // Valid Setter
    const validOffStatus = [
      COMP_STATUS.CANCELED,
      COMP_STATUS.CLOSE,
    ] as number[];
    const validSetter: InputItemSetter = ({ form }) => {
      const status = Number(form[MEM_COL.STATUS]().value());
      form[MEM_COL.VALID]().value.set(!validOffStatus.includes(status));
    };

    /*************************
     * 表示項目
     *************************/
    const items: InputItems = [
      {
        id: MEM_COL.LABEL,
        label: 'Label',
        defVal: option.fltKey,
      },
      {
        id: MEM_COL.DETAIL,
        label: 'Detail',
        type: 'textarea',
        style: { height: 'calc(30vh)' },
      },
      {
        id: MEM_COL.DATE,
        label: 'Date',
        type: 'date',
      },
      [
        {
          id: MEM_COL.AMOUNT,
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
      ],
      {
        id: MEM_COL.STATUS,
        label: 'Status',
        type: 'select',
        options: COMP_STATUS_LIST,
        defVal: COMP_STATUS.OPEN,
        setter: validSetter,
      },
      {
        id: MEM_COL.VALID,
        label: 'Valid',
        type: 'toggle',
      },
      {
        id: MEM_COL.UPD_DATE_TIME,
        label: 'Upd Date',
      },
      {
        id: MEM_COL.MODE,
        label: 'Mode',
        defVal: MEMO_MODE.DETAIL,
      },
    ];

    /*************************
     * スキーマ
     *************************/
    const parentRow = allTblRows[tbl].find(
      (row) => row[MEM_COL.ID] === option.fltKey,
    );
    const validCols = (parentRow?.[MEM_COL.VALID_COLUMNS] ?? []) as ValType[];
    const schema: BodyParamSchema = (tree) => {
      required(tree[MEM_COL.DETAIL]);
      disabled(tree[MEM_COL.LABEL]);
      disabled(tree['calcResult']);
      disabled(tree[MEM_COL.UPD_DATE_TIME]);
      disabled(tree[MEM_COL.MODE]);
      hidden(tree[MEM_COL.LABEL], (_) => true);
      hidden(tree[MEM_COL.DATE], (_) => !validCols.includes(DSP_COLS.DATE));
      hidden(tree[MEM_COL.AMOUNT], (_) => !validCols.includes(DSP_COLS.AMOUNT));
      hidden(tree['calcResult'], (_) => !validCols.includes(DSP_COLS.AMOUNT));
      hidden(tree[MEM_COL.STATUS], (_) => !validCols.includes(DSP_COLS.STATUS));
      hidden(tree[MEM_COL.VALID], (_) => true);
      hidden(tree[MEM_COL.MODE], (_) => true);
    };

    /*************************
     * ボタン
     *************************/
    const buttons: DialogButton = {
      del: {
        status: DIALOG_STATUS.DEL_PLUS,
      },
    };

    // ダイアログパラメータ
    const input: DialogCustomInputExt = {
      data,
      param: {
        header: {
          title: 'Memo Detail',
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
   * 計算結果 setter 作成処理
   * @returns 計算結果 setter
   */
  private readonly createCalcResultSetter = (): InputItemSetter => {
    return ({ form }) => {
      const amount = form[MEM_COL.AMOUNT]().value();
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
   * 出力データ作成処理(一覧)
   * @param procInput
   * @returns 出力データ
   */
  private readonly createOutputRowsList = (
    procInput: OpenDialogProcOutput,
  ): Row[] => {
    return this.cvtOutputDatasToRows(procInput);
  };

  /**
   * 出力データ作成処理(詳細)
   * @param procInput
   * @returns 出力データ
   */
  private readonly createOutputRowsDetail = (
    procInput: OpenDialogProcOutput,
  ): Row[] => {
    const rows = this.cvtOutputDatasToRows(procInput);
    // 金額(数値)設定
    rows[0][MEM_COL.AMOUNT_NUM] = calcResult(rows[0][MEM_COL.AMOUNT]);
    return rows;
  };

  /**
   * 更新・追加・削除以外のステータス返却時の処理(行編集Emitterデータ作成)
   * @param procInput
   * @returns 行編集データ
   */
  protected override readonly createCustomRowEdt = (
    procInput: OpenDialogProcRowEdt,
  ): RowEdt[] => {
    const { allTblRows, tbl, outputRows, rowIds, status } = procInput;
    const rowEdt: RowEdt[] = [];
    if (status === DIALOG_STATUS.DEL_PLUS) {
      // 対象データのID一覧を取得
      const targetIds = outputRows.map((row) => row[MEM_COL.ID]);
      // 一覧データの削除
      rowEdt.push(getRowEdtDel(tbl, targetIds, rowIds));
      // 関連する詳細データの取得
      const detailIds = allTblRows[tbl]
        .filter(
          (row) =>
            row[MEM_COL.MODE] === MEMO_MODE.DETAIL &&
            targetIds.includes(row[MEM_COL.LABEL]),
        )
        .map((row) => row[MEM_COL.ID]);
      // 詳細データの削除
      rowEdt.push(getRowEdtDel(tbl, detailIds, rowIds));
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
    // 一覧データ編集
    [MEMO_MODE.LIST]: {
      input: this.createDialogInputDataList,
      output: this.createOutputRowsList,
    },
    // 詳細データ編集
    [MEMO_MODE.DETAIL]: {
      input: this.createDialogInputDataDetail,
      output: this.createOutputRowsDetail,
    },
  };
}
