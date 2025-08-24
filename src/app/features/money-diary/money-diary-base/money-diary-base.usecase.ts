import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
  ColDef,
  ColGroupDef,
  ValueFormatterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import { lastValueFrom } from 'rxjs';
import { Row, TblMap } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import { RowEdt, Tbl, ValType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DialogInput,
  DialogInputComponent,
  DialogOutput,
  DialogOutputData,
} from 'src/app/shared/dialog-input/dialog-input.component';
import { SelectOption } from 'src/app/shared/forms/forms.component';
import {
  DIALOG_STATUS,
  DialogStatus,
} from './../../../shared/dialog-input/dialog-input.component';
import { MoneyStatus } from './../../../shared/money-status/money-status.component';

@Injectable()
export abstract class MoneyDiaryBaseUsecase {
  /** ダイアログ */
  protected readonly dialog = inject(MatDialog);

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
      field: Const.CMN_COL.ID,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    ...colDefs,
    {
      headerName: 'Valid',
      field: Const.CMN_COL.VALID,
      cellEditor: 'agCheckboxCellEditor',
      hide: true,
    },
    {
      headerName: 'Upd Date',
      field: Const.CMN_COL.UPD_DATE_TIME,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Input Mode',
      field: Const.CMN_COL.INPUT_MODE,
      cellEditor: 'agNumberCellEditor',
      hide: true,
    },
    {
      headerName: 'Update',
      field: Const.CMN_COL.UPDATE,
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
    params.data[Const.CMN_COL.UPDATE] = true;
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

    return Util.getDate(new Date(val), Const.DATE_FMT.YY_MM_DD);
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
        .map((id) => options.find((opt) => opt.id === id)?.lb ?? '')
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
      .filter((row) => !!row[Const.CMN_COL.VALID] && !!row[Const.CMN_COL.LABEL])
      .map((row) => row[Const.CMN_COL.ID]);
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
    const row = rows.find((row) => row[Const.CMN_COL.ID] === id);
    const label = row?.[Const.CMN_COL.LABEL] ?? Const.MARK.NO_SELECT.label;
    if (typeof label !== 'string') {
      return Const.MARK.NO_SELECT.label;
    }

    return label;
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
   * 行データ編集処理
   * @param edtRows
   * @param tbl
   * @param tblMap
   * @param option
   * @returns 正常: RowEdt[], 異常: false
   */
  readonly procEditRows = async (
    edtRows: (Row | undefined)[] = [],
    tbl: Tbl,
    tblMap: TblMap,
    option?: any,
  ): Promise<RowEdt[] | false> => {
    // 入力チェック
    if (!this.chkInputRows(edtRows)) {
      return false;
    }
    // ダイアログ入力データ作成
    const input = this.createInputData(edtRows, tbl, tblMap, option);
    // ダイアログオープン
    const output = await this.openDialog(input);
    if (!output) {
      return false;
    }
    // 行編集Emitterデータ作成
    return this.createResultData(output, edtRows, tbl, tblMap, option);
  };

  /**
   * 入力チェック(ダイアログオープン前)
   * @param rows
   * @returns チェック結果
   */
  private readonly chkInputRows = (
    rows: (Row | undefined)[] = [],
  ): rows is Row[] => {
    // rows,row：undefinedでない、かつ未選択項目が含まれていない場合
    return rows.every(
      (row) => !!row && row[Const.CMN_COL.ID] !== Const.MARK.NO_SELECT.id,
    );
  };

  /**
   * ダイアログ入力データ作成
   * @param edtRows
   * @param tbl
   * @param tblMap
   * @param option
   * @returns 入力データ
   */
  protected abstract readonly createInputData: (
    edtRows: Row[],
    tbl: Tbl,
    tblMap: TblMap,
    option?: any,
  ) => DialogInput;

  /**
   * ダイアログオープン
   * @param input
   * @returns 出力データ
   */
  private readonly openDialog = async (
    input: DialogInput,
  ): Promise<DialogOutput | undefined> => {
    // config
    const config: MatDialogConfig<DialogInput> = {
      data: input,
      autoFocus: false, // 初期フォーカスなし
    };
    // ダイアログオープン
    const dialogRef = this.dialog.open<
      DialogInputComponent,
      DialogInput,
      DialogOutput
    >(DialogInputComponent, config);
    // 出力データ
    return await lastValueFrom(dialogRef.afterClosed());
  };

  /**
   * 行編集Emitterデータ作成
   * @param output
   * @param edtRows
   * @param tbl
   * @param tblMap
   * @param option
   * @returns 編集用データ
   */
  private readonly createResultData = (
    output: DialogOutput,
    edtRows: Row[],
    tbl: Tbl,
    tblMap: TblMap,
    option?: any,
  ): RowEdt[] => {
    // 入力項目反映
    edtRows = this.reflectRows(edtRows, output.datas, option);

    // 行ID初期設定
    const rowIds = Util.getRowIdsSet(tblMap[tbl]);
    const rowEdt: RowEdt[] = [];

    switch (output.status) {
      // 更新
      case DIALOG_STATUS.UPD:
        rowEdt.push(Util.getRowEdtUpd(tbl, edtRows));
        break;
      // 追加
      case DIALOG_STATUS.ADD:
        rowEdt.push(Util.getRowEdtAdd(tbl, edtRows, [], rowIds));
        break;
      // 削除
      case DIALOG_STATUS.DEL:
        rowEdt.push(
          Util.getRowEdtDel(
            tbl,
            edtRows.map((row) => row[Const.CMN_COL.ID]),
            rowIds,
          ),
        );
        break;
      // その他
      default:
        rowEdt.push(
          ...this.getRowEdts(output.status, edtRows, tbl, tblMap, rowIds),
        );
        break;
    }

    // 未選択データ追加チェック
    if (!this.checkNoSelData(tblMap[tbl])) {
      // 未選択データ追加
      rowEdt.push(Util.getRowEdtAddNoSel(tbl));
    }

    return rowEdt;
  };

  /**
   * 入力項目反映(行編集Emitterデータ作成)
   * @param edtRows
   * @param outDatas
   * @param option
   * @returns 行データ項目追加後データ
   * @default reflectRowsDef
   */
  protected readonly reflectRows = (
    edtRows: Row[],
    outDatas: DialogOutputData[],
    option?: any,
  ): Row[] => this.reflectRowsDef(edtRows, outDatas);

  /**
   * 入力項目反映デフォルト処理
   * @param edtRows
   * @param outDatas
   * @returns 行データ項目追加後データ
   */
  protected readonly reflectRowsDef = (
    edtRows: Row[],
    outDatas: DialogOutputData[],
  ): Row[] => {
    const newRows = structuredClone(edtRows);
    for (const row of newRows) {
      for (const outData of outDatas) {
        row[outData.id] = outData.value;
      }
    }
    return newRows;
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
  protected readonly getRowEdts = (
    status: DialogStatus,
    edtRows: Row[],
    tbl: Tbl,
    tblMap: TblMap,
    rowIds = new Set<ValType>(),
  ): RowEdt[] => {
    return [];
  };

  /**
   * 未選択用データがあるかどうか(行編集Emitterデータ作成)
   * @param rows
   * @returns チェック結果
   */
  protected readonly checkNoSelData = (rows: Row[]): boolean => {
    return true;
  };
}
