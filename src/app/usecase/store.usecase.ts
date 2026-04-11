import { computed, inject, Injectable } from '@angular/core';
import { MoneyDiaryData } from 'src/app/domain/money-diary-data';
import { Row } from 'src/app/domain/row-data';
import { ValType } from 'src/app/shared/signal-form/signal-form.component';
import {
  checkInputMode,
  CMN_COL,
  ColEdt,
  FilterEdt,
  getTblScrId,
  INPUT_MODE,
  RowEdt,
  RowsKeyEdt,
  TBL_ADD_POS,
  TBL_EDIT_TYPE,
} from 'src/app/shared/utils/util-row';
import { Scr, SCR_INF } from 'src/app/shared/utils/util-screen';
import { HistStore } from 'src/app/store/row-data-edit-history.store';
import { TblInfStore } from 'src/app/store/row-data.store';
import { ScrInfStore } from 'src/app/store/screen-info.store';
import { TmpStore } from 'src/app/store/temp-data.store';

/** 時間[ms] */
const TIME = {
  /** マップ表示 → 画面遷移 時間 */
  DISP_MAP_BEF_TRAN: 50,
  /** 画面遷移 → マップ非表示 時間 */
  DISP_MAP_AFT_TRAN: 250,
  /** 長押し時のマップ表示時間 */
  DISP_MAP_LONG_CLICK: 500,
  /** UNDO・REDOが行われるまでの時間 */
  UNDO_REDO_BEF: 300,
  /** ダブルクリック受付時間 */
  DOUBLE_CLICK: 180,
} as const;

@Injectable({
  providedIn: 'root',
})
export class StoreUsecase {
  readonly storeTblInf = inject(TblInfStore);
  readonly storeScr = inject(ScrInfStore);
  readonly storeHist = inject(HistStore);
  readonly storeTmp = inject(TmpStore);

  /** Loading All */
  readonly loadingAll = computed(() => {
    return (
      this.storeTblInf.loading() ||
      this.storeScr.loading() ||
      this.storeHist.loading()
    );
  });

  /** 画面遷移データ */
  readonly scrDatas = computed(() => {
    const scrId = this.storeScr.scrInf.si();
    const scrData = this.storeScr.scrInf.sd();
    return { ...SCR_INF[scrId], ...scrData[scrId] };
  });

  /** 画面遷移マップ表示フラグ */
  readonly mapDsp = computed(() => {
    return this.storeScr.scrInf.md() ? this.storeTmp.mapDsp() : false;
  });

  /** 非表示オプション */
  readonly hiddenOpts = computed(() => {
    const scrData = this.storeScr.scrInf.sd();
    const scrId = this.storeScr.scrInf.si();
    const oldScrId = this.storeScr.scrInf.oi();

    const next = scrData[scrId];
    const old = scrData[oldScrId];

    let prevAfterClass = 'hidden';
    const nextBeforeStyle: Record<string, any> = {
      display: 'none',
      position: 'absolute',
      top: 0,
    };

    if (!next || !old) {
      return {
        prevAfterClass,
        nextBeforeStyle,
      };
    }

    const dx = next.px - old.px;
    const dy = next.py - old.py;

    if (dx > 0) {
      if (dy > 0) {
        // right bottom
        prevAfterClass = 'hiddenLeftTop';
        nextBeforeStyle['transform'] = 'translate(100%, 100%)';
      } else if (dy < 0) {
        // right top
        prevAfterClass = 'hiddenLeftBottom';
        nextBeforeStyle['transform'] = 'translate(100%, -100%)';
      } else {
        // right
        prevAfterClass = 'hiddenLeft';
        nextBeforeStyle['transform'] = 'translate(100%, 0)';
      }
    } else if (dx < 0) {
      if (dy > 0) {
        // left bottom
        prevAfterClass = 'hiddenRightTop';
        nextBeforeStyle['transform'] = 'translate(-100%, 100%)';
      } else if (dy < 0) {
        // left top
        prevAfterClass = 'hiddenRightBottom';
        nextBeforeStyle['transform'] = 'translate(-100%, -100%)';
      } else {
        // left
        prevAfterClass = 'hiddenRight';
        nextBeforeStyle['transform'] = 'translate(-100%, 0)';
      }
    } else {
      if (dy > 0) {
        // bottom
        prevAfterClass = 'hiddenTop';
        nextBeforeStyle['transform'] = 'translate(0, 100%)';
      } else if (dy < 0) {
        // top
        prevAfterClass = 'hiddenBottom';
        nextBeforeStyle['transform'] = 'translate(0, -100%)';
      }
    }

    return {
      prevAfterClass,
      nextBeforeStyle,
    };
  });

  /**
   * 全データ取得
   */
  readonly allData = computed(() => {
    return {
      ti: this.storeTblInf.tblInf(),
      si: this.storeScr.scrInf(),
      rh: this.storeHist.hist(),
    } as MoneyDiaryData;
  });

  /**
   * 全データ設定
   * @param data
   */
  readonly setAllData = (data: MoneyDiaryData): void => {
    this.storeTblInf.setTblInf(data.ti);
    this.storeScr.setScrInf(data.si);
    this.storeHist.setHist(data.rh);
  };

  /**
   * Undo/Redo
   * @param undoRedo
   */
  readonly undoRedo = (undoRedo: boolean): void => {
    // 行データ編集前チェック
    const hist = structuredClone(this.storeHist.hist());
    if (
      (!undoRedo && hist.ix <= 0) ||
      (undoRedo && hist.ix >= hist.rd.length)
    ) {
      return;
    }
    // 履歴情報IDX更新
    this.storeHist.updHistIdx(undoRedo);
    // 画面遷移前チェック
    const histData = undoRedo ? hist.rd[hist.ix] : hist.ud[hist.ix - 1];
    const tbl = histData.at(-1)?.tbl;
    if (!tbl) {
      return;
    }
    // TODO: 履歴情報に画面情報を残すようにする
    const scrId = getTblScrId(tbl);
    if (!scrId) {
      return;
    }
    // 画面遷移
    if (scrId !== this.storeScr.scrInf.si()) {
      this.changeScr(scrId);
    }
    // テーブルデータKey
    const rowKey = histData.at(-1)?.rk ?? '';
    this.storeTblInf.updRowsKey({
      tbl,
      key: rowKey,
    });
    setTimeout(() => {
      // 画面遷移後に行データ編集
      this.setRowEdt(histData);
    }, TIME.UNDO_REDO_BEF);
  };

  /**
   * 行データ編集
   * @param rowEdt
   */
  readonly edtRows = (rowEdt: RowEdt[]): void => {
    // 履歴削除
    this.storeHist.delHist();
    // 行データ編集
    this.setRowEdt(rowEdt, true);
    // 履歴情報IDX更新
    this.storeHist.updHistIdx(true);
  };

  /**
   * 行データ編集Main
   * @param rowEdt
   * @param addHistFlg
   */
  private readonly setRowEdt = (
    rowEdt: RowEdt[],
    addHistFlg: boolean = false,
  ): void => {
    for (const edt of rowEdt) {
      const rows = this.storeTblInf.tblInf.rd()[edt.tbl];
      if (edt.type === TBL_EDIT_TYPE.ADD) {
        // 追加
        if (addHistFlg) {
          this.storeHist.updRowEdt(this.getRowEdtAddUndo(edt, edt.rows), edt);
        }
        this.storeTblInf.updRows(
          edt.tbl,
          this.getRowAdd(edt.rows, edt.addIds, rows),
        );
      } else if (edt.type === TBL_EDIT_TYPE.UPD) {
        // 更新
        if (addHistFlg) {
          this.storeHist.updRowEdt(
            this.getRowEdtUpdUndo(edt, edt.rows, rows),
            edt,
          );
        }
        this.storeTblInf.updRows(edt.tbl, this.getRowUpd(edt.rows, rows));
      } else if (edt.type === TBL_EDIT_TYPE.DEL) {
        // 削除
        if (addHistFlg) {
          this.storeHist.updRowEdt(
            this.getRowEdtDelUndo(edt, edt.delIds, rows),
            edt,
          );
        }
        this.storeTblInf.updRows(edt.tbl, this.getRowDel(edt.delIds, rows));
      } else if (edt.type === TBL_EDIT_TYPE.DRG) {
        // 移動
        if (addHistFlg) {
          this.storeHist.updRowEdt(
            this.getRowEdtDrgUndo(edt, edt.delIds, rows),
            edt,
          );
        }
        this.storeTblInf.updRows(
          edt.tbl,
          this.getRowDrg(edt.delIds, edt.addIds, rows),
        );
      }
    }

    // TODO: 空データをテーブルデータに含めないようにしたため、この処理は不要
    // if (addHistFlg) {
    //   const tblSet = new Set<Tbl>();
    //   for (const edt of rowEdt) {
    //     if (tblSet.has(edt.tbl)) {
    //       continue;
    //     }

    //     tblSet.add(edt.tbl);
    //     const rows = this.storeTblInf.tblInf.rd()[edt.tbl];
    //     if (checkNoneData(rows)) {
    //       continue;
    //     }

    //     const addEdt = getRowEdtAddNew(edt.tbl, rows);
    //     if (addEdt.type !== TBL_EDIT_TYPE.ADD) {
    //       continue;
    //     }

    //     this.storeHist.updRowEdt(
    //       this.getRowEdtAddUndo(addEdt, addEdt.rows),
    //       addEdt,
    //     );
    //     this.storeTblInf.updRows(
    //       addEdt.tbl,
    //       this.getRowAdd(addEdt.rows, addEdt.addIds, rows),
    //     );
    //   }
    // }
  };

  private readonly getRowEdtAddUndo = (edt: RowEdt, edtRows: Row[]): RowEdt => {
    return {
      ...edt,
      type: TBL_EDIT_TYPE.DEL,
      delIds: edtRows.map((row) => row[CMN_COL.ID]),
    };
  };

  private readonly getRowEdtUpdUndo = (
    edt: RowEdt,
    edtRows: Row[],
    stateRows: Row[],
  ): RowEdt => {
    const updRows: Row[] = [];
    for (const evtRow of edtRows) {
      const updRow = stateRows.find(
        (row) => row[CMN_COL.ID] === evtRow[CMN_COL.ID],
      );
      if (!!updRow) {
        updRows.push(updRow);
      }
    }
    // undo用更新データ作成
    return {
      ...edt,
      type: TBL_EDIT_TYPE.UPD,
      rows: updRows,
    };
  };

  private readonly getRowEdtDelUndo = (
    edt: RowEdt,
    edtDelIds: ValType[],
    stateRows: Row[],
  ): RowEdt => {
    const delIds = [...edtDelIds];
    const addRows: Row[] = [];
    const addIds: ValType[] = [];
    for (const [rowIdx, row] of stateRows.entries()) {
      const delIdx = delIds.findIndex((id) => id === row[CMN_COL.ID]);
      if (delIdx === -1) {
        continue;
      }
      delIds.splice(delIdx, 1);

      addRows.push(row);
      // 行追加するIDを算出
      for (let idx = rowIdx + 1; ; idx++) {
        if (!stateRows[idx]) {
          // 最下行に追加する必要がある場合nullを設定
          addIds.push(TBL_ADD_POS.MAX);
          break;
        }

        if (!delIds.includes(stateRows[idx][CMN_COL.ID])) {
          // 行追加するIDを設定
          addIds.push(stateRows[idx][CMN_COL.ID]!.toString());
          break;
        }
      }

      if (delIds.length === 0) {
        break;
      }
    }
    // undo用追加データ作成
    return {
      ...edt,
      type: TBL_EDIT_TYPE.ADD,
      rows: addRows,
      addIds,
    };
  };

  private readonly getRowEdtDrgUndo = (
    edt: RowEdt,
    edtDelIds: ValType[],
    stateRows: Row[],
  ): RowEdt => {
    const evtDelIds = [...edtDelIds];
    const delIds: ValType[] = [];
    const addIds: ValType[] = [];
    for (const [rowIdx, row] of stateRows.entries()) {
      const delIdx = evtDelIds.findIndex((id) => id === row[CMN_COL.ID]);
      if (delIdx === -1) {
        continue;
      }
      evtDelIds.splice(delIdx, 1);

      delIds.push(row[CMN_COL.ID]);
      // 行追加するIDを算出
      for (let idx = rowIdx + 1; ; idx++) {
        if (!stateRows[idx]) {
          // 最終行に追加する必要がある場合nullを設定
          addIds.push(null);
          break;
        }

        if (!evtDelIds.includes(stateRows[idx][CMN_COL.ID])) {
          // 行追加するIDを設定
          addIds.push(stateRows[idx][CMN_COL.ID]!.toString());
          break;
        }
      }

      if (evtDelIds.length === 0) {
        break;
      }
    }
    // undo用移動データ作成
    return {
      ...edt,
      type: TBL_EDIT_TYPE.DRG,
      delIds,
      addIds,
    };
  };

  private readonly getRowAdd = (
    edtRows: Row[],
    edtAddIds: ValType[],
    stateRows: Row[],
  ): Row[] => {
    const newRows = structuredClone(stateRows);
    for (const [idx, data] of edtRows.entries()) {
      const addIdx = newRows.findIndex(
        (row) => row[CMN_COL.ID] === edtAddIds[idx],
      );

      if (addIdx >= 0) {
        // 指定された追加行がある場合
        newRows.splice(addIdx, 0, data);
      } else {
        // 指定された追加行がない場合
        if (edtAddIds[idx] === TBL_ADD_POS.MIN) {
          // 最上行に追加の場合
          newRows.splice(0, 0, data);
        } else if (edtAddIds[idx] === TBL_ADD_POS.MAX) {
          // 最下行に追加の場合
          const lastRow = newRows.at(-1);
          if (!!lastRow && checkInputMode(lastRow, INPUT_MODE.NONE)) {
            // 最下行データがある、かつ空データの場合
            newRows.splice(newRows.length - 1, 0, data);
          } else {
            // 上記以外の場合
            newRows.push(data);
          }
        }
      }
    }
    return newRows;
  };

  private readonly getRowUpd = (edtRows: Row[], stateRows: Row[]): Row[] => {
    const newRows = structuredClone(stateRows);
    for (const row of edtRows) {
      for (let idx = 0; idx < newRows.length; idx++) {
        if (newRows[idx][CMN_COL.ID] === row[CMN_COL.ID]) {
          newRows[idx] = row;
          break;
        }
      }
    }
    return newRows;
  };

  private readonly getRowDel = (
    edtDelIds: ValType[],
    stateRows: Row[],
  ): Row[] => {
    const rows = structuredClone(stateRows);
    return rows.filter((row) => !edtDelIds.includes(row[CMN_COL.ID]));
  };

  private readonly getRowDrg = (
    edtDelIds: ValType[],
    edtAddIds: ValType[],
    stateRows: Row[],
  ): Row[] => {
    const rows = structuredClone(stateRows);
    const markDel = '_delete';
    for (const [idx, delId] of edtDelIds.entries()) {
      const drgRow = rows.find((row) => row[CMN_COL.ID] === delId);
      if (!drgRow) {
        continue;
      }

      const addIdx = rows.findIndex(
        (row) => row[CMN_COL.ID] === edtAddIds[idx],
      );

      if (addIdx >= 0) {
        // 指定された追加行がある場合
        rows.splice(addIdx, 0, structuredClone(drgRow));
      } else {
        // 指定された追加行がない場合
        if (edtAddIds[idx] === TBL_ADD_POS.MIN) {
          // 最上行に追加の場合
          rows.splice(0, 0, structuredClone(drgRow));
        } else if (edtAddIds[idx] === TBL_ADD_POS.MAX) {
          // 最下行に追加の場合
          const lastRow = rows.at(-1);
          if (!!lastRow && checkInputMode(lastRow, INPUT_MODE.NONE)) {
            // 最下行データがある、かつ空データの場合
            rows.splice(rows.length - 1, 0, structuredClone(drgRow));
          } else {
            // 上記以外の場合
            rows.push(structuredClone(drgRow));
          }
        }
      }
      drgRow[CMN_COL.ID] += markDel;
    }
    return rows.filter(
      (data) => !(data[CMN_COL.ID]?.toString() ?? '').endsWith(markDel),
    );
  };

  /**
   * 履歴情報リセット
   */
  readonly resetHist = (): void => {
    this.storeHist.resetHist();
  };

  /**
   * 画面遷移
   * @param scrId
   */
  readonly changeScr = (scrId?: Scr): void => {
    if (scrId === this.storeScr.scrInf.si()) {
      // すでに開いている場合は下記処理を実施しない
      return;
    }
    // タイマー初期化
    this.storeTmp.resetMapDspTimers();
    // マップ表示
    this.storeTmp.setMapDsp(true);
    // タイマー設定
    this.storeTmp.addMapDspTimer(
      setTimeout(() => {
        // 遷移予定画面ID初期化
        this.storeTmp.setNextScrId(null);
        // 画面ID設定
        this.storeScr.updScrId(scrId);
        // マップ表示
        this.storeTmp.setMapDsp(true);
        // タイマー設定
        this.storeTmp.addMapDspTimer(
          setTimeout(() => {
            // タイマー初期化
            this.storeTmp.resetMapDspTimers();
            // マップ非表示
            this.storeTmp.setMapDsp(false);
          }, TIME.DISP_MAP_AFT_TRAN),
        );
      }, TIME.DISP_MAP_BEF_TRAN),
    );
  };

  /**
   * 画面遷移マップ表示フラグ変更
   * @param mapDsp
   */
  readonly changeMapDsp = (mapDsp: boolean): void => {
    if (mapDsp) {
      // タイマー初期化
      this.storeTmp.resetMapDspTimers();
      // マップ表示
      this.storeTmp.setMapDsp(mapDsp);
    } else {
      // タイマー設定
      this.storeTmp.addMapDspTimer(
        setTimeout(() => {
          // タイマー初期化
          this.storeTmp.resetMapDspTimers();
          // マップ非表示
          this.storeTmp.setMapDsp(mapDsp);
        }, TIME.DISP_MAP_LONG_CLICK),
      );
    }
  };

  /**
   * フィルタモデル更新
   * @param filterEdt
   */
  readonly updFilterModel = (filterEdt: FilterEdt): void => {
    // フィルタモデル設定
    this.storeTblInf.updFilterModel(filterEdt);
    // 一定時間待機
    setTimeout(() => {
      // フィルタモデルリセット
      this.storeTblInf.updFilterModel({ ...filterEdt, filter: 'none' });
    });
  };

  /**
   * データKey更新
   * @param rowsKeyEdt
   */
  readonly updRowsKey = (rowsKeyEdt: RowsKeyEdt): void => {
    // データKey更新
    this.storeTblInf.updRowsKey(rowsKeyEdt);
  };

  /**
   * 列データ更新
   * @param colEdt
   */
  readonly updCol = (colEdt: ColEdt): void => {
    // データKey更新
    this.storeTblInf.updCol(colEdt);
  };
}
