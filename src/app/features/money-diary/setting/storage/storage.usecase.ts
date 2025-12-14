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
export class StorageUsecase extends SettingUsecase {
  /**
   * 列定義を返却する
   * @param inputDatas
   * @param credit
   * @returns 列定義
   */
  override readonly getColDefs = (
    inputDatas: Row[] = [],
    credit: Row[] = [],
  ): ColDef<Row, ValType>[] => [
    ...this.addCmnColDefs([
      {
        headerName: 'Storage',
        field: Const.CMN_COL.LABEL,
        cellEditor: 'agTextCellEditor',
        rowDrag: true,
        pinned: 'left',
        filter: false,
        width: 140,
        valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
        cellStyle: Util.getCellCmnStyle,
      },
      {
        headerName: 'Bank',
        field: Const.STG_COL.BANK,
        cellEditor: 'agTextCellEditor',
        hide: true,
        filter: false,
        width: 100,
      },
      {
        headerName: 'Branch',
        field: Const.STG_COL.BRANCH,
        cellEditor: 'agTextCellEditor',
        hide: true,
        filter: false,
        width: 100,
      },
      {
        headerName: 'Subject',
        field: Const.STG_COL.SUBJECT,
        cellEditor: 'agTextCellEditor',
        hide: true,
        filter: false,
        width: 100,
      },
      {
        headerName: 'Savings',
        field: Const.STG_COL.SAVINGS,
        type: 'numericCol',
        filter: false,
        width: 110,
      },
      {
        headerName: 'Last Savings',
        field: Const.STG_COL.LAST_SAVINGS,
        type: 'numericCol',
        filter: false,
        width: 110,
      },
    ]),
  ];

  private readonly amountSetter = (
    params: ValueSetterParams<Row, ValType>,
    rows: Row[],
    credit: Row[],
  ): boolean => {
    if (!this.newValSetter(params)) {
      return false;
    }

    [
      params.data[Const.STG_COL.SAVINGS],
      params.data[Const.STG_COL.LAST_SAVINGS],
    ] = this.getIncAndExp(rows, credit, params.data[Const.CMN_COL.ID]);

    return true;
  };

  override readonly getRows = (
    rows: Row[],
    inputDatas: Row[],
    credit: Row[],
  ): Row[] => {
    const datas = this.getRowsCmn(rows);
    for (const data of datas) {
      [data[Const.STG_COL.SAVINGS], data[Const.STG_COL.LAST_SAVINGS]] =
        this.getIncAndExp(inputDatas, credit, data[Const.CMN_COL.ID]);
    }

    return datas;
  };

  private readonly getIncAndExp = (
    inputDatas: Row[],
    credit: Row[],
    storageId: ValType,
  ): number[] => {
    const savingsList = [0, 0];

    if (storageId === Const.MARK.NO_SELECT.id) {
      // 未選択項目は計算対象外
      return savingsList;
    }

    const today = Util.getDate();

    for (const data of inputDatas) {
      const num = data[Const.MAIN_COL.AMOUNT_NUM];
      if (
        !Util.checkInputMode(data, Const.INPUT_MODE.ALL_REQ) ||
        data[Const.MAIN_COL.STORAGE] !== storageId ||
        !Util.isValidInt(num)
      ) {
        continue;
      }

      const payDate = Util.getPayDate(
        data[Const.MAIN_COL.USE_DATE],
        data[Const.MAIN_COL.CREDIT],
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
   * 選択行の金額を計算して返却する
   * @param rows
   * @returns
   */
  override readonly calcSelStatus = (rows: Row[]): MoneyStatus[] => {
    const statusInf = [
      { label: 'Cnt', id: '' },
      { label: 'Savings', id: Const.STG_COL.SAVINGS },
      { label: 'Last Savings', id: Const.STG_COL.LAST_SAVINGS },
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
      id: Const.STG_COL.BANK,
      label: 'Bank',
      value: row[Const.STG_COL.BANK],
      initValue: initValues[Const.STG_COL.BANK],
    },
    {
      id: Const.STG_COL.BRANCH,
      label: 'Branch',
      value: row[Const.STG_COL.BRANCH],
      initValue: initValues[Const.STG_COL.BRANCH],
    },
    {
      id: Const.STG_COL.SUBJECT,
      label: 'Subject',
      value: row[Const.STG_COL.SUBJECT],
      initValue: initValues[Const.STG_COL.SUBJECT],
    },
  ];
}
