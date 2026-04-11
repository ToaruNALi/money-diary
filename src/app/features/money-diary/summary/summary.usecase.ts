import { Injectable } from '@angular/core';

@Injectable()
export class SummaryUsecase {
  // // TODO: 後で改めて作成する必要あり
  // protected override createDialogInputData = (
  //   procInput: OpenDialogProcInput,
  // ): DialogCustomInputExt => {
  //   return {
  //     data: signal({}),
  //     param: {
  //       body: {
  //         items: [],
  //       },
  //     },
  //   };
  // };
  // protected override readonly createInputData = (
  //   _edtRows: Row[],
  //   _tbl: Tbl,
  //   _tblMap: TblMap,
  // ): DialogInput => {
  //   return {
  //     title: '',
  //     datas: [],
  //   };
  // };
  // /**
  //  * 列定義を返却する
  //  * @param inputDatas
  //  * @param itemDatas
  //  * @returns 列定義
  //  */
  // readonly getColDefs = (
  //   inputDatas: Row[],
  //   itemDatas: Row[],
  // ): ColDef<Row, ValType>[] => {
  //   const columnDefs: ColDef<Row, ValType>[] = [
  //     {
  //       headerName: 'Id',
  //       field: CMN_COL.ID,
  //       cellEditor: 'agTextCellEditor',
  //       hide: true,
  //     },
  //     {
  //       headerName: 'Date',
  //       field: SMR_COL.DATE,
  //       type: 'dateCol',
  //       pinned: 'left',
  //       width: 85,
  //       valueFormatter: (params) => {
  //         const val = params.value;
  //         if (!val || typeof val !== 'string') {
  //           return '';
  //         }
  //         return cvtDateToStr(new Date(val), DATE_FMT.YYYY_MM);
  //       },
  //       cellStyle: getCellCmnStyle,
  //     },
  //     {
  //       headerName: 'Income',
  //       field: SMR_COL.INCOME,
  //       type: 'numericCol',
  //       width: 110,
  //       comparator: this.compAmt,
  //       valueFormatter: (params) => cvtNumToPrice(params.value),
  //       cellStyle: (params) => this.getStylePrice(params.value),
  //     },
  //     {
  //       headerName: 'Expenses',
  //       field: SMR_COL.EXPENSES,
  //       type: 'numericCol',
  //       width: 110,
  //       comparator: this.compAmt,
  //       valueFormatter: (params) => cvtNumToPrice(params.value),
  //       cellStyle: (params) => this.getStylePrice(params.value),
  //     },
  //     {
  //       headerName: 'Inc And Exp',
  //       field: SMR_COL.INC_AND_EXP,
  //       type: 'numericCol',
  //       width: 110,
  //       comparator: this.compAmt,
  //       valueFormatter: (params) => cvtNumToPrice(params.value),
  //       cellStyle: (params) => this.getStylePrice(params.value),
  //     },
  //     {
  //       headerName: 'Savings',
  //       field: SMR_COL.SAVINGS,
  //       type: 'numericCol',
  //       width: 110,
  //       comparator: this.compAmt,
  //       valueFormatter: (params) => cvtNumToPrice(params.value),
  //       cellStyle: (params) => this.getStylePrice(params.value),
  //     },
  //     {
  //       headerName: 'Inc And Exp Hidden',
  //       field: SMR_COL.INC_AND_EXP_HIDDEN,
  //       type: 'numericCol',
  //       hide: true,
  //       comparator: this.compAmt,
  //       valueFormatter: (params) => cvtNumToPrice(params.value),
  //       cellStyle: (params) => this.getStylePrice(params.value),
  //     },
  //   ];
  //   for (const item of itemDatas) {
  //     const id = item[CMN_COL.ID];
  //     const label = item[CMN_COL.LABEL];
  //     if (id === NO_SELECT_VAL.ID || !label) {
  //       continue;
  //     }
  //     columnDefs.push({
  //       headerName: label.toString(),
  //       field: `${SMR_COL.ITEM}${id}`,
  //       type: 'numericCol',
  //       width: 110,
  //       comparator: this.compAmt,
  //       valueFormatter: (params) => cvtNumToPrice(params.value),
  //       cellStyle: (params) => this.getStylePrice(params.value),
  //     });
  //   }
  //   return columnDefs;
  // };
  // /**
  //  * 行データを初期化する
  //  * @param inputDatas
  //  * @param itemDatas
  //  * @returns 初期化後の行データ
  //  */
  // readonly getRows = (inputDatas: Row[], itemDatas: Row[]): Row[] => {
  //   const startDate: string = MNG_DATE.START;
  //   const endDate = new Date();
  //   // １．集計データテンプレート作成
  //   const sumDatas: Row[] = [];
  //   for (
  //     let date = startDate;
  //     differenceInCalendarMonths(endDate, date) >= 0;
  //     date = cvtDateToStr(addMonths(date, 1))
  //   ) {
  //     const sumData: Row = {};
  //     // 必須項目
  //     sumData[CMN_COL.ID] = getNewRowId(sumDatas);
  //     sumData[SMR_COL.DATE] = date;
  //     const keys = [
  //       SMR_COL.INCOME,
  //       SMR_COL.EXPENSES,
  //       SMR_COL.INC_AND_EXP,
  //       SMR_COL.SAVINGS,
  //       SMR_COL.INC_AND_EXP_HIDDEN,
  //     ];
  //     for (const key of keys) {
  //       sumData[key] = getTblDefVal(TBL.SUMMARY, key);
  //     }
  //     // 可変項目
  //     for (const item of itemDatas) {
  //       const id = item[CMN_COL.ID];
  //       const label = item[CMN_COL.LABEL];
  //       if (id === NO_SELECT_VAL.ID || !label) {
  //         continue;
  //       }
  //       sumData[`${SMR_COL.ITEM}${id}`] = getTblDefVal(
  //         TBL.SUMMARY,
  //         SMR_COL.ITEM,
  //       );
  //     }
  //     sumDatas.push(sumData);
  //   }
  //   // ２．集計データに収支入力データを反映
  //   for (const row of inputDatas) {
  //     if (!checkInputMode(row, INPUT_MODE.ALL_REQ)) {
  //       // 必須項目漏れあり
  //       continue;
  //     }
  //     const dateStr = row[MAIN_COL.DATE]!.toString();
  //     const startDateStr = cvtDateToStr(startOfMonth(dateStr));
  //     const sumData = sumDatas.find(
  //       (data) =>
  //         differenceInCalendarMonths(
  //           data[SMR_COL.DATE]!.toString(),
  //           startDateStr,
  //         ) === 0,
  //     );
  //     if (!sumData) {
  //       // 集計データ内に該当日付行なし
  //       continue;
  //     }
  //     const itemData = itemDatas.find(
  //       (item) => item[CMN_COL.ID] === row[MAIN_COL.ITEM],
  //     );
  //     if (!itemData) {
  //       continue;
  //     }
  //     // 収支を加算する
  //     const amountNum = Number(row[MAIN_COL.AMOUNT_NUM]);
  //     // SUMMARY_COUNT_FLG = true のデータのみ加算
  //     if (!!itemData[ITM_COL.SUMMARY_COUNT_FLG]) {
  //       if (amountNum > 0) {
  //         (sumData[SMR_COL.INCOME] as number) += amountNum;
  //       } else if (amountNum < 0) {
  //         (sumData[SMR_COL.EXPENSES] as number) += amountNum;
  //       }
  //       (sumData[SMR_COL.INC_AND_EXP] as number) += amountNum;
  //     }
  //     (sumData[SMR_COL.INC_AND_EXP_HIDDEN] as number) += amountNum;
  //     const sumColId = `${SMR_COL.ITEM}${itemData[CMN_COL.ID]!.toString()}`;
  //     if (sumColId in sumData) {
  //       (sumData[sumColId] as number) += amountNum;
  //     }
  //   }
  //   // ３．残高を計算
  //   let prevBalance = 0;
  //   for (const sumData of sumDatas) {
  //     const incAndExp = Number(sumData[SMR_COL.INC_AND_EXP_HIDDEN]);
  //     sumData[SMR_COL.SAVINGS] = prevBalance + incAndExp;
  //     prevBalance = Number(sumData[SMR_COL.SAVINGS]);
  //   }
  //   return sumDatas;
  // };
}
