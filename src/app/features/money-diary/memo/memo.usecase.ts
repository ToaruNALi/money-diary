import { Injectable } from '@angular/core';
import { CellClickedEvent, ColDef, RowStyle } from 'ag-grid-community';
import { RowData } from 'src/app/domain/row-data';
import { MoneyDiaryBaseUsecase } from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { RowDataKey, ValueType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DialogInput,
  DialogInputDatas,
  DialogOutputData,
} from 'src/app/shared/dialog-input/dialog-input.component';

@Injectable()
export class MemoUsecase extends MoneyDiaryBaseUsecase {
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
      headerName: 'Memo',
      field: Const.ROW_DATA_COMMON_COL_ID.LABEL,
      cellEditor: 'agLargeTextCellEditor',
      rowDrag: true,
      filter: false,
      flex: 1,
    },
    {
      headerName: 'Upd Date',
      field: Const.ROW_DATA_COMMON_COL_ID.UPD_DATE,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Update',
      field: Const.ROW_DATA_COMMON_COL_ID.UPDATE,
      cellEditor: 'agCheckboxCellEditor',
      hide: true,
    },
  ];

  /**
   * 行データ取得
   * @param rowDatas
   * @returns 行データ
   */
  override readonly getRowDatas = (rowDatas: RowData[]): RowData[] => {
    return structuredClone(rowDatas);
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
   * 入力チェック
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
   * @param rowDatas
   * @param rowDataKey
   * @returns 入力データ
   */
  override readonly createInputData = (
    rowDatas: RowData[],
    rowDataKey: RowDataKey,
  ): DialogInput => {
    // 入力データ
    const initValues = Util.getInitRowData(rowDataKey);
    const rowData = rowDatas[0];
    const datas: DialogInputDatas = [
      {
        id: Const.ROW_DATA_COMMON_COL_ID.LABEL,
        label: 'Memo',
        value: rowData[Const.ROW_DATA_COMMON_COL_ID.LABEL],
        type: Const.INPUT_TYPE.TEXTAREA,
        initValue: initValues[Const.ROW_DATA_COMMON_COL_ID.LABEL],
        style: { height: 'calc(100vh - 500px)' },
      },
      {
        id: Const.ROW_DATA_COMMON_COL_ID.UPD_DATE,
        label: 'Upd Date',
        value: rowData[Const.ROW_DATA_COMMON_COL_ID.UPD_DATE],
        disabled: true,
        initValue: initValues[Const.ROW_DATA_COMMON_COL_ID.UPD_DATE],
      },
    ];

    return {
      title: Util.getScreenTitle(rowDataKey),
      datas,
      option: { sameDataOk: true },
    };
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
    newDatas[0][Const.ROW_DATA_COMMON_COL_ID.UPD_DATE] = Util.getDate(
      undefined,
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
}
