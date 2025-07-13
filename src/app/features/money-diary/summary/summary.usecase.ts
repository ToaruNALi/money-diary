import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { addMonths, differenceInCalendarMonths, startOfMonth } from 'date-fns';
import { RowData } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import { ValueType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';

@Injectable()
export class SummaryUsecase {
  /**
   * 列定義を返却する
   * @param inputDatas
   * @param itemDatas
   * @returns 列定義
   */
  readonly getColDefs = (
    inputDatas: RowData[],
    itemDatas: RowData[],
  ): ColDef<RowData, ValueType>[] => {
    const columnDefs: ColDef<RowData, ValueType>[] = [
      {
        headerName: 'Id',
        field: Const.ROW_DATA_COMMON_COL_ID.ID,
        cellEditor: 'agTextCellEditor',
        hide: true,
      },
      {
        headerName: 'Date',
        field: Const.SUMMARY_COL_ID.DATE,
        type: 'dateCol',
        pinned: 'left',
        width: 85,
        valueFormatter: (params) => {
          const val = params.value;
          if (!val || typeof val !== 'string') {
            return '';
          }
          return Util.getDate(new Date(val), Const.DATE_FORMAT.YYYY_MM);
        },
        cellStyle: Util.getCellCommonStyle,
      },
      {
        headerName: 'Income',
        field: Const.SUMMARY_COL_ID.INCOME,
        type: 'numericCol',
        width: 110,
      },
      {
        headerName: 'Expenses',
        field: Const.SUMMARY_COL_ID.EXPENSES,
        type: 'numericCol',
        width: 110,
      },
      {
        headerName: 'Inc And Exp',
        field: Const.SUMMARY_COL_ID.INC_AND_EXP,
        type: 'numericCol',
        width: 110,
      },
      {
        headerName: 'Savings',
        field: Const.SUMMARY_COL_ID.SAVINGS,
        type: 'numericCol',
        width: 110,
      },
      {
        headerName: 'Inc And Exp Hidden',
        field: Const.SUMMARY_COL_ID.INC_AND_EXP_HIDDEN,
        type: 'numericCol',
        hide: true,
      },
    ];

    for (const item of itemDatas) {
      const id = item[Const.ROW_DATA_COMMON_COL_ID.ID];
      const label = item[Const.ROW_DATA_COMMON_COL_ID.LABEL];

      if (id === Const.MARK.NO_SELECT.ID || !label) {
        continue;
      }

      columnDefs.push({
        headerName: label.toString(),
        field: `${Const.SUMMARY_COL_ID.ITEM}${id}`,
        type: 'numericCol',
        width: 110,
      });
    }

    return columnDefs;
  };

  /**
   * 行データを初期化する
   * @param inputDatas
   * @param itemDatas
   * @returns 初期化後の行データ
   */
  readonly getRowDatas = (
    inputDatas: RowData[],
    itemDatas: RowData[],
  ): RowData[] => {
    const startDate: string = Const.MANAGEMENT_DATE.START;
    const endDate = new Date();

    // １．集計データテンプレート作成
    const sumDatas: RowData[] = [];
    for (
      let date = startDate;
      differenceInCalendarMonths(endDate, date) >= 0;
      date = Util.getDate(addMonths(date, 1))
    ) {
      const sumData: RowData = {};

      // 必須項目
      sumData[Const.ROW_DATA_COMMON_COL_ID.ID] = Util.createRowId(sumDatas);
      sumData[Const.SUMMARY_COL_ID.DATE] = date;
      const keys = [
        Const.SUMMARY_COL_ID.INCOME,
        Const.SUMMARY_COL_ID.EXPENSES,
        Const.SUMMARY_COL_ID.INC_AND_EXP,
        Const.SUMMARY_COL_ID.SAVINGS,
        Const.SUMMARY_COL_ID.INC_AND_EXP_HIDDEN,
      ];
      for (const key of keys) {
        sumData[key] = Util.getInitValue(Const.ROW_DATA_KEY.SUMMARY, key);
      }

      // 可変項目
      for (const item of itemDatas) {
        const id = item[Const.ROW_DATA_COMMON_COL_ID.ID];
        const label = item[Const.ROW_DATA_COMMON_COL_ID.LABEL];

        if (id === Const.MARK.NO_SELECT.ID || !label) {
          continue;
        }

        sumData[`${Const.SUMMARY_COL_ID.ITEM}${id}`] = Util.getInitValue(
          Const.ROW_DATA_KEY.SUMMARY,
          Const.SUMMARY_COL_ID.ITEM,
        );
      }

      sumDatas.push(sumData);
    }

    // ２．集計データに収支入力データを反映
    for (const rowData of inputDatas) {
      if (!Util.checkInputMode(rowData, Const.INPUT_MODE.ALL_REQ)) {
        // 必須項目漏れあり
        continue;
      }

      const dateStr = rowData[Const.MONEY_DIARY_COL_ID.DATE]!.toString();
      const startDateStr = Util.getDate(startOfMonth(dateStr));
      const sumData = sumDatas.find(
        (data) =>
          differenceInCalendarMonths(
            data[Const.SUMMARY_COL_ID.DATE]!.toString(),
            startDateStr,
          ) === 0,
      );

      if (!sumData) {
        // 集計データ内に該当日付行なし
        continue;
      }

      const itemData = itemDatas.find(
        (item) =>
          item[Const.ROW_DATA_COMMON_COL_ID.ID] ===
          rowData[Const.MONEY_DIARY_COL_ID.ITEM],
      );
      if (!itemData) {
        continue;
      }

      // 収支を加算する
      const amountNum = Number(rowData[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM]);

      // SUMMARY_COUNT_FLG = true のデータのみ加算
      if (!!itemData[Const.ITEM_COL_ID.SUMMARY_COUNT_FLG]) {
        if (amountNum > 0) {
          (sumData[Const.SUMMARY_COL_ID.INCOME] as number) += amountNum;
        } else if (amountNum < 0) {
          (sumData[Const.SUMMARY_COL_ID.EXPENSES] as number) += amountNum;
        }
        (sumData[Const.SUMMARY_COL_ID.INC_AND_EXP] as number) += amountNum;
      }
      (sumData[Const.SUMMARY_COL_ID.INC_AND_EXP_HIDDEN] as number) += amountNum;

      const sumColId = `${Const.SUMMARY_COL_ID.ITEM}${itemData[Const.ROW_DATA_COMMON_COL_ID.ID]!.toString()}`;
      if (sumColId in sumData) {
        (sumData[sumColId] as number) += amountNum;
      }
    }

    // ３．残高を計算
    let prevBalance = 0;
    for (const sumData of sumDatas) {
      const incAndExp = Number(
        sumData[Const.SUMMARY_COL_ID.INC_AND_EXP_HIDDEN],
      );

      sumData[Const.SUMMARY_COL_ID.SAVINGS] = prevBalance + incAndExp;
      prevBalance = Number(sumData[Const.SUMMARY_COL_ID.SAVINGS]);
    }

    return sumDatas;
  };
}
