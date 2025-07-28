import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { addMonths, differenceInCalendarMonths, startOfMonth } from 'date-fns';
import { Row } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import { ValType } from 'src/app/shared/constants/types';
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
    inputDatas: Row[],
    itemDatas: Row[],
  ): ColDef<Row, ValType>[] => {
    const columnDefs: ColDef<Row, ValType>[] = [
      {
        headerName: 'Id',
        field: Const.CMN_COL.ID,
        cellEditor: 'agTextCellEditor',
        hide: true,
      },
      {
        headerName: 'Date',
        field: Const.SMR_COL.DATE,
        type: 'dateCol',
        pinned: 'left',
        width: 85,
        valueFormatter: (params) => {
          const val = params.value;
          if (!val || typeof val !== 'string') {
            return '';
          }
          return Util.getDate(new Date(val), Const.DATE_FMT.YYYY_MM);
        },
        cellStyle: Util.getCellCmnStyle,
      },
      {
        headerName: 'Income',
        field: Const.SMR_COL.INCOME,
        type: 'numericCol',
        width: 110,
      },
      {
        headerName: 'Expenses',
        field: Const.SMR_COL.EXPENSES,
        type: 'numericCol',
        width: 110,
      },
      {
        headerName: 'Inc And Exp',
        field: Const.SMR_COL.INC_AND_EXP,
        type: 'numericCol',
        width: 110,
      },
      {
        headerName: 'Savings',
        field: Const.SMR_COL.SAVINGS,
        type: 'numericCol',
        width: 110,
      },
      {
        headerName: 'Inc And Exp Hidden',
        field: Const.SMR_COL.INC_AND_EXP_HIDDEN,
        type: 'numericCol',
        hide: true,
      },
    ];

    for (const item of itemDatas) {
      const id = item[Const.CMN_COL.ID];
      const label = item[Const.CMN_COL.LABEL];

      if (id === Const.MARK.NO_SELECT.id || !label) {
        continue;
      }

      columnDefs.push({
        headerName: label.toString(),
        field: `${Const.SMR_COL.ITEM}${id}`,
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
  readonly getRows = (inputDatas: Row[], itemDatas: Row[]): Row[] => {
    const startDate: string = Const.MNG_DATE.START;
    const endDate = new Date();

    // １．集計データテンプレート作成
    const sumDatas: Row[] = [];
    for (
      let date = startDate;
      differenceInCalendarMonths(endDate, date) >= 0;
      date = Util.getDate(addMonths(date, 1))
    ) {
      const sumData: Row = {};

      // 必須項目
      sumData[Const.CMN_COL.ID] = Util.getNewRowId(sumDatas);
      sumData[Const.SMR_COL.DATE] = date;
      const keys = [
        Const.SMR_COL.INCOME,
        Const.SMR_COL.EXPENSES,
        Const.SMR_COL.INC_AND_EXP,
        Const.SMR_COL.SAVINGS,
        Const.SMR_COL.INC_AND_EXP_HIDDEN,
      ];
      for (const key of keys) {
        sumData[key] = Util.getTblDefVal(Const.TBL.SUMMARY, key);
      }

      // 可変項目
      for (const item of itemDatas) {
        const id = item[Const.CMN_COL.ID];
        const label = item[Const.CMN_COL.LABEL];

        if (id === Const.MARK.NO_SELECT.id || !label) {
          continue;
        }

        sumData[`${Const.SMR_COL.ITEM}${id}`] = Util.getTblDefVal(
          Const.TBL.SUMMARY,
          Const.SMR_COL.ITEM,
        );
      }

      sumDatas.push(sumData);
    }

    // ２．集計データに収支入力データを反映
    for (const row of inputDatas) {
      if (!Util.checkInputMode(row, Const.INPUT_MODE.ALL_REQ)) {
        // 必須項目漏れあり
        continue;
      }

      const dateStr = row[Const.MAIN_COL.DATE]!.toString();
      const startDateStr = Util.getDate(startOfMonth(dateStr));
      const sumData = sumDatas.find(
        (data) =>
          differenceInCalendarMonths(
            data[Const.SMR_COL.DATE]!.toString(),
            startDateStr,
          ) === 0,
      );

      if (!sumData) {
        // 集計データ内に該当日付行なし
        continue;
      }

      const itemData = itemDatas.find(
        (item) => item[Const.CMN_COL.ID] === row[Const.MAIN_COL.ITEM],
      );
      if (!itemData) {
        continue;
      }

      // 収支を加算する
      const amountNum = Number(row[Const.MAIN_COL.AMOUNT_NUM]);

      // SUMMARY_COUNT_FLG = true のデータのみ加算
      if (!!itemData[Const.ITM_COL.SUMMARY_COUNT_FLG]) {
        if (amountNum > 0) {
          (sumData[Const.SMR_COL.INCOME] as number) += amountNum;
        } else if (amountNum < 0) {
          (sumData[Const.SMR_COL.EXPENSES] as number) += amountNum;
        }
        (sumData[Const.SMR_COL.INC_AND_EXP] as number) += amountNum;
      }
      (sumData[Const.SMR_COL.INC_AND_EXP_HIDDEN] as number) += amountNum;

      const sumColId = `${Const.SMR_COL.ITEM}${itemData[Const.CMN_COL.ID]!.toString()}`;
      if (sumColId in sumData) {
        (sumData[sumColId] as number) += amountNum;
      }
    }

    // ３．残高を計算
    let prevBalance = 0;
    for (const sumData of sumDatas) {
      const incAndExp = Number(sumData[Const.SMR_COL.INC_AND_EXP_HIDDEN]);

      sumData[Const.SMR_COL.SAVINGS] = prevBalance + incAndExp;
      prevBalance = Number(sumData[Const.SMR_COL.SAVINGS]);
    }

    return sumDatas;
  };
}
