/******************************
 * バックアップ(多分使わない)
 ******************************/

// const getCmnEditInfo = (
//   type: RowDataEditType,
//   tbl: Tbl,
//   rows: RowData[],
//   addIds: (string | null)[] = [],
// ): RowDataEdit => {
//   return {
//     type,
//     event: {
//       key: tbl,
//       datas: rows,
//       addIds,
//     },
//   };
// };

// export const setAddEditInfo = (
//   tbl: Tbl,
//   updRows: RowData[],
//   allRows: RowData[] = [],
//   editInfo: RowDataEdit[] = [],
// ): void => {
//   const addRows = structuredClone(updRows);
//   const addIds: (string | null)[] = [];
//   for (const row of addRows) {
//     row[Const.CMN_COL.ID] = getNewRowId(allRows);

//     const lastRow = allRows.at(-1);
//     if (!!lastRow && checkInputMode(lastRow, Const.INPUT_MODE.NONE)) {
//       // 最下行データがある、かつ空データの場合
//       allRows.splice(allRows.length - 1, 0, row);
//       addIds.push(lastRow[Const.CMN_COL.ID]?.toString() ?? null);
//     } else {
//       // 上記以外の場合
//       allRows.push(row);
//       addIds.push(null);
//     }
//   }

//   editInfo.push(getCmnEditInfo(Const.TBL_EDIT_TYPE.ADD, tbl, addRows, addIds));
// };

// export const getAddEditInfo = (
//   tbl: Tbl,
//   updRows: RowData[],
//   allRows: RowData[] = [],
//   editInfo: RowDataEdit[] = [],
// ): RowDataEdit[] => {
//   setAddEditInfo(tbl, updRows, allRows, editInfo);
//   return editInfo;
// };

// export const getAddDefEditInfo = (
//   tbl: Tbl,
//   allRows: RowData[] = [],
//   editInfo: RowDataEdit[] = [],
// ): RowDataEdit[] => {
//   return getAddEditInfo(
//     tbl,
//     [getTblDefRow(tbl)],
//     structuredClone(allRows), // 元データを編集しないので注意!!!
//     editInfo,
//   );
// };

// export const setUpdEditInfo = (
//   tbl: Tbl,
//   updRows: RowData[],
//   allRows: RowData[] = [],
//   editInfo: RowDataEdit[] = [],
// ): void => {
//   for (let idx = 0; idx < allRows.length; idx++) {
//     // 更新データの場合、更新後データに書き換える
//     const updRow = updRows.find(
//       (row) => row[Const.CMN_COL.ID] === allRows[idx][Const.CMN_COL.ID],
//     );
//     if (!!updRow) {
//       allRows[idx] = structuredClone(updRow);
//     }
//   }

//   editInfo.push(
//     getCmnEditInfo(
//       Const.TBL_EDIT_TYPE.UPD,
//       tbl,
//       updRows.map((row) => ({
//         ...row,
//         [Const.CMN_COL.UPDATE]: true,
//       })),
//     ),
//   );
// };

// export const getUpdEditInfo = (
//   tbl: Tbl,
//   updRows: RowData[],
//   allRows: RowData[] = [],
//   editInfo: RowDataEdit[] = [],
// ): RowDataEdit[] => {
//   setUpdEditInfo(tbl, updRows, allRows, editInfo);
//   return editInfo;
// };

// export const setDelEditInfo = (
//   tbl: Tbl,
//   updRows: RowData[],
//   allRows: RowData[] = [],
//   editInfo: RowDataEdit[] = [],
// ): void => {
//   const delRows: RowData[] = [];
//   for (const updRow of updRows) {
//     const delId = updRow[Const.CMN_COL.ID];
//     const delIdx = allRows.findIndex((row) => row[Const.CMN_COL.ID] === delId);
//     if (delIdx !== -1) {
//       // 削除データがある場合
//       allRows.splice(delIdx, 1);
//       delRows.push(structuredClone(updRow));
//     }
//   }

//   editInfo.push(getCmnEditInfo(Const.TBL_EDIT_TYPE.DEL, tbl, delRows));
// };

// export const getDelEditInfo = (
//   tbl: Tbl,
//   updRows: RowData[],
//   allRows: RowData[] = [],
//   editInfo: RowDataEdit[] = [],
// ): RowDataEdit[] => {
//   setDelEditInfo(tbl, updRows, allRows, editInfo);
//   return editInfo;
// };

// // export const setDrgEditInfo = ():

// export const getDrgEditInfo = (
//   tbl: Tbl,
//   rows: RowData[],
//   addIds: (string | null)[],
// ): RowDataEdit => {
//   return getCmnEditInfo(Const.TBL_EDIT_TYPE.DRAG, tbl, rows, addIds);
// };

// /** 日付文字列 ｰ> 日付 に変換する */
// export const cvtStrToDate = (value?: ValType): Date | null => {
//   if (!value || typeof value !== 'string') {
//     return null;
//   }

//   if (/\d{4}\-\d{2}\-\d{2} \d{2}\:\d{2}\:\d{2}/.test(value)) {
//     return new Date(value);
//   } else if (/\d{4}\-\d{2}\-\d{2}/.test(value)) {
//     return new Date(`${value} 00:00:00`);
//   }
//   return null;
// };

/******************************
 * バックアップ(使うかもしれない)
 ******************************/

// const clickCnt = signal(0);
// /**
//  * クリック処理
//  * @param clickTime 受付時間
//  * @param ...callback コールバックメソッド
//  */
// export const procClick = (
//   clickTime: number,
//   ...callback: (() => void)[]
// ): void => {
//   clickCnt.update((cnt) => (cnt < callback.length ? cnt + 1 : cnt));
//   if (callback.length === 0) {
//     return;
//   }

//   if (callback.length > 1 && clickCnt() >= callback.length) {
//     return;
//   }

//   setTimeout(() => {
//     callback[clickCnt() - 1]();
//     clickCnt.set(0);
//   }, clickTime);
// };
