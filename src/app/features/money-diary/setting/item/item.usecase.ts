import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { RowData } from 'src/app/domain/row-data';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { ValueType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import { DialogInputData } from 'src/app/shared/dialog-input/dialog-input.component';

@Injectable()
export class ItemUsecase extends SettingUsecase {
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
      headerName: 'Item',
      field: Const.ROW_DATA_COMMON_COL_ID.LABEL,
      cellEditor: 'agTextCellEditor',
      rowDrag: true,
      filter: false,
      flex: 1,
      valueSetter: this.newValueSetter,
      cellStyle: Util.getCellCommonStyle,
    },
    {
      headerName: 'Summary Count',
      field: Const.ITEM_COL_ID.SUMMARY_COUNT_FLG,
      cellEditor: 'agCheckboxCellEditor',
      hide: true,
      valueSetter: this.newValueSetter,
    },
    {
      headerName: 'Valid',
      field: Const.ROW_DATA_COMMON_COL_ID.VALID,
      cellEditor: 'agCheckboxCellEditor',
      hide: true,
      valueSetter: this.newValueSetter,
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
   * データの入力を行う
   * @param rowData
   * @param initValues
   * @returns 入力データ
   */
  override readonly getDialogInputDataCustom = (
    rowData: RowData,
    initValues: RowData,
  ): DialogInputData[] => [
    {
      id: Const.ITEM_COL_ID.SUMMARY_COUNT_FLG,
      label: 'Summary Count',
      value: rowData[Const.ITEM_COL_ID.SUMMARY_COUNT_FLG],
      type: Const.INPUT_TYPE.TOGGLE,
      initValue: initValues[Const.ITEM_COL_ID.SUMMARY_COUNT_FLG],
    },
  ];
}
