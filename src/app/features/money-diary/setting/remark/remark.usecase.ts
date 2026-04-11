import { Injectable } from '@angular/core';
import { ColDef, ValueSetterParams } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import { InputItems } from 'src/app/shared/dialog-custom-input/dialog-custom-input.component';
import { MoneyStatus } from 'src/app/shared/money-status/money-status.component';
import {
  NO_SELECT_VAL,
  ValType,
} from 'src/app/shared/signal-form/signal-form.component';
import { cvtNumToPrice, isValidInt } from 'src/app/shared/utils/util-formula';
import {
  checkInputMode,
  CMN_COL,
  INPUT_MODE,
  MAIN_COL,
  RMK_COL,
} from 'src/app/shared/utils/util-row';

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
    ...this.addCmnColDefs([
      {
        headerName: 'Remark',
        field: CMN_COL.LABEL,
        cellEditor: 'agTextCellEditor',
        rowDrag: true,
        pinned: 'left',
        filter: false,
        width: 140,
        valueSetter: (params) => this.amountSetter(params, inputDatas),
        cellStyle: this.getCellCmnStyle,
      },
      {
        headerName: 'Memo',
        field: RMK_COL.MEMO,
        cellEditor: 'agLargeTextCellEditor',
        filter: false,
        width: 220,
      },
      {
        headerName: 'Inc And Exp',
        field: RMK_COL.INC_AND_EXP,
        type: 'numericCol',
        filter: false,
        width: 110,
        comparator: this.compAmt,
        valueFormatter: (params) => cvtNumToPrice(params.value),
        cellStyle: (params) => this.getStylePrice(params.value),
      },
      {
        headerName: 'Income',
        field: RMK_COL.INCOME,
        type: 'numericCol',
        filter: false,
        width: 110,
        comparator: this.compAmt,
        valueFormatter: (params) => cvtNumToPrice(params.value),
        cellStyle: (params) => this.getStylePrice(params.value),
      },
      {
        headerName: 'Expenses',
        field: RMK_COL.EXPENSES,
        type: 'numericCol',
        filter: false,
        width: 110,
        comparator: this.compAmt,
        valueFormatter: (params) => cvtNumToPrice(params.value),
        cellStyle: (params) => this.getStylePrice(params.value),
      },
    ]),
  ];

  /**
   * 金額Setter
   * @param params
   * @param inputDatas
   * @returns Setter
   */
  private readonly amountSetter = (
    params: ValueSetterParams<Row, ValType>,
    inputDatas: Row[],
  ): boolean => {
    if (!this.newValSetter(params)) {
      return false;
    }

    [
      params.data[RMK_COL.INCOME],
      params.data[RMK_COL.EXPENSES],
      params.data[RMK_COL.INC_AND_EXP],
    ] = this.getIncAndExp(inputDatas, params.data[CMN_COL.ID]);
    return true;
  };

  /**
   * 行データ取得
   * @param rows
   * @param inputDatas
   * @returns 行データ
   */
  override readonly getRows = (rows: Row[], inputDatas: Row[]): Row[] => {
    const datas = this.getRowsCmn(rows);

    for (const data of datas) {
      [
        data[RMK_COL.INCOME],
        data[RMK_COL.EXPENSES],
        data[RMK_COL.INC_AND_EXP],
      ] = this.getIncAndExp(inputDatas, data[CMN_COL.ID]);
    }

    return datas;
  };

  /**
   * 収支を計算して返却する
   * @param rows
   * @param remarkId
   * @returns 収支
   */
  private readonly getIncAndExp = (
    rows: Row[],
    remarkId: ValType,
  ): number[] => {
    let income = 0;
    let expenses = 0;

    if (remarkId === NO_SELECT_VAL.ID) {
      // 未選択項目は計算対象外
      return [0, 0, 0];
    }

    for (const data of rows) {
      const num = data[MAIN_COL.AMOUNT_NUM];
      if (
        checkInputMode(data, INPUT_MODE.ALL_REQ) &&
        data[MAIN_COL.REMARK] === remarkId &&
        isValidInt(num)
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
   * @returns 選択行のステータス
   */
  override readonly calcSelStatus = (rows: Row[]): MoneyStatus[] => {
    const statusInf = [
      { label: 'Cnt', id: '' },
      { label: 'Sum', id: RMK_COL.INC_AND_EXP },
      { label: 'Inc', id: RMK_COL.INCOME },
      { label: 'Exp', id: RMK_COL.EXPENSES },
    ];
    const status = statusInf.map((info) => ({ ...info, amount: 0 }));
    // 収支計算
    for (const data of rows) {
      for (const [idx, st] of status.entries()) {
        if (!idx) {
          continue;
        }
        const num = Number(data[st.id]);
        if (!isValidInt(num)) {
          continue;
        }
        st.amount += num;
      }
    }
    return status.map((st, idx) => ({
      label: st.label,
      value: !idx ? rows.length.toString() : cvtNumToPrice(st.amount),
    }));
  };

  /**
   * ダイアログ表示項目返却(custom)
   * @param defRow
   * @returns 表示項目
   */
  protected override readonly getDialogInputItemsCustom = (
    defRow: Row,
  ): InputItems => [
    {
      id: RMK_COL.MEMO,
      label: 'Memo',
      type: 'textarea',
    },
  ];

  /**
   * ダイアログスキーマ返却(custom)
   */
  protected override readonly getDialogSchemaCustom = undefined;
}
