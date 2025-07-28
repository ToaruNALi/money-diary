import { Injectable } from '@angular/core';
import { CellClickedEvent, ColDef } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { MoneyDiaryBaseUsecase } from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { Tbl, ValType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DialogInput,
  DialogInputDatas,
} from 'src/app/shared/dialog-input/dialog-input.component';

@Injectable()
export class MemoUsecase extends MoneyDiaryBaseUsecase {
  /**
   * 列定義を返却する
   * @returns 列定義
   */
  override readonly getColDefs = (): ColDef<Row, ValType>[] => [
    {
      headerName: 'Id',
      field: Const.MEM_COL.ID,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Memo',
      field: Const.MEM_COL.LABEL,
      cellEditor: 'agLargeTextCellEditor',
      rowDrag: true,
      filter: false,
      flex: 1,
    },
    {
      headerName: 'Upd Date',
      field: Const.MEM_COL.UPD_DATE_TIME,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Input Mode',
      field: Const.MEM_COL.INPUT_MODE,
      cellEditor: 'agNumberCellEditor',
      hide: true,
    },
  ];

  /**
   * 行データ取得
   * @param rows
   * @returns 行データ
   */
  override readonly getRows = (rows: Row[]): Row[] => {
    return structuredClone(rows);
  };

  /**
   * 入力チェック
   * @param event
   * @returns チェック結果
   */
  override readonly checkInputData = (
    event: CellClickedEvent<Row, ValType>,
  ): boolean => {
    // 選択行がある、かつ、入力データがある場合
    return !!event.node.id && !!event.data;
  };

  /**
   * ダイアログ入力データ作成
   * @param rows
   * @param tbl
   * @returns 入力データ
   */
  override readonly createInputData = (rows: Row[], tbl: Tbl): DialogInput => {
    // 入力データ
    const defRow = Util.getTblDefRow(tbl);
    const row = rows[0];
    const inDatas: DialogInputDatas = [
      {
        id: Const.MEM_COL.LABEL,
        label: 'Memo',
        value: row[Const.MEM_COL.LABEL],
        type: Const.INPUT_TYPE.TEXTAREA,
        initValue: defRow[Const.MEM_COL.LABEL],
        style: { height: 'calc(100vh - 500px)' },
      },
      {
        id: Const.MEM_COL.UPD_DATE_TIME,
        label: 'Upd Date',
        value: row[Const.MEM_COL.UPD_DATE_TIME],
        disabled: true,
        initValue: defRow[Const.MEM_COL.UPD_DATE_TIME],
      },
    ];

    return {
      title: Util.getTblName(tbl),
      datas: inDatas,
      option: { sameDataOk: true },
    };
  };
}
