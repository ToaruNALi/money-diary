import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
  CellClickedEvent,
  ColDef,
  ColGroupDef,
  RowClassParams,
  RowStyle,
  ValueFormatterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import { lastValueFrom } from 'rxjs';
import { RowData } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import {
  RowDataAdd,
  RowDataDel,
  RowDataEdit,
  RowDataKey,
  RowDataUpd,
  ValueType,
} from 'src/app/shared/constants/types';
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
   * @param ...rowDatas
   * @returns 列定義
   */
  abstract readonly getColDefs: (
    ...rowDatas: RowData[][]
  ) => ColDef<RowData, ValueType>[];

  /**
   * 更新値 Setter
   * @param params
   * @returns boolean
   */
  protected readonly newValueSetter = (
    params: ValueSetterParams<RowData, ValueType>,
  ): boolean => {
    if (params.newValue === undefined) {
      return false;
    }
    const colId = params.column.getId();
    params.data[colId] = params.newValue;
    params.data[Const.ROW_DATA_COMMON_COL_ID.UPDATE] = true;
    return true;
  };

  /**
   * 日付 Formmater
   * @param params
   * @returns 日付
   */
  protected readonly dateFormatter = (
    params: ValueFormatterParams<RowData, ValueType>,
  ): string => {
    const val = params.value;
    if (!val || typeof val !== 'string') {
      return '';
    }

    return Util.getDate(new Date(val), Const.DATE_FORMAT.YY_MM_DD);
  };

  /**
   * コンボボックス取得
   * @param rowDatas
   * @returns コンボボックス
   */
  protected readonly getComboboxValue = (rowDatas: RowData[]): ValueType[] => {
    return structuredClone(rowDatas)
      .filter(
        (data) =>
          !!data[Const.ROW_DATA_COMMON_COL_ID.VALID] &&
          !!data[Const.ROW_DATA_COMMON_COL_ID.LABEL],
      )
      .map((data) => data[Const.ROW_DATA_COMMON_COL_ID.ID]);
  };

  /**
   * コンボボックス Formmater/Filter Getter
   * @param rowDatas
   * @param id
   * @returns コンボボックス Label
   */
  protected readonly comboboxFormatter = (
    rowDatas: RowData[],
    id?: ValueType,
  ): string => {
    const data = rowDatas.find(
      (data) => data[Const.ROW_DATA_COMMON_COL_ID.ID] === id,
    );
    const label =
      data?.[Const.ROW_DATA_COMMON_COL_ID.LABEL] ?? Const.MARK.NO_SELECT.LABEL;
    if (typeof label !== 'string') {
      return Const.MARK.NO_SELECT.LABEL;
    }

    return label;
  };

  /**
   * 行データ取得
   * @param ...rowDatas
   * @returns 行データ
   */
  abstract readonly getRowDatas: (...rowDatas: RowData[][]) => RowData[];

  /**
   * 選択行の金額を計算して返却する
   * @param rowDatas
   * @param colDefs
   * @returns 行データ
   */
  readonly calcSelectStatus = (
    rowDatas: RowData[],
    colDefs: (ColDef<RowData, any> | ColGroupDef<RowData>)[],
  ): MoneyStatus[] => {
    return [];
  };

  /**
   * 行スタイルを返却する
   * @param params
   * @param option
   * @returns 行スタイル
   */
  readonly getRowStyle = (
    params: RowClassParams<RowData>,
    option?: any,
  ): RowStyle => {
    const rowData = params.data;
    if (!rowData) {
      return {};
    }

    return this.getRowStyleCustom(rowData, {}, option);
  };

  /**
   * 行スタイル返却(Custom)
   * @param rowData
   * @param style
   * @param option
   * @default style = {}
   * @returns 行スタイル
   */
  protected readonly getRowStyleCustom = (
    rowData: RowData,
    style: RowStyle = {},
    option?: any,
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
   * @param option
   * @returns チェック結果
   */
  abstract readonly checkInputData: (
    event: CellClickedEvent<RowData, ValueType>,
    option?: any,
  ) => boolean;

  /**
   * ダイアログ入力データ作成
   * @param selectRowDatas
   * @param rowDataKey
   * @param rowDatasList
   * @param option
   * @returns 入力データ
   */
  abstract readonly createInputData: (
    selectRowDatas: RowData[],
    rowDataKey: RowDataKey,
    rowDatasList: RowData[][],
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
   * @param selectRowDatas
   * @param rowDatas
   * @param rowDataKey
   * @param option
   * @returns 編集用データ
   */
  readonly createResultData = (
    output: DialogOutput,
    selectRowDatas: RowData[],
    rowDatas: RowData[],
    rowDataKey: RowDataKey,
    option?: any,
  ): RowDataEdit[] => {
    // 入力項目反映
    const selectNewDatas = this.reflectRowDatas(
      selectRowDatas,
      output.datas,
      option,
    );

    let editInfo: RowDataEdit[] = [];
    let newDatas = structuredClone(rowDatas);
    if (output.status === DIALOG_STATUS.UPD) {
      // 更新
      [newDatas, editInfo] = this.procUpdStatus(
        selectNewDatas,
        newDatas,
        rowDataKey,
        editInfo,
        option,
      );
    } else if (output.status === DIALOG_STATUS.ADD) {
      // 追加
      [newDatas, editInfo] = this.procAddStatus(
        selectNewDatas,
        newDatas,
        rowDataKey,
        editInfo,
        option,
      );
    } else if (output.status === DIALOG_STATUS.DEL) {
      // 削除
      [newDatas, editInfo] = this.procDelStatus(
        selectNewDatas,
        newDatas,
        rowDataKey,
        editInfo,
        option,
      );
    } else {
      // その他
      [newDatas, editInfo] = this.procOtherStatus(
        output.status,
        selectNewDatas,
        newDatas,
        rowDataKey,
        editInfo,
        option,
      );
    }

    // 空データ追加チェック
    if (this.checkAddEmptyData(newDatas)) {
      // 空データ追加
      [, editInfo] = this.procAddEmptyData(
        newDatas,
        rowDataKey,
        editInfo,
        option,
        output.status,
      );
    }
    return editInfo;
  };

  /**
   * 入力項目反映(行編集Emitterデータ作成)
   * @param selectRowDatas
   * @param outputDatas
   * @param option
   * @returns 行データ項目追加後データ
   * @default reflectRowDatasDefault
   */
  protected readonly reflectRowDatas = (
    selectRowDatas: RowData[],
    outputDatas: DialogOutputData[],
    option?: any,
  ): RowData[] => this.reflectRowDatasDefault(selectRowDatas, outputDatas);

  /**
   * 入力項目反映デフォルト処理
   * @param selectRowDatas
   * @param outputDatas
   * @returns 行データ項目追加後データ
   */
  protected readonly reflectRowDatasDefault = (
    selectRowDatas: RowData[],
    outputDatas: DialogOutputData[],
  ): RowData[] => {
    const newDatas = structuredClone(selectRowDatas);
    for (const newData of newDatas) {
      for (const outputData of outputDatas) {
        newData[outputData.id] = outputData.value;
      }
    }
    return newDatas;
  };

  /**
   * 空データ追加チェック(行編集Emitterデータ作成)
   * @param newDatas
   * @param option
   * @returns チェック結果
   * @default false
   */
  protected readonly checkAddEmptyData = (
    newDatas: RowData[],
    option?: any,
  ): boolean => false;

  /**
   * 更新ステータス返却時の処理(行編集Emitterデータ作成)
   * @param selectNewDatas
   * @param rowDatas
   * @param rowDataKey
   * @param editInfo
   * @param option
   * @returns [編集後行データ、行編集情報]
   */
  protected readonly procUpdStatus = (
    selectNewDatas: RowData[],
    rowDatas: RowData[],
    rowDataKey: RowDataKey,
    editInfo: RowDataEdit[],
    option?: any,
  ): [RowData[], RowDataEdit[]] => {
    const newEditInfo = [
      ...editInfo,
      {
        type: Const.ROW_DATA_EDIT_TYPE.UPD,
        event: {
          key: rowDataKey,
          datas: selectNewDatas,
        } as RowDataUpd,
      },
    ];
    const newDatas = structuredClone(rowDatas);
    for (let idx = 0; idx < newDatas.length; idx++) {
      // 選択中のデータの場合、更新後データに書き換える
      const newData = selectNewDatas.find(
        (data) =>
          data[Const.ROW_DATA_COMMON_COL_ID.ID] ===
          newDatas[idx][Const.ROW_DATA_COMMON_COL_ID.ID],
      );
      if (!!newData) {
        newDatas[idx] = structuredClone(newData);
      }
    }

    return [newDatas, newEditInfo];
  };

  /**
   * 追加ステータス返却時の処理(行編集Emitterデータ作成)
   * @param selectNewDatas
   * @param rowDatas
   * @param rowDataKey
   * @param editInfo
   * @param option
   * @returns [編集後行データ、行編集情報]
   */
  protected readonly procAddStatus = (
    selectNewDatas: RowData[],
    rowDatas: RowData[],
    rowDataKey: RowDataKey,
    editInfo: RowDataEdit[],
    option?: any,
  ): [RowData[], RowDataEdit[]] => {
    const addDatas = structuredClone(selectNewDatas);
    let newDatas = structuredClone(rowDatas);
    for (const addData of addDatas) {
      addData[Const.ROW_DATA_COMMON_COL_ID.ID] = Util.createRowId(rowDatas);
      newDatas = [...newDatas, structuredClone(addData)];
    }
    const newEditInfo = [
      ...editInfo,
      {
        type: Const.ROW_DATA_EDIT_TYPE.ADD,
        event: {
          key: rowDataKey,
          datas: addDatas,
          addIds: [null],
        } as RowDataAdd,
      },
    ];
    return [newDatas, newEditInfo];
  };

  /**
   * 削除ステータス返却時の処理(行編集Emitterデータ作成)
   * @param selectNewDatas
   * @param rowDatas
   * @param rowDataKey
   * @param editInfo
   * @param option
   * @returns [編集後行データ、行編集情報]
   */
  protected readonly procDelStatus = (
    selectNewDatas: RowData[],
    rowDatas: RowData[],
    rowDataKey: RowDataKey,
    editInfo: RowDataEdit[],
    option?: any,
  ): [RowData[], RowDataEdit[]] => {
    const newEditInfo: RowDataEdit[] = [
      ...editInfo,
      {
        type: Const.ROW_DATA_EDIT_TYPE.DEL,
        event: {
          key: rowDataKey,
          datas: selectNewDatas,
        } as RowDataDel,
      },
    ];
    const delIds = selectNewDatas.map(
      (data) => data[Const.ROW_DATA_COMMON_COL_ID.ID],
    );
    const newDatas = structuredClone(rowDatas).filter(
      (data) => !delIds.includes(data[Const.ROW_DATA_COMMON_COL_ID.ID]),
    );
    return [newDatas, newEditInfo];
  };

  /**
   * 更新・追加・削除以外のステータス返却時の処理(行編集Emitterデータ作成)
   * @param status
   * @param selectNewDatas
   * @param rowDatas
   * @param rowDataKey
   * @param editInfo
   * @param option
   * @returns [編集後行データ、行編集情報]
   * @default [newDatas,editInfo]
   */
  protected readonly procOtherStatus = (
    status: DialogStatus,
    selectNewDatas: RowData[],
    rowDatas: RowData[],
    rowDataKey: RowDataKey,
    editInfo: RowDataEdit[],
    option?: any,
  ): [RowData[], RowDataEdit[]] => {
    return [rowDatas, editInfo];
  };

  /**
   * 空行追加(行編集Emitterデータ作成)
   * @param rowDatas
   * @param rowDataKey
   * @param editInfo
   * @param option
   * @param status
   * @returns [編集後行データ、行編集情報]
   * @default [newDatas,editInfo]
   */
  protected readonly procAddEmptyData = (
    rowDatas: RowData[],
    rowDataKey: RowDataKey,
    editInfo: RowDataEdit[],
    option?: any,
    status?: DialogStatus,
  ): [RowData[], RowDataEdit[]] => {
    return this.procAddStatus(
      [Util.getInitRowData(rowDataKey)],
      rowDatas,
      rowDataKey,
      editInfo,
      option,
    );
  };
}
