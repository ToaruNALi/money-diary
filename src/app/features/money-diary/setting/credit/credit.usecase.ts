import { Injectable } from '@angular/core';
import { ColDef, ValueSetterParams } from 'ag-grid-community';
import { addMonths } from 'date-fns';
import { Row } from 'src/app/domain/row-data';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { ValType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DialogInputDatas,
  DialogOption,
} from 'src/app/shared/dialog-input/dialog-input.component';
import { MoneyStatus } from 'src/app/shared/money-status/money-status.component';

@Injectable()
export class CreditUsecase extends SettingUsecase {
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
    {
      headerName: 'Id',
      field: Const.CMN_COL.ID,
      cellEditor: 'agTextCellEditor',
      hide: true,
    },
    {
      headerName: 'Credit',
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
      headerName: 'Close',
      field: Const.CRD_COL.CLOSE_DAY,
      type: 'amountCol',
      hide: true,
      filter: false,
      width: 70,
      valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
    },
    {
      headerName: 'Pay',
      field: Const.CRD_COL.PAY_DAY,
      type: 'amountCol',
      hide: true,
      filter: false,
      width: 70,
      valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
    },
    {
      headerName: 'Pay Month',
      field: Const.CRD_COL.PAY_MONTH,
      type: 'amountCol',
      hide: true,
      filter: false,
      width: 100,
      valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
    },
    {
      headerName: 'Business Days',
      field: Const.CRD_COL.BUSINESS_DAYS,
      cellEditor: 'agSelectCellEditor',
      hide: true,
      filter: false,
      width: 120,
      valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
      valueFormatter: (params) =>
        Const.BIZ_DAYS_LIST.find((data) => data.id === params.value)?.lb ?? '',
      filterValueGetter: (params) =>
        Const.BIZ_DAYS_LIST.find(
          (data) => data.id === params.getValue(Const.CRD_COL.BUSINESS_DAYS),
        )?.lb ?? '',
    },
    {
      headerName: 'Card',
      field: Const.CRD_COL.CARD,
      cellEditor: 'agTextCellEditor',
      hide: true,
      filter: false,
      width: 110,
      valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
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
    {
      headerName: Util.getDate(
        addMonths(new Date(), -2),
        Const.DATE_FMT.YYYY_MM,
      ),
      field: Const.CRD_COL.EXPENSES_TWO_MONTHS_AGO,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: Util.getDate(
        addMonths(new Date(), -1),
        Const.DATE_FMT.YYYY_MM,
      ),
      field: Const.CRD_COL.EXPENSES_LAST_MONTH,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: Util.getDate(
        addMonths(new Date(), 0),
        Const.DATE_FMT.YYYY_MM,
      ),
      field: Const.CRD_COL.EXPENSES_THIS_MONTH,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: Util.getDate(
        addMonths(new Date(), 1),
        Const.DATE_FMT.YYYY_MM,
      ),
      field: Const.CRD_COL.EXPENSES_NEXT_MONTH,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
    {
      headerName: '',
      field: Const.CRD_COL.EXPENSES_CUSTOM_MONTH,
      type: 'numericCol',
      filter: false,
      width: 110,
    },
  ];

  private readonly amountSetter = (
    params: ValueSetterParams<Row, ValType>,
    inputDatas: Row[],
    credit: Row[],
  ): boolean => {
    if (!this.newValSetter(params)) {
      return false;
    }

    [
      params.data[Const.CRD_COL.EXPENSES_TWO_MONTHS_AGO],
      params.data[Const.CRD_COL.EXPENSES_LAST_MONTH],
      params.data[Const.CRD_COL.EXPENSES_THIS_MONTH],
      params.data[Const.CRD_COL.EXPENSES_NEXT_MONTH],
      params.data[Const.CRD_COL.EXPENSES_CUSTOM_MONTH],
    ] = this.getIncAndExp(inputDatas, credit, params.data[Const.CMN_COL.ID]);
    return true;
  };

  override readonly getRows = (
    rows: Row[],
    inputDatas: Row[],
    credit: Row[],
  ): Row[] => {
    const datas = structuredClone(rows);

    for (const data of datas) {
      [
        data[Const.CRD_COL.EXPENSES_TWO_MONTHS_AGO],
        data[Const.CRD_COL.EXPENSES_LAST_MONTH],
        data[Const.CRD_COL.EXPENSES_THIS_MONTH],
        data[Const.CRD_COL.EXPENSES_NEXT_MONTH],
        data[Const.CRD_COL.EXPENSES_CUSTOM_MONTH],
      ] = this.getIncAndExp(inputDatas, credit, data[Const.CMN_COL.ID]);
    }

    return datas;
  };

  private readonly getIncAndExp = (
    inputDatas: Row[],
    credit: Row[],
    creditId: ValType,
  ): number[] => {
    const amountList = [0, 0, 0, 0, 0];
    const monthList = [
      Util.getDate(addMonths(new Date(), -2), Const.DATE_FMT.YYYY_MM),
      Util.getDate(addMonths(new Date(), -1), Const.DATE_FMT.YYYY_MM),
      Util.getDate(addMonths(new Date(), 0), Const.DATE_FMT.YYYY_MM),
      Util.getDate(addMonths(new Date(), 1), Const.DATE_FMT.YYYY_MM),
      '',
    ];

    if (creditId === Const.MARK.NO_SELECT.id) {
      // 未選択項目は計算対象外
      return amountList;
    }

    for (const data of inputDatas) {
      const num = data[Const.MAIN_COL.AMOUNT_NUM];
      if (
        !Util.checkInputMode(data, Const.INPUT_MODE.ALL_REQ) ||
        data[Const.MAIN_COL.CREDIT] !== creditId ||
        !Util.isValidInt(num)
      ) {
        continue;
      }

      const payDate = Util.getPayDate(
        data[Const.MAIN_COL.USE_DATE],
        data[Const.MAIN_COL.CREDIT],
        credit,
      );
      if (!payDate) {
        continue;
      }

      const month = Util.getDate(payDate, Const.DATE_FMT.YYYY_MM);
      const findIdx = monthList.findIndex((mon) => mon === month);
      if (findIdx === -1) {
        continue;
      }

      amountList[findIdx] += num;
    }

    return amountList;
  };

  /**
   * 選択行の金額を計算して返却する
   * @param rows
   * @param colDefs
   * @returns
   */
  override readonly calcSelStatus = (
    rows: Row[],
    colDefs: ColDef<Row, any>[],
  ): MoneyStatus[] => {
    if (!colDefs.length) {
      // 初期表示時は列定義が取得不可のため、ステータス自体表示させない
      return [];
    }

    const statusInf = [
      { label: 'Cnt', id: '' },
      { label: '', id: Const.CRD_COL.EXPENSES_TWO_MONTHS_AGO },
      { label: '', id: Const.CRD_COL.EXPENSES_LAST_MONTH },
      { label: '', id: Const.CRD_COL.EXPENSES_THIS_MONTH },
      { label: '', id: Const.CRD_COL.EXPENSES_NEXT_MONTH },
      { label: '', id: Const.CRD_COL.EXPENSES_CUSTOM_MONTH },
    ];
    const status = statusInf.map((info) => ({
      id: info.id,
      label:
        colDefs.find((def) => def.field === info.id)?.headerName ?? info.label,
      amount: 0,
    }));
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
      id: Const.CRD_COL.CLOSE_DAY,
      label: 'Close Day',
      value: row[Const.CRD_COL.CLOSE_DAY],
      type: Const.INPUT_TYPE.NUM,
      required: true,
      initValue: initValues[Const.CRD_COL.CLOSE_DAY],
      min: 1,
      max: 31,
    },
    {
      id: Const.CRD_COL.PAY_DAY,
      label: 'Pay Day',
      value: row[Const.CRD_COL.PAY_DAY],
      type: Const.INPUT_TYPE.NUM,
      required: true,
      initValue: initValues[Const.CRD_COL.PAY_DAY],
      min: 1,
      max: 31,
    },
    {
      id: Const.CRD_COL.PAY_MONTH,
      label: 'Pay Month',
      value: row[Const.CRD_COL.PAY_MONTH],
      type: Const.INPUT_TYPE.NUM,
      required: true,
      initValue: initValues[Const.CRD_COL.PAY_MONTH],
      min: 1,
      max: 12,
    },
    {
      id: Const.CRD_COL.BUSINESS_DAYS,
      label: 'Business Days',
      value: row[Const.CRD_COL.BUSINESS_DAYS],
      type: Const.INPUT_TYPE.SELECT,
      initValue: initValues[Const.CRD_COL.BUSINESS_DAYS],
      options: Const.BIZ_DAYS_LIST.map<DialogOption>((opt) => ({
        id: opt.id,
        lb: opt.lb,
      })),
    },
    {
      id: Const.CRD_COL.CARD,
      label: 'Card',
      value: row[Const.CRD_COL.CARD],
      required: true,
      initValue: initValues[Const.CRD_COL.CARD],
    },
  ];
}
