import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { ValType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import { DialogInputDatas } from 'src/app/shared/dialog-input/dialog-input.component';

@Injectable()
export class ItemUsecase extends SettingUsecase {
  /**
   * 列定義を返却する
   * @returns 列定義
   */
  override readonly getColDefs = (): ColDef<Row, ValType>[] => [
    ...this.addCmnColDefs([
      {
        headerName: 'Item',
        field: Const.CMN_COL.LABEL,
        cellEditor: 'agTextCellEditor',
        rowDrag: true,
        filter: false,
        flex: 1,
        cellStyle: Util.getCellCmnStyle,
      },
      {
        headerName: 'Summary Count',
        field: Const.ITM_COL.SUMMARY_COUNT_FLG,
        cellEditor: 'agCheckboxCellEditor',
      },
    ]),
  ];

  /**
   * データの入力を行う
   * @param row
   * @param initValues
   * @returns 入力データ
   */
  override readonly getDialogInputDataCustom = (
    row: Row,
    initValues: Row,
  ): DialogInputDatas => [
    {
      id: Const.ITM_COL.SUMMARY_COUNT_FLG,
      label: 'Summary Count',
      value: row[Const.ITM_COL.SUMMARY_COUNT_FLG],
      type: Const.INPUT_TYPE.TOGGLE,
      initValue: initValues[Const.ITM_COL.SUMMARY_COUNT_FLG],
    },
  ];
}
