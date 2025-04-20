import { Injectable } from '@angular/core';
import { ColDef, ValueSetterParams } from 'ag-grid-community';
import { format } from 'date-fns';
import { RowData } from 'src/app/domain/row-data';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { ValueType } from 'src/app/shared/constants/types';
import * as Usecase from 'src/app/shared/constants/usecases';
import { DialogInputData } from 'src/app/shared/dialog-input/dialog-input.component';

@Injectable()
export class StorageUsecase extends SettingUsecase {
  /**
   * 列定義を返却する
   * @param inputDatas
   * @param credit
   * @returns 列定義
   */
  override readonly getColDefs = (
    inputDatas: RowData[] = [],
    credit: RowData[] = [],
  ): ColDef<RowData, ValueType>[] => [
    {
      headerName: 'Id',
      field: Const.ROW_DATA_COMMON_COL_ID.ID,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Storage',
      field: Const.ROW_DATA_COMMON_COL_ID.LABEL,
      cellEditor: 'agTextCellEditor',
      rowDrag: true,
      pinned: 'left',
      filter: false,
      width: 140,
      valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
      cellStyle: Usecase.getCellCommonStyle,
    },
    {
      headerName: 'Bank',
      field: Const.STORAGE_COL_ID.BANK,
      cellEditor: 'agTextCellEditor',
      hide: true,
      filter: false,
      width: 100,
      valueSetter: this.newValueSetter,
    },
    {
      headerName: 'Branch',
      field: Const.STORAGE_COL_ID.BRANCH,
      cellEditor: 'agTextCellEditor',
      hide: true,
      filter: false,
      width: 100,
      valueSetter: this.newValueSetter,
    },
    {
      headerName: 'Subject',
      field: Const.STORAGE_COL_ID.SUBJECT,
      cellEditor: 'agTextCellEditor',
      hide: true,
      filter: false,
      width: 100,
      valueSetter: this.newValueSetter,
    },
    {
      headerName: 'Savings',
      field: Const.STORAGE_COL_ID.SAVINGS,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: 'Last Savings',
      field: Const.STORAGE_COL_ID.LAST_SAVINGS,
      type: 'numericCol',
      filter: false,
      width: 110,
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
      filter: false,
      width: 150,
    },
    {
      headerName: 'Update',
      field: Const.ROW_DATA_COMMON_COL_ID.UPDATE,
      cellEditor: 'agCheckboxCellEditor',
      hide: true,
    },
  ];

  private readonly amountSetter = (
    params: ValueSetterParams<RowData, ValueType>,
    rowDatas: RowData[],
    credit: RowData[],
  ): boolean => {
    if (!this.newValueSetter(params)) {
      return false;
    }

    [
      params.data[Const.STORAGE_COL_ID.SAVINGS],
      params.data[Const.STORAGE_COL_ID.LAST_SAVINGS],
    ] = this.getIncAndExp(
      rowDatas,
      credit,
      params.data[Const.ROW_DATA_COMMON_COL_ID.ID],
    );

    return true;
  };

  override readonly getRowDatas = (
    rowDatas: RowData[],
    inputDatas: RowData[],
    credit: RowData[],
  ): RowData[] => {
    const datas = structuredClone(rowDatas);
    for (const data of datas) {
      [
        data[Const.STORAGE_COL_ID.SAVINGS],
        data[Const.STORAGE_COL_ID.LAST_SAVINGS],
      ] = this.getIncAndExp(
        inputDatas,
        credit,
        data[Const.ROW_DATA_COMMON_COL_ID.ID],
      );
    }

    return datas;
  };

  private readonly getIncAndExp = (
    inputDatas: RowData[],
    credit: RowData[],
    storageId: ValueType,
  ): number[] => {
    const savingsList = [0, 0];

    if (storageId === Const.MARK.NO_SELECT.ID) {
      // 未選択項目は計算対象外
      return savingsList;
    }

    const today = format(new Date(), Const.DATE_FORMAT.YYYY_MM_DD);

    for (const data of inputDatas) {
      const num = data[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM];
      if (
        !Usecase.checkInputMode(data, Const.INPUT_MODE.ALL_REQ) ||
        data[Const.MONEY_DIARY_COL_ID.STORAGE] !== storageId ||
        !Usecase.isValidInteger(num)
      ) {
        continue;
      }

      const payDate = Usecase.getPayDate(
        data[Const.MONEY_DIARY_COL_ID.USE_DATE] ||
          data[Const.MONEY_DIARY_COL_ID.DATE],
        data[Const.MONEY_DIARY_COL_ID.CREDIT],
        credit,
      );
      if (payDate <= today) {
        savingsList[0] += num;
      }

      savingsList[1] += num;
    }

    return savingsList;
  };

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
      id: Const.STORAGE_COL_ID.BANK,
      label: 'Bank',
      value: rowData[Const.STORAGE_COL_ID.BANK],
      initValue: initValues[Const.STORAGE_COL_ID.BANK],
    },
    {
      id: Const.STORAGE_COL_ID.BRANCH,
      label: 'Branch',
      value: rowData[Const.STORAGE_COL_ID.BRANCH],
      initValue: initValues[Const.STORAGE_COL_ID.BRANCH],
    },
    {
      id: Const.STORAGE_COL_ID.SUBJECT,
      label: 'Subject',
      value: rowData[Const.STORAGE_COL_ID.SUBJECT],
      initValue: initValues[Const.STORAGE_COL_ID.SUBJECT],
    },
  ];
}
