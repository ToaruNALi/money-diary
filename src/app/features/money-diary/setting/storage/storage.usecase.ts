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
  cvtDateToStr,
  getPayDate,
  INPUT_MODE,
  MAIN_COL,
  STG_COL,
} from 'src/app/shared/utils/util-row';

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
        field: CMN_COL.LABEL,
        cellEditor: 'agTextCellEditor',
        rowDrag: true,
        pinned: 'left',
        filter: false,
        width: 140,
        valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
        cellStyle: this.getCellCmnStyle,
      },
      {
        headerName: 'Bank',
        field: STG_COL.BANK,
        cellEditor: 'agTextCellEditor',
        hide: true,
        filter: false,
        width: 100,
      },
      {
        headerName: 'Branch',
        field: STG_COL.BRANCH,
        cellEditor: 'agTextCellEditor',
        hide: true,
        filter: false,
        width: 100,
      },
      {
        headerName: 'Subject',
        field: STG_COL.SUBJECT,
        cellEditor: 'agTextCellEditor',
        hide: true,
        filter: false,
        width: 100,
      },
      {
        headerName: 'Savings',
        field: STG_COL.SAVINGS,
        type: 'numericCol',
        filter: false,
        width: 110,
        comparator: this.compAmt,
        valueFormatter: (params) => cvtNumToPrice(params.value),
        cellStyle: (params) => this.getStylePrice(params.value),
      },
      {
        headerName: 'Last Savings',
        field: STG_COL.LAST_SAVINGS,
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
   * @param rows
   * @param credit
   * @returns Setter
   */
  private readonly amountSetter = (
    params: ValueSetterParams<Row, ValType>,
    rows: Row[],
    credit: Row[],
  ): boolean => {
    if (!this.newValSetter(params)) {
      return false;
    }

    [params.data[STG_COL.SAVINGS], params.data[STG_COL.LAST_SAVINGS]] =
      this.getIncAndExp(rows, credit, params.data[CMN_COL.ID]);

    return true;
  };

  /**
   * 行データ取得
   * @param rows
   * @param inputDatas
   * @param credit
   * @returns 行データ
   */
  override readonly getRows = (
    rows: Row[],
    inputDatas: Row[],
    credit: Row[],
  ): Row[] => {
    const datas = this.getRowsCmn(rows);
    for (const data of datas) {
      [data[STG_COL.SAVINGS], data[STG_COL.LAST_SAVINGS]] = this.getIncAndExp(
        inputDatas,
        credit,
        data[CMN_COL.ID],
      );
    }

    return datas;
  };

  /**
   * 収支を計算して返却する
   * @param inputDatas
   * @param credit
   * @param storageId
   * @returns 収支
   */
  private readonly getIncAndExp = (
    inputDatas: Row[],
    credit: Row[],
    storageId: ValType,
  ): number[] => {
    const savingsList = [0, 0];

    if (storageId === NO_SELECT_VAL.ID) {
      // 未選択項目は計算対象外
      return savingsList;
    }

    const today = cvtDateToStr();

    for (const data of inputDatas) {
      const num = data[MAIN_COL.AMOUNT_NUM];
      if (
        !checkInputMode(data, INPUT_MODE.ALL_REQ) ||
        data[MAIN_COL.STORAGE] !== storageId ||
        !isValidInt(num)
      ) {
        continue;
      }

      const payDate = getPayDate(
        data[MAIN_COL.USE_DATE],
        data[MAIN_COL.CREDIT],
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
   * @returns 選択行のステータス
   */
  override readonly calcSelStatus = (rows: Row[]): MoneyStatus[] => {
    const statusInf = [
      { label: 'Cnt', id: '' },
      { label: 'Savings', id: STG_COL.SAVINGS },
      { label: 'Last Savings', id: STG_COL.LAST_SAVINGS },
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
      id: STG_COL.BANK,
      label: 'Bank',
    },
    {
      id: STG_COL.BRANCH,
      label: 'Branch',
    },
    {
      id: STG_COL.SUBJECT,
      label: 'Subject',
    },
  ];

  /**
   * ダイアログスキーマ返却(custom)
   */
  protected override readonly getDialogSchemaCustom = undefined;
}
