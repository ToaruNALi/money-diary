import { inject, Injectable, signal } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
  CellClassParams,
  CellStyle,
  ColDef,
  ColGroupDef,
  ValueFormatterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import { lastValueFrom } from 'rxjs';
import { Row, TblMap } from 'src/app/domain/row-data';
import {
  DIALOG_BUTTON_ID,
  DIALOG_OUTPUT_STATUS,
  DialogCustomInput,
  DialogCustomInputComponent,
  DialogCustomInputData,
  DialogCustomOutput,
} from 'src/app/shared/dialog-custom-input/dialog-custom-input.component';
import { Overwrite } from 'src/app/shared/types/type-general';
import { isValidInt } from 'src/app/shared/utils/util-formula';
import {
  CMN_COL,
  cvtDateToStr,
  DATE_FMT,
  getColValsByTblAndCustomId,
  getRowEdtAdd,
  getRowEdtAddNoSel,
  getRowEdtDel,
  getRowEdtUpd,
  getRowIdsSet,
  RowEdt,
  Tbl,
} from 'src/app/shared/utils/util-row';
import { MoneyStatus } from './../../../shared/money-status/money-status.component';
import {
  FormValType,
  NO_SELECT_VAL,
  SelectOption,
  ValType,
} from './../../../shared/signal-form/signal-form.component';

/** ダイアログオープン処理 初期入力パラメータ */
export type OpenDialogInitProcInput = {
  /** 対象TBL */
  tbl: Tbl;
  /** 全TBLデータ */
  allTblRows: TblMap;
  /** 選択行 */
  selectedRows?: Row | Row[];
  /** オプション */
  option?: any;
};

/** ダイアログオープン処理 入力パラメータ */
export type OpenDialogProcInput = Overwrite<
  OpenDialogInitProcInput,
  { selectedRows: Row[] }
>;

/** ダイアログオープン処理 出力パラメータ */
export type OpenDialogProcOutput = OpenDialogProcInput & {
  outputDatas: DialogOutputValidData[];
};

/** ダイアログオープン処理 行編集パラメータ */
export type OpenDialogProcRowEdt = OpenDialogProcInput & {
  status: string;
  rowIds?: Set<ValType>;
  outputRows: Row[];
};

/** 拡張ダイアログ入力パラメータ */
export type DialogCustomInputExt = Overwrite<
  DialogCustomInput,
  { data: DialogCustomInputData }
>;

/** ダイアログ有効データ */
type DialogOutputValidData = {
  key: string;
  value: ValType;
};

@Injectable()
export abstract class MoneyDiaryBaseUsecase {
  /** ダイアログ */
  protected readonly customDialog = inject(MatDialog);

  /**
   * 列定義取得
   * @param ...data
   * @returns 列定義
   */
  abstract readonly getColDefs: (...data: any) => ColDef<Row, ValType>[];

  /**
   * 共通列定義追加
   * @param colDefs
   * @returns 列定義
   */
  protected readonly addCmnColDefs = (
    colDefs: ColDef<Row, ValType>[],
  ): ColDef<Row, ValType>[] => [
    {
      headerName: 'Id',
      field: CMN_COL.ID,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    ...colDefs,
    {
      headerName: 'Valid',
      field: CMN_COL.VALID,
      cellEditor: 'agCheckboxCellEditor',
      hide: true,
    },
    {
      headerName: 'Upd Date',
      field: CMN_COL.UPD_DATE_TIME,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Input Mode',
      field: CMN_COL.INPUT_MODE,
      cellEditor: 'agNumberCellEditor',
      hide: true,
    },
    {
      headerName: 'Update',
      field: CMN_COL.UPDATE,
      cellEditor: 'agCheckboxCellEditor',
      hide: true,
    },
  ];

  /**
   * 更新値 Setter
   * @param params
   * @returns boolean
   */
  protected readonly newValSetter = (
    params: ValueSetterParams<Row, ValType>,
  ): boolean => {
    if (params.newValue === undefined) {
      return false;
    }
    const colId = params.column.getId();
    params.data[colId] = params.newValue;
    params.data[CMN_COL.UPDATE] = true;
    return true;
  };

  /**
   * 日付 Formmater
   * @param params
   * @returns 日付
   */
  protected readonly dateFormatter = (
    params: ValueFormatterParams<Row, ValType>,
  ): string => {
    const val = params.value;
    if (!val || typeof val !== 'string') {
      return '';
    }

    return cvtDateToStr(new Date(val), DATE_FMT.YY_MM_DD);
  };

  /**
   * チェックボックス Formatter
   * @param options
   * @param id
   * @returns チェックボックス Label
   */
  protected readonly chkboxFormatter = (
    options: SelectOption[] = [],
    ids: ValType = [],
  ): string => {
    if (Array.isArray(ids)) {
      return ids
        .map((id) => options.find((opt) => opt.id === id)?.label ?? '')
        .toString();
    }
    return '';
  };

  /**
   * セレクトボックス取得
   * @param rows
   * @returns セレクトボックス
   */
  protected readonly getList = (rows: Row[] = []): ValType[] => {
    return structuredClone(rows)
      .filter((row) => !!row[CMN_COL.VALID] && !!row[CMN_COL.LABEL])
      .map((row) => row[CMN_COL.ID]);
  };

  /**
   * セレクトボックス Formmater/Filter Getter
   * @param rows
   * @param id
   * @returns セレクトボックス Label
   */
  protected readonly listFormatter = (
    rows: Row[] = [],
    id?: ValType,
  ): string => {
    const row = rows.find((row) => row[CMN_COL.ID] === id);
    const label = row?.[CMN_COL.LABEL] ?? NO_SELECT_VAL.LABEL;
    if (typeof label !== 'string') {
      return NO_SELECT_VAL.LABEL;
    }

    return label;
  };

  /** 金額コンパレーター */
  protected readonly compAmt = (valueA?: ValType, valueB?: ValType): number => {
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
  protected readonly getStylePrice = (
    value?: ValType,
    cellStyle: CellStyle = {},
  ): CellStyle => {
    if (!isValidInt(value)) {
      return cellStyle;
    }

    cellStyle['color'] = (() => {
      if (value < 0) {
        return '#FF7E79';
      } else if (value > 0) {
        return '#76D6FF';
      }
      return '#BBBEC9';
    })();
    return cellStyle;
  };

  /** セル共通スタイル */
  protected readonly getCellCmnStyle = (
    params: CellClassParams<Row, ValType>,
    cellStyle: CellStyle = {},
  ): CellStyle => {
    const valid = params.data?.[CMN_COL.VALID] ?? true;
    if (valid) {
      cellStyle['opacity'] = 1;
    } else {
      cellStyle['opacity'] = 0.3;
    }
    return cellStyle;
  };

  /**
   * 行データ取得
   * @param ...rows
   * @returns 行データ
   */
  abstract readonly getRows: (...rows: Row[][]) => Row[];

  /**
   * 選択行の金額を計算して返却する
   * @param rows
   * @param colDefs
   * @returns 行データ
   */
  readonly calcSelStatus = (
    rows: Row[],
    colDefs: (ColDef<Row, any> | ColGroupDef<Row>)[],
  ): MoneyStatus[] => {
    return [];
  };

  /**
   * ダイアログオープン
   * @param procInput
   * @returns
   */
  readonly openDialog = async (
    procInput: OpenDialogInitProcInput,
  ): Promise<RowEdt[] | null> => {
    let { tbl, selectedRows = [] } = procInput;

    // 行データが存在しない場合、デフォルトデータを設定する
    let newDataFlg = false;
    if (Array.isArray(selectedRows)) {
      if (selectedRows.length === 0) {
        newDataFlg = true;
        selectedRows = [getColValsByTblAndCustomId(tbl)];
      }
    } else {
      selectedRows = [selectedRows];
    }

    // ダイアログ入力データ作成
    const inputValType = this.createDialogInputData({
      ...procInput,
      selectedRows,
    });

    // DialogCustomInputExt -> DialogCustomInput
    const cvtData: Record<string, FormValType> = {};
    const entries = Object.entries(inputValType.data());
    for (const [key, val] of entries) {
      if (Array.isArray(val)) {
        const opts =
          inputValType.param.body.items.flat().find((it) => it.id === key)
            ?.options ?? [];
        const check = opts.reduce(
          (rec, opt) => {
            rec[opt.value] = val.includes(opt.value);
            return rec;
          },
          {} as Record<string | number, boolean>,
        );
        cvtData[key] = check;
      } else {
        cvtData[key] = val;
      }
    }
    const input = {
      data: signal(cvtData),
      param: inputValType.param,
    };

    // ダイアログオープン
    const output = await this.openDialogMain(input, newDataFlg);

    // 行編集Emitterデータ作成
    return this.createRowEdtData({
      ...procInput,
      selectedRows,
      input,
      output,
    });
  };

  /**
   * ダイアログ入力データ作成
   */
  protected abstract readonly createDialogInputData: (
    procInput: OpenDialogProcInput,
  ) => DialogCustomInputExt;

  /**
   * ダイアログオープンメイン
   * @param data
   * @param newData
   * @returns 出力データ
   */
  private readonly openDialogMain = async (
    data: DialogCustomInput,
    newData: boolean,
  ): Promise<DialogCustomOutput | undefined> => {
    // 新規データの場合、追加・削除ボタンを非表示にする
    if (newData) {
      for (const id of [DIALOG_BUTTON_ID.ADD, DIALOG_BUTTON_ID.DEL]) {
        (data.param.footer ??= { buttons: {} }).buttons[id] = { hide: true };
      }
    }

    // config
    const config: MatDialogConfig<DialogCustomInput> = {
      data,
      autoFocus: false, // 初期フォーカスなし
    };

    // ダイアログオープン
    const dialogRef = this.customDialog.open<
      DialogCustomInputComponent,
      DialogCustomInput,
      DialogCustomOutput
    >(DialogCustomInputComponent, config);

    // 出力データ
    return await lastValueFrom(dialogRef.afterClosed());
  };

  /**
   * 行編集Emitterデータ作成
   * @param procInput
   * @returns 編集用データ
   */
  private readonly createRowEdtData = (
    procInput: OpenDialogProcInput & {
      input: DialogCustomInput;
      output?: DialogCustomOutput;
    },
  ): RowEdt[] | null => {
    const { input, output } = procInput;
    if (!output) {
      // 何もせずに閉じた場合
      return null;
    }

    // 有効データ抽出
    const datas = this.createValidDatas(input);

    // 入力項目反映
    const outputRows = this.createOutputRows({
      ...procInput,
      outputDatas: datas,
    });

    // 行編集データ作成
    const rowEdt = this.createRowEdtDataMain({
      ...procInput,
      status: output.status,
      outputRows,
    });

    return rowEdt;
  };

  /**
   * 有効データ作成
   * @param input
   * @returns 有効データ
   */
  private readonly createValidDatas = (
    input: DialogCustomInput,
  ): DialogOutputValidData[] => {
    return input.param.body.items.flat().reduce((datas, cur) => {
      if (!cur.notReturn) {
        const value = input.data()[cur.id];
        if (!!value && typeof value === 'object') {
          // チェックボックス
          const checkOptIds = Object.entries(value).reduce(
            (arr, [optId, check]) => (check ? [...arr, optId] : arr),
            [] as ValType[],
          );
          datas = [...datas, { key: cur.id, value: checkOptIds }];
        } else {
          // チェックボックス以外
          datas = [...datas, { key: cur.id, value }];
        }
      }
      return datas;
    }, [] as DialogOutputValidData[]);
  };

  /**
   * 出力データ作成処理
   * @param procInput
   * @returns 出力データ
   */
  protected readonly createOutputRows = (
    procInput: OpenDialogProcOutput,
  ): Row[] => this.cvtOutputDatasToRows(procInput);

  /**
   * 出力データ作成デフォルト処理
   * @param procInput
   * @returns 出力データ
   */
  protected readonly cvtOutputDatasToRows = ({
    selectedRows,
    outputDatas,
  }: OpenDialogProcOutput): Row[] => {
    const newRows = structuredClone(selectedRows);
    for (const row of newRows) {
      for (const outData of outputDatas) {
        row[outData.key] = outData.value;
      }
    }
    return newRows;
  };

  /**
   * 行編集データ作成メイン
   * @param procInput
   * @returns 行編集データ
   */
  private readonly createRowEdtDataMain = (
    procInput: OpenDialogProcRowEdt,
  ): RowEdt[] => {
    const {
      status,
      tbl,
      allTblRows,
      outputRows,
      rowIds = getRowIdsSet(allTblRows[tbl]),
    } = procInput;
    const rowEdt: RowEdt[] = [];

    switch (status) {
      // 更新
      case DIALOG_OUTPUT_STATUS.UPD:
        rowEdt.push(getRowEdtUpd(tbl, outputRows, rowIds));
        break;
      // 追加
      case DIALOG_OUTPUT_STATUS.ADD:
        rowEdt.push(getRowEdtAdd(tbl, outputRows, [], rowIds));
        break;
      // 削除
      case DIALOG_OUTPUT_STATUS.DEL:
        rowEdt.push(
          getRowEdtDel(
            tbl,
            outputRows.map((row) => row[CMN_COL.ID]),
            rowIds,
          ),
        );
        break;
      // その他
      default:
        rowEdt.push(
          ...this.createCustomRowEdt({ ...procInput, status, rowIds }),
        );
        break;
    }

    // 未選択データ追加チェック
    if (!this.checkNoSelData(allTblRows[tbl])) {
      // 未選択データ追加
      rowEdt.push(getRowEdtAddNoSel(tbl));
    }

    return rowEdt;
  };

  /**
   * 未選択用データがあるかどうか(行編集Emitterデータ作成)
   * @param rows
   * @returns チェック結果
   */
  protected readonly checkNoSelData = (_: Row[]): boolean => {
    return true;
  };

  /**
   * 更新・追加・削除以外のステータス返却時の処理(行編集Emitterデータ作成)
   * @param procInput
   * @returns 行編集データ
   */
  protected readonly createCustomRowEdt = (
    _procInput: OpenDialogProcRowEdt,
  ): RowEdt[] => {
    return [];
  };
}
