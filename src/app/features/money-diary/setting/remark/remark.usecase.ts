import { Injectable } from '@angular/core';
import { ColDef, ValueSetterParams } from 'ag-grid-community';
import { RowData } from 'src/app/domain/row-data';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { ValueType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import { DialogInputDatas } from 'src/app/shared/dialog-input/dialog-input.component';
import { MoneyStatus } from 'src/app/shared/money-status/money-status.component';

@Injectable()
export class RemarkUsecase extends SettingUsecase {
  /**
   * 列定義を返却する
   * @param inputDatas
   * @returns 列定義
   */
  override readonly getColDefs = (
    inputDatas: RowData[] = [],
  ): ColDef<RowData, ValueType>[] => [
    {
      headerName: 'Id',
      field: Const.ROW_DATA_COMMON_COL_ID.ID,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Remark',
      field: Const.ROW_DATA_COMMON_COL_ID.LABEL,
      cellEditor: 'agTextCellEditor',
      rowDrag: true,
      pinned: 'left',
      filter: false,
      width: 140,
      valueSetter: (params) => this.amountSetter(params, inputDatas),
      cellStyle: Util.getCellCommonStyle,
    },
    {
      headerName: 'Memo',
      field: Const.REMARK_COL_ID.MEMO,
      cellEditor: 'agLargeTextCellEditor',
      filter: false,
      width: 220,
      valueSetter: this.newValueSetter,
    },
    {
      headerName: 'Inc And Exp',
      field: Const.REMARK_COL_ID.INC_AND_EXP,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: 'Income',
      field: Const.REMARK_COL_ID.INCOME,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: 'Expenses',
      field: Const.REMARK_COL_ID.EXPENSES,
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
    inputDatas: RowData[],
  ): boolean => {
    if (!this.newValueSetter(params)) {
      return false;
    }

    [
      params.data[Const.REMARK_COL_ID.INCOME],
      params.data[Const.REMARK_COL_ID.EXPENSES],
      params.data[Const.REMARK_COL_ID.INC_AND_EXP],
    ] = this.getIncAndExp(
      inputDatas,
      params.data[Const.ROW_DATA_COMMON_COL_ID.ID],
    );
    return true;
  };

  override readonly getRowDatas = (
    rowDatas: RowData[],
    inputDatas: RowData[],
  ): RowData[] => {
    const datas = structuredClone(rowDatas);

    for (const data of datas) {
      [
        data[Const.REMARK_COL_ID.INCOME],
        data[Const.REMARK_COL_ID.EXPENSES],
        data[Const.REMARK_COL_ID.INC_AND_EXP],
      ] = this.getIncAndExp(inputDatas, data[Const.ROW_DATA_COMMON_COL_ID.ID]);
    }

    return datas;
  };

  private readonly getIncAndExp = (
    rowDatas: RowData[],
    remarkId: ValueType,
  ): number[] => {
    let income = 0;
    let expenses = 0;

    if (remarkId === Const.MARK.NO_SELECT.ID) {
      // 未選択項目は計算対象外
      return [0, 0, 0];
    }

    for (const data of rowDatas) {
      const num = data[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM];
      if (
        Util.checkInputMode(data, Const.INPUT_MODE.ALL_REQ) &&
        data[Const.MONEY_DIARY_COL_ID.REMARK] === remarkId &&
        Util.isValidInteger(num)
      ) {
        if (num > 0) {
          income += num;
        } else if (num < 0) {
          expenses += num;
        }
      }
    }

    return [income, expenses, income + expenses];
  };

  /**
   * 選択行の金額を計算して返却する
   * @param rowDatas
   * @returns
   */
  override readonly calcSelectStatus = (rowDatas: RowData[]): MoneyStatus[] => {
    const statusInfo = [
      { label: 'Cnt', id: '' },
      { label: 'Sum', id: Const.REMARK_COL_ID.INC_AND_EXP },
      { label: 'Inc', id: Const.REMARK_COL_ID.INCOME },
      { label: 'Exp', id: Const.REMARK_COL_ID.EXPENSES },
    ];
    const status = statusInfo.map((info) => ({ ...info, amount: 0 }));
    // 収支計算
    for (const data of rowDatas) {
      for (const [idx, st] of status.entries()) {
        if (!idx) {
          continue;
        }
        const num = Number(data[st.id]);
        if (!Util.isValidInteger(num)) {
          continue;
        }
        st.amount += num;
      }
    }
    return status.map((st, idx) => ({
      label: st.label,
      value: !idx ? rowDatas.length.toString() : Util.cvtNumToPrice(st.amount),
    }));
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
  ): DialogInputDatas => [
    {
      id: Const.REMARK_COL_ID.MEMO,
      label: 'Memo',
      value: rowData[Const.REMARK_COL_ID.MEMO],
      type: Const.INPUT_TYPE.TEXTAREA,
      initValue: initValues[Const.REMARK_COL_ID.MEMO],
    },
  ];
}
