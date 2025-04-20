import { computed, inject, Injectable } from '@angular/core';
import { MoneyDiaryData } from 'src/app/domain/money-diary-data';
import * as Const from 'src/app/shared/constants/constants';
import {
  FilterInputModel,
  RowDataEdit,
  ScreenId,
} from 'src/app/shared/constants/types';
import { RowDataEditHistoryStore } from 'src/app/store/row-data-edit-history.store';
import { RowDataStore } from 'src/app/store/row-data.store';
import { ScreenInfoStore } from 'src/app/store/screen-info.store';
import { TempDataStore } from 'src/app/store/temp-data.store';

@Injectable({
  providedIn: 'root',
})
export class StoreUsecase {
  readonly storeRowData = inject(RowDataStore);
  readonly storeScreen = inject(ScreenInfoStore);
  readonly storeHistory = inject(RowDataEditHistoryStore);
  readonly storeTemp = inject(TempDataStore);

  /** Loading All */
  readonly loadingAll = computed(() => {
    return (
      this.storeRowData.loading() ||
      this.storeScreen.loading() ||
      this.storeHistory.loading()
    );
  });

  /** 画面遷移データ */
  readonly screenDatas = computed(() => {
    const screenId = this.storeScreen.screenInfo.si();
    const screenDatas = this.storeScreen.screenInfo.sd();
    const data = screenDatas.find((data) => data.id === screenId)!;
    const info = Const.SCREEN_INFO.find((info) => info.id === screenId)!;

    return { ...info, ...data };
  });

  /** 画面遷移マップ表示フラグ */
  readonly mapDisp = computed(() => {
    return this.storeScreen.screenInfo.md() ? this.storeTemp.mapDisp() : false;
  });

  /** 非表示オプション */
  readonly hiddenOptions = computed(() => {
    const datas = this.storeScreen.screenInfo.sd();
    const screenId = this.storeScreen.screenInfo.si();
    const oldScreenId = this.storeScreen.screenInfo.oi();

    const next = datas.find((data) => data.id === screenId);
    const old = datas.find((data) => data.id === oldScreenId);

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
      rm: this.storeRowData.rowDataMap(),
      si: this.storeScreen.screenInfo(),
      rh: this.storeHistory.history(),
    } as MoneyDiaryData;
  });

  /**
   * 全データ設定
   * @param data
   */
  readonly setAllData = (data: MoneyDiaryData): void => {
    this.storeRowData.setRowDataMapOnLoad(data.rm);
    this.storeScreen.setScreenInfo(data.si);
    this.storeHistory.setRowDataEdit(data.rh);
  };

  /**
   * Undo/Redo
   * @param undoRedo
   */
  readonly undoRedo = (undoRedo: boolean): void => {
    // 行データ編集前チェック
    const history = structuredClone(this.storeHistory.history());
    if (
      (!undoRedo && history.ix <= 0) ||
      (undoRedo && history.ix >= history.rd.length)
    ) {
      return;
    }
    // 履歴情報IDX更新
    this.storeHistory.updHistoryIdx(undoRedo);
    // 画面遷移前チェック
    const historyEditDatas = undoRedo
      ? history.rd[history.ix]
      : history.ud[history.ix - 1];
    const rowDataKey = historyEditDatas.at(-1)?.event.key;
    if (!rowDataKey) {
      return;
    }
    const screenId = Const.ROW_DATA_INFO[rowDataKey].screenId;
    if (!screenId) {
      return;
    }
    // 画面遷移
    if (screenId !== this.storeScreen.screenInfo.si()) {
      this.changeScreen(screenId);
    }
    setTimeout(() => {
      // 画面遷移後に行データ編集
      this.editRowDataMain(historyEditDatas);
    }, Const.TIME_MILI.UNDO_REDO_BEFORE);
  };

  /**
   * 行データ編集
   * @param editDatas
   */
  readonly editRowData = (editDatas: RowDataEdit[]): void => {
    // 履歴削除
    this.storeHistory.delRowDataEdit();
    // 行データ編集
    this.editRowDataMain(editDatas, true);
    // 履歴情報IDX更新
    this.storeHistory.updHistoryIdx(true);
  };

  /**
   * 行データ編集Main
   * @param editDatas
   * @param addHistory
   */
  private readonly editRowDataMain = (
    editDatas: RowDataEdit[],
    addHistory: boolean = false,
  ): void => {
    for (const edit of editDatas) {
      if (edit.type === Const.ROW_DATA_EDIT_TYPE.ADD) {
        // 追加
        if (addHistory) {
          this.storeHistory.setRowDataAdd(edit);
        }
        this.storeRowData.addRowData(edit.event);
      } else if (edit.type === Const.ROW_DATA_EDIT_TYPE.UPD) {
        // 更新
        if (addHistory) {
          this.storeHistory.setRowDataUpd(
            edit,
            this.storeRowData.rowDataMap()[edit.event.key],
          );
        }
        this.storeRowData.updRowData(edit.event);
      } else if (edit.type === Const.ROW_DATA_EDIT_TYPE.DEL) {
        // 削除
        if (addHistory) {
          this.storeHistory.setRowDataDel(
            edit,
            this.storeRowData.rowDataMap()[edit.event.key],
          );
        }
        this.storeRowData.delRowData(edit.event);
      } else if (edit.type === Const.ROW_DATA_EDIT_TYPE.DRAG) {
        // 移動
        if (addHistory) {
          this.storeHistory.setRowDataDrag(
            edit,
            this.storeRowData.rowDataMap()[edit.event.key],
          );
        }
        this.storeRowData.dragRowData(edit.event);
      }
    }
  };

  /**
   * 履歴情報リセット
   */
  readonly resetHistory = (): void => {
    this.storeHistory.resetHistory();
  };

  /**
   * 画面遷移
   * @param screenId
   */
  readonly changeScreen = (screenId?: ScreenId): void => {
    if (screenId === this.storeScreen.screenInfo.si()) {
      // すでに開いている場合は下記処理を実施しない
      return;
    }
    // タイマー初期化
    this.storeTemp.resetMapDispTimers();
    // マップ表示
    this.storeTemp.setMapDisp(true);
    // タイマー設定
    this.storeTemp.addMapDispTimer(
      setTimeout(() => {
        // 画面ID設定
        this.storeScreen.updScreenId(screenId);
        // マップ表示
        this.storeTemp.setMapDisp(true);
        // タイマー設定
        this.storeTemp.addMapDispTimer(
          setTimeout(() => {
            // タイマー初期化
            this.storeTemp.resetMapDispTimers();
            // マップ非表示
            this.storeTemp.setMapDisp(false);
          }, Const.TIME_MILI.DISP_MAP_AFTER_TRAN),
        );
      }, Const.TIME_MILI.DISP_MAP_BEFORE_TRAN),
    );
  };

  /**
   * 画面遷移マップ表示フラグ変更
   * @param mapDisp
   */
  readonly changeMapDisp = (mapDisp: boolean): void => {
    if (mapDisp) {
      // タイマー初期化
      this.storeTemp.resetMapDispTimers();
      // マップ表示
      this.storeTemp.setMapDisp(mapDisp);
    } else {
      // タイマー設定
      this.storeTemp.addMapDispTimer(
        setTimeout(() => {
          // タイマー初期化
          this.storeTemp.resetMapDispTimers();
          // マップ非表示
          this.storeTemp.setMapDisp(mapDisp);
        }, Const.TIME_MILI.DISP_MAP_LONG_CLICK),
      );
    }
  };

  /**
   * フィルタモデル設定
   * @param model
   */
  readonly setFilterInputModel = (model: FilterInputModel): void => {
    // フィルタモデル設定
    this.storeTemp.setFilterInputModel(model);
    // 一定時間待機
    setTimeout(() => {
      // フィルタモデルリセット
      this.storeTemp.setFilterInputModel('none');
    });
  };
}
