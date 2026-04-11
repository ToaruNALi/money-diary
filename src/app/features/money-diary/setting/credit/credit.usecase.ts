import { Injectable } from '@angular/core';
import { max, min, required, SchemaPath } from '@angular/forms/signals';
import { ColDef, ValueSetterParams } from 'ag-grid-community';
import { addMonths } from 'date-fns';
import { Row } from 'src/app/domain/row-data';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import {
  BodyParamSchema,
  InputItems,
} from 'src/app/shared/dialog-custom-input/dialog-custom-input.component';
import { MoneyStatus } from 'src/app/shared/money-status/money-status.component';
import {
  NO_SELECT_VAL,
  SelectOption,
  ValType,
} from 'src/app/shared/signal-form/signal-form.component';
import { cvtNumToPrice, isValidInt } from 'src/app/shared/utils/util-formula';
import {
  BIZ_DAYS_LIST,
  checkInputMode,
  CMN_COL,
  CRD_COL,
  cvtDateToStr,
  DATE_FMT,
  getPayDate,
  INPUT_MODE,
  MAIN_COL,
} from 'src/app/shared/utils/util-row';

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
    ...this.addCmnColDefs([
      {
        headerName: 'Credit',
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
        headerName: 'Close',
        field: CRD_COL.CLOSE_DAY,
        type: 'amountCol',
        hide: true,
        filter: false,
        width: 70,
        valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
      },
      {
        headerName: 'Pay',
        field: CRD_COL.PAY_DAY,
        type: 'amountCol',
        hide: true,
        filter: false,
        width: 70,
        valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
      },
      {
        headerName: 'Pay Month',
        field: CRD_COL.PAY_MONTH,
        type: 'amountCol',
        hide: true,
        filter: false,
        width: 100,
        valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
      },
      {
        headerName: 'Business Days',
        field: CRD_COL.BUSINESS_DAYS,
        cellEditor: 'agSelectCellEditor',
        hide: true,
        filter: false,
        width: 120,
        valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
        valueFormatter: (params) =>
          BIZ_DAYS_LIST.find((data) => data.value === params.value)?.label ??
          '',
        filterValueGetter: (params) =>
          BIZ_DAYS_LIST.find(
            (data) => data.value === params.getValue(CRD_COL.BUSINESS_DAYS),
          )?.label ?? '',
      },
      {
        headerName: 'Card',
        field: CRD_COL.CARD,
        cellEditor: 'agTextCellEditor',
        hide: true,
        filter: false,
        width: 110,
        valueSetter: (params) => this.amountSetter(params, inputDatas, credit),
      },
      {
        headerName: cvtDateToStr(addMonths(new Date(), -2), DATE_FMT.YYYY_MM),
        field: CRD_COL.EXPENSES_TWO_MONTHS_AGO,
        type: 'numericCol',
        filter: false,
        width: 110,
        comparator: this.compAmt,
        valueFormatter: (params) => cvtNumToPrice(params.value),
        cellStyle: (params) => this.getStylePrice(params.value),
      },
      {
        headerName: cvtDateToStr(addMonths(new Date(), -1), DATE_FMT.YYYY_MM),
        field: CRD_COL.EXPENSES_LAST_MONTH,
        type: 'numericCol',
        filter: false,
        width: 110,
        comparator: this.compAmt,
        valueFormatter: (params) => cvtNumToPrice(params.value),
        cellStyle: (params) => this.getStylePrice(params.value),
      },
      {
        headerName: cvtDateToStr(addMonths(new Date(), 0), DATE_FMT.YYYY_MM),
        field: CRD_COL.EXPENSES_THIS_MONTH,
        type: 'numericCol',
        filter: false,
        width: 110,
        comparator: this.compAmt,
        valueFormatter: (params) => cvtNumToPrice(params.value),
        cellStyle: (params) => this.getStylePrice(params.value),
      },
      {
        headerName: cvtDateToStr(addMonths(new Date(), 1), DATE_FMT.YYYY_MM),
        field: CRD_COL.EXPENSES_NEXT_MONTH,
        type: 'numericCol',
        filter: false,
        width: 110,
        comparator: this.compAmt,
        valueFormatter: (params) => cvtNumToPrice(params.value),
        cellStyle: (params) => this.getStylePrice(params.value),
      },
      {
        headerName: '',
        field: CRD_COL.EXPENSES_CUSTOM_MONTH,
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
   * @param credit
   * @returns Setter
   */
  private readonly amountSetter = (
    params: ValueSetterParams<Row, ValType>,
    inputDatas: Row[],
    credit: Row[],
  ): boolean => {
    if (!this.newValSetter(params)) {
      return false;
    }

    [
      params.data[CRD_COL.EXPENSES_TWO_MONTHS_AGO],
      params.data[CRD_COL.EXPENSES_LAST_MONTH],
      params.data[CRD_COL.EXPENSES_THIS_MONTH],
      params.data[CRD_COL.EXPENSES_NEXT_MONTH],
      params.data[CRD_COL.EXPENSES_CUSTOM_MONTH],
    ] = this.getIncAndExp(inputDatas, credit, params.data[CMN_COL.ID]);
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
      [
        data[CRD_COL.EXPENSES_TWO_MONTHS_AGO],
        data[CRD_COL.EXPENSES_LAST_MONTH],
        data[CRD_COL.EXPENSES_THIS_MONTH],
        data[CRD_COL.EXPENSES_NEXT_MONTH],
        data[CRD_COL.EXPENSES_CUSTOM_MONTH],
      ] = this.getIncAndExp(inputDatas, credit, data[CMN_COL.ID]);
    }

    return datas;
  };

  /**
   * 収支を計算して返却する
   * @param inputDatas
   * @param credit
   * @param creditId
   * @returns 収支
   */
  private readonly getIncAndExp = (
    inputDatas: Row[],
    credit: Row[],
    creditId: ValType,
  ): number[] => {
    const amountList = [0, 0, 0, 0, 0];
    const monthList = [
      cvtDateToStr(addMonths(new Date(), -2), DATE_FMT.YYYY_MM),
      cvtDateToStr(addMonths(new Date(), -1), DATE_FMT.YYYY_MM),
      cvtDateToStr(addMonths(new Date(), 0), DATE_FMT.YYYY_MM),
      cvtDateToStr(addMonths(new Date(), 1), DATE_FMT.YYYY_MM),
      '',
    ];

    if (creditId === NO_SELECT_VAL.ID) {
      // 未選択項目は計算対象外
      return amountList;
    }

    for (const data of inputDatas) {
      const num = data[MAIN_COL.AMOUNT_NUM];
      if (
        !checkInputMode(data, INPUT_MODE.ALL_REQ) ||
        data[MAIN_COL.CREDIT] !== creditId ||
        !isValidInt(num)
      ) {
        continue;
      }

      const payDate = getPayDate(
        data[MAIN_COL.USE_DATE],
        data[MAIN_COL.CREDIT],
        credit,
      );
      if (!payDate) {
        continue;
      }

      const month = cvtDateToStr(payDate, DATE_FMT.YYYY_MM);
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
   * @returns 選択行のステータス
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
      { label: '', id: CRD_COL.EXPENSES_TWO_MONTHS_AGO },
      { label: '', id: CRD_COL.EXPENSES_LAST_MONTH },
      { label: '', id: CRD_COL.EXPENSES_THIS_MONTH },
      { label: '', id: CRD_COL.EXPENSES_NEXT_MONTH },
      { label: '', id: CRD_COL.EXPENSES_CUSTOM_MONTH },
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
      id: CRD_COL.CLOSE_DAY,
      label: 'Close Day',
      type: 'number',
      defVal: defRow[CRD_COL.CLOSE_DAY],
    },
    {
      id: CRD_COL.PAY_DAY,
      label: 'Pay Day',
      type: 'number',
      defVal: defRow[CRD_COL.PAY_DAY],
    },
    {
      id: CRD_COL.PAY_MONTH,
      label: 'Pay Month',
      type: 'number',
      defVal: defRow[CRD_COL.PAY_MONTH],
    },
    {
      id: CRD_COL.BUSINESS_DAYS,
      label: 'Business Days',
      type: 'select',
      defVal: defRow[CRD_COL.BUSINESS_DAYS],
      options: BIZ_DAYS_LIST.map<SelectOption>((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    },
    {
      id: CRD_COL.CARD,
      label: 'Card',
    },
  ];

  /**
   * ダイアログスキーマ返却(custom)
   * @param tree
   * @returns ダイアログスキーマ
   */
  protected override readonly getDialogSchemaCustom: BodyParamSchema = (
    tree,
  ) => {
    required(tree[CRD_COL.CLOSE_DAY]);
    required(tree[CRD_COL.PAY_DAY]);
    required(tree[CRD_COL.PAY_MONTH]);
    required(tree[CRD_COL.CARD]);
    min(tree[CRD_COL.CLOSE_DAY] as SchemaPath<number>, 1);
    max(tree[CRD_COL.CLOSE_DAY] as SchemaPath<number>, 31);
    min(tree[CRD_COL.PAY_DAY] as SchemaPath<number>, 1);
    max(tree[CRD_COL.PAY_DAY] as SchemaPath<number>, 31);
    min(tree[CRD_COL.PAY_MONTH] as SchemaPath<number>, 1);
    max(tree[CRD_COL.PAY_MONTH] as SchemaPath<number>, 12);
  };
}
