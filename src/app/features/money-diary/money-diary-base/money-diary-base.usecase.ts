import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
  CellClickedEvent,
  ColDef,
  ColGroupDef,
  ValueFormatterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import { lastValueFrom } from 'rxjs';
import { Row } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import { RowEdt, Tbl, ValType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DialogInput,
  DialogInputComponent,
  DialogOutput,
  DialogOutputData,
} from 'src/app/shared/dialog-input/dialog-input.component';
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
   * @param ...rows
   * @returns 列定義
   */
  abstract readonly getColDefs: (...rows: Row[][]) => ColDef<Row, ValType>[];

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
   * セレクトボックス取得
   * @param rows
   * @returns セレクトボックス
   */
  protected readonly getList = (rows: Row[]): ValType[] => {
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
  protected readonly listFormatter = (rows: Row[], id?: ValType): string => {
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
   * 入力チェック(ダイアログオープン前)
   * @param event
   * @param option
   * @returns チェック結果
   */
  abstract readonly checkInputData: (
    event: CellClickedEvent<Row, ValType>,
    option?: any,
  ) => boolean;

  /**
   * ダイアログ入力データ作成
   * @param selectRows
   * @param tbl
   * @param rowsList
   * @param option
   * @returns 入力データ
   */
  abstract readonly createInputData: (
    selectRows: Row[],
    tbl: Tbl,
    rowsList: Row[][],
    option?: any,
  ) => DialogInput;

  /**
   * ダイアログオープン
   * @param input
   * @returns 出力データ
   */
  readonly openDialog = async (
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
   * @param updRows
   * @param rows
   * @param tbl
   * @param option
   * @returns 編集用データ
   */
  readonly createResultData = (
    output: DialogOutput,
    updRows: Row[],
    rows: Row[],
    tbl: Tbl,
    option?: any,
  ): RowEdt[] => {
    // 入力項目反映
    updRows = this.reflectRows(updRows, output.datas, option);

    // 行ID初期設定
    const rowIds = Util.getRowIdsSet(rows);
    const rowEdt: RowEdt[] = [];

    switch (output.status) {
      // 更新
      case DIALOG_STATUS.UPD:
        rowEdt.push(Util.getRowEdtUpd(tbl, updRows));
        break;
      // 追加
      case DIALOG_STATUS.ADD:
        rowEdt.push(Util.getRowEdtAdd(tbl, updRows, [], rowIds));
        break;
      // 削除
      case DIALOG_STATUS.DEL:
        rowEdt.push(
          Util.getRowEdtDel(
            tbl,
            updRows.map((row) => row[Const.CMN_COL.ID]),
            rowIds,
          ),
        );
        break;
      // その他
      default:
        rowEdt.push(
          ...this.getRowEdts(output.status, tbl, updRows, rows, rowIds),
        );
        break;
    }

    // 未選択データ追加チェック
    if (!this.checkNoSelData(rows)) {
      // 未選択データ追加
      rowEdt.push(Util.getRowEdtAddNoSel(tbl));
    }

    return rowEdt;
  };

  /**
   * 入力項目反映(行編集Emitterデータ作成)
   * @param selRows
   * @param outDatas
   * @param option
   * @returns 行データ項目追加後データ
   * @default reflectRowsDef
   */
  protected readonly reflectRows = (
    selRows: Row[],
    outDatas: DialogOutputData[],
    option?: any,
  ): Row[] => this.reflectRowsDef(selRows, outDatas);

  /**
   * 入力項目反映デフォルト処理
   * @param selRows
   * @param outDatas
   * @returns 行データ項目追加後データ
   */
  protected readonly reflectRowsDef = (
    selRows: Row[],
    outDatas: DialogOutputData[],
  ): Row[] => {
    const newRows = structuredClone(selRows);
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
   * @param tbl
   * @param updRows
   * @param rows
   * @param rowIds
   * @returns
   */
  protected readonly getRowEdts = (
    status: DialogStatus,
    tbl: Tbl,
    updRows: Row[],
    rows: Row[] = [],
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
