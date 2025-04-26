import { Injectable } from '@angular/core';
import { ColDef, ValueSetterParams } from 'ag-grid-community';
import { addMonths, format } from 'date-fns';
import { RowData } from 'src/app/domain/row-data';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { ValueType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DialogInputData,
  DialogOption,
} from 'src/app/shared/dialog-input/dialog-input.component';

@Injectable()
export class CreditUsecase extends SettingUsecase {
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
      headerName: 'Credit',
      field: Const.ROW_DATA_COMMON_COL_ID.LABEL,
      cellEditor: 'agTextCellEditor',
      rowDrag: true,
      pinned: 'left',
      filter: false,
      width: 140,
      valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
      cellStyle: Util.getCellCommonStyle,
    },
    {
      headerName: 'Close',
      field: Const.CREDIT_COL_ID.CLOSE_DAY,
      type: 'amountCol',
      hide: true,
      filter: false,
      width: 70,
      valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
    },
    {
      headerName: 'Pay',
      field: Const.CREDIT_COL_ID.PAY_DAY,
      type: 'amountCol',
      hide: true,
      filter: false,
      width: 70,
      valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
    },
    {
      headerName: 'Pay Month',
      field: Const.CREDIT_COL_ID.PAY_MONTH,
      type: 'amountCol',
      hide: true,
      filter: false,
      width: 100,
      valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
    },
    {
      headerName: 'Business Days',
      field: Const.CREDIT_COL_ID.BUSINESS_DAYS,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: Const.BUSINESS_DAYS_SELECT.map((data) => data.id),
      },
      hide: true,
      filter: false,
      width: 120,
      valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
      valueFormatter: (params) =>
        Const.BUSINESS_DAYS_SELECT.find((data) => data.id === params.value)
          ?.label ?? '',
      filterValueGetter: (params) =>
        Const.BUSINESS_DAYS_SELECT.find(
          (data) =>
            data.id === params.getValue(Const.CREDIT_COL_ID.BUSINESS_DAYS),
        )?.label ?? '',
    },
    {
      headerName: 'Card',
      field: Const.CREDIT_COL_ID.CARD,
      cellEditor: 'agTextCellEditor',
      hide: true,
      filter: false,
      width: 110,
      valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
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
    {
      headerName: format(addMonths(new Date(), -2), Const.DATE_FORMAT.YYYY_MM),
      field: Const.CREDIT_COL_ID.EXPENSES_TWO_MONTHS_AGO,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: format(addMonths(new Date(), -1), Const.DATE_FORMAT.YYYY_MM),
      field: Const.CREDIT_COL_ID.EXPENSES_LAST_MONTH,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: format(addMonths(new Date(), 0), Const.DATE_FORMAT.YYYY_MM),
      field: Const.CREDIT_COL_ID.EXPENSES_THIS_MONTH,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: format(addMonths(new Date(), 1), Const.DATE_FORMAT.YYYY_MM),
      field: Const.CREDIT_COL_ID.EXPENSES_NEXT_MONTH,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: '',
      field: Const.CREDIT_COL_ID.EXPENSES_CUSTOM_MONTH,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
  ];

  private readonly amountSetter = (
    params: ValueSetterParams<RowData, ValueType>,
    inputDatas: RowData[],
    credit: RowData[],
  ): boolean => {
    if (!this.newValueSetter(params)) {
      return false;
    }

    [
      params.data[Const.CREDIT_COL_ID.EXPENSES_TWO_MONTHS_AGO],
      params.data[Const.CREDIT_COL_ID.EXPENSES_LAST_MONTH],
      params.data[Const.CREDIT_COL_ID.EXPENSES_THIS_MONTH],
      params.data[Const.CREDIT_COL_ID.EXPENSES_NEXT_MONTH],
      params.data[Const.CREDIT_COL_ID.EXPENSES_CUSTOM_MONTH],
    ] = this.getIncAndExp(
      inputDatas,
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
        data[Const.CREDIT_COL_ID.EXPENSES_TWO_MONTHS_AGO],
        data[Const.CREDIT_COL_ID.EXPENSES_LAST_MONTH],
        data[Const.CREDIT_COL_ID.EXPENSES_THIS_MONTH],
        data[Const.CREDIT_COL_ID.EXPENSES_NEXT_MONTH],
        data[Const.CREDIT_COL_ID.EXPENSES_CUSTOM_MONTH],
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
    creditId: ValueType,
  ): number[] => {
    const amountList = [0, 0, 0, 0, 0];
    const monthList = [
      format(addMonths(new Date(), -2), Const.DATE_FORMAT.YYYY_MM),
      format(addMonths(new Date(), -1), Const.DATE_FORMAT.YYYY_MM),
      format(addMonths(new Date(), 0), Const.DATE_FORMAT.YYYY_MM),
      format(addMonths(new Date(), 1), Const.DATE_FORMAT.YYYY_MM),
      '',
    ];

    if (creditId === Const.MARK.NO_SELECT.ID) {
      // 未選択項目は計算対象外
      return amountList;
    }

    for (const data of inputDatas) {
      const num = data[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM];
      if (
        !Util.checkInputMode(data, Const.INPUT_MODE.ALL_REQ) ||
        data[Const.MONEY_DIARY_COL_ID.CREDIT] !== creditId ||
        !Util.isValidInteger(num)
      ) {
        continue;
      }

      const payDate = Util.getPayDate(
        data[Const.MONEY_DIARY_COL_ID.USE_DATE] ||
          data[Const.MONEY_DIARY_COL_ID.DATE],
        data[Const.MONEY_DIARY_COL_ID.CREDIT],
        credit,
      );
      if (!payDate) {
        continue;
      }

      const month = format(payDate, Const.DATE_FORMAT.YYYY_MM);
      const findIdx = monthList.findIndex((mon) => mon === month);
      if (findIdx === -1) {
        continue;
      }

      amountList[findIdx] += num;
    }

    return amountList;
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
      id: Const.CREDIT_COL_ID.CLOSE_DAY,
      label: 'Close Day',
      value: rowData[Const.CREDIT_COL_ID.CLOSE_DAY],
      type: Const.INPUT_TYPE.NUM,
      required: true,
      initValue: initValues[Const.CREDIT_COL_ID.CLOSE_DAY],
      min: 1,
      max: 31,
    },
    {
      id: Const.CREDIT_COL_ID.PAY_DAY,
      label: 'Pay Day',
      value: rowData[Const.CREDIT_COL_ID.PAY_DAY],
      type: Const.INPUT_TYPE.NUM,
      required: true,
      initValue: initValues[Const.CREDIT_COL_ID.PAY_DAY],
      min: 1,
      max: 31,
    },
    {
      id: Const.CREDIT_COL_ID.PAY_MONTH,
      label: 'Pay Month',
      value: rowData[Const.CREDIT_COL_ID.PAY_MONTH],
      type: Const.INPUT_TYPE.NUM,
      required: true,
      initValue: initValues[Const.CREDIT_COL_ID.PAY_MONTH],
      min: 1,
      max: 12,
    },
    {
      id: Const.CREDIT_COL_ID.BUSINESS_DAYS,
      label: 'Business Days',
      value: rowData[Const.CREDIT_COL_ID.BUSINESS_DAYS],
      type: Const.INPUT_TYPE.SELECT,
      initValue: initValues[Const.CREDIT_COL_ID.BUSINESS_DAYS],
      options: Const.BUSINESS_DAYS_SELECT.map<DialogOption>((opt) => ({
        id: opt.id,
        label: opt.label,
      })),
    },
    {
      id: Const.CREDIT_COL_ID.CARD,
      label: 'Card',
      value: rowData[Const.CREDIT_COL_ID.CARD],
      required: true,
      initValue: initValues[Const.CREDIT_COL_ID.CARD],
    },
  ];
}
