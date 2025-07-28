import { Injectable } from '@angular/core';
import { ColDef, ValueSetterParams } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { ValType } from 'src/app/shared/constants/types';
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
    inputDatas: Row[] = [],
  ): ColDef<Row, ValType>[] => [
    {
      headerName: 'Id',
      field: Const.CMN_COL.ID,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Remark',
      field: Const.CMN_COL.LABEL,
      cellEditor: 'agTextCellEditor',
      rowDrag: true,
      pinned: 'left',
      filter: false,
      width: 140,
      valueSetter: (params) => this.amountSetter(params, inputDatas),
      cellStyle: Util.getCellCmnStyle,
    },
    {
      headerName: 'Memo',
      field: Const.RMK_COL.MEMO,
      cellEditor: 'agLargeTextCellEditor',
      filter: false,
      width: 220,
    },
    {
      headerName: 'Inc And Exp',
      field: Const.RMK_COL.INC_AND_EXP,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: 'Income',
      field: Const.RMK_COL.INCOME,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: 'Expenses',
      field: Const.RMK_COL.EXPENSES,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
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
      filter: false,
      width: 150,
    },
    {
      headerName: 'Update',
      field: Const.CMN_COL.UPDATE,
      cellEditor: 'agCheckboxCellEditor',
      hide: true,
    },
  ];

  private readonly amountSetter = (
    params: ValueSetterParams<Row, ValType>,
    inputDatas: Row[],
  ): boolean => {
    if (!this.newValSetter(params)) {
      return false;
    }

    [
      params.data[Const.RMK_COL.INCOME],
      params.data[Const.RMK_COL.EXPENSES],
      params.data[Const.RMK_COL.INC_AND_EXP],
    ] = this.getIncAndExp(inputDatas, params.data[Const.CMN_COL.ID]);
    return true;
  };

  override readonly getRows = (rows: Row[], inputDatas: Row[]): Row[] => {
    const datas = structuredClone(rows);

    for (const data of datas) {
      [
        data[Const.RMK_COL.INCOME],
        data[Const.RMK_COL.EXPENSES],
        data[Const.RMK_COL.INC_AND_EXP],
      ] = this.getIncAndExp(inputDatas, data[Const.CMN_COL.ID]);
    }

    return datas;
  };

  private readonly getIncAndExp = (
    rows: Row[],
    remarkId: ValType,
  ): number[] => {
    let income = 0;
    let expenses = 0;

    if (remarkId === Const.MARK.NO_SELECT.id) {
      // 未選択項目は計算対象外
      return [0, 0, 0];
    }

    for (const data of rows) {
      const num = data[Const.MAIN_COL.AMOUNT_NUM];
      if (
        Util.checkInputMode(data, Const.INPUT_MODE.ALL_REQ) &&
        data[Const.MAIN_COL.REMARK] === remarkId &&
        Util.isValidInt(num)
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
   * @param rows
   * @returns
   */
  override readonly calcSelStatus = (rows: Row[]): MoneyStatus[] => {
    const statusInf = [
      { label: 'Cnt', id: '' },
      { label: 'Sum', id: Const.RMK_COL.INC_AND_EXP },
      { label: 'Inc', id: Const.RMK_COL.INCOME },
      { label: 'Exp', id: Const.RMK_COL.EXPENSES },
    ];
    const status = statusInf.map((info) => ({ ...info, amount: 0 }));
    // 収支計算
    for (const data of rows) {
      for (const [idx, st] of status.entries()) {
        if (!idx) {
          continue;
        }
        const num = Number(data[st.id]);
        if (!Util.isValidInt(num)) {
          continue;
        }
        st.amount += num;
      }
    }
    return status.map((st, idx) => ({
      label: st.label,
      value: !idx ? rows.length.toString() : Util.cvtNumToPrice(st.amount),
    }));
  };

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
      id: Const.RMK_COL.MEMO,
      label: 'Memo',
      value: row[Const.RMK_COL.MEMO],
      type: Const.INPUT_TYPE.TEXTAREA,
      initValue: initValues[Const.RMK_COL.MEMO],
    },
  ];
}
