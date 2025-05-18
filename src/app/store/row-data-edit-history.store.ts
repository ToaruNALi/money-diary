import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  PartialStateUpdater,
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { RowData } from 'src/app/domain/row-data';
import { RowDataEditHistory } from 'src/app/domain/row-data-edit-history';
import * as Const from 'src/app/shared/constants/constants';
import {
  RowDataAdd,
  RowDataDel,
  RowDataDrag,
  RowDataEdit,
  RowDataUpd,
} from 'src/app/shared/constants/types';
import { ApiService } from 'src/app/shared/services/api.service';

/** State */
type RowDataEditHistoryState = {
  loading: boolean;
  history: RowDataEditHistory;
  error?: any;
};

/** Initial State */
const initialState: RowDataEditHistoryState = {
  loading: false,
  history: {
    ix: 0,
    ud: [],
    rd: [],
  },
};

/** Signal Store */
export const RowDataEditHistoryStore = signalStore(
  { providedIn: 'root' },
  // Redux DevTools Enable
  withDevtools('rowDataEditHistory'),
  // Initial State
  withState(initialState),
  // Method
  withMethods((store, apiService = inject(ApiService)) => ({
    /** 履歴情報リセット */
    resetHistory: (): void => {
      patchState(store, initialState);
      apiService.saveRowDataEditHistory(store.history());
    },

    /** 行編集情報 履歴設定 */
    setRowDataEdit: (history: RowDataEditHistory): void => {
      patchState(store, setRowDataEdit(history));
      apiService.saveRowDataEditHistory(store.history());
    },

    /** 行データ履歴IDX更新 */
    updHistoryIdx: (increment: boolean): void => {
      patchState(store, updHistoryIdx(increment));
      apiService.saveRowDataEditHistory(store.history());
    },

    /** 行編集情報 履歴削除 */
    delRowDataEdit: (): void => {
      patchState(store, delRowDataEdit());
      apiService.saveRowDataEditHistory(store.history());
    },

    /** 行追加情報 履歴追加 */
    setRowDataAdd: (edit: RowDataEdit): void => {
      patchState(store, setRowDataAdd(edit));
      apiService.saveRowDataEditHistory(store.history());
    },

    /** 行更新情報 履歴追加 */
    setRowDataUpd: (edit: RowDataEdit, datas: RowData[]): void => {
      patchState(store, setRowDataUpd(edit, datas));
      apiService.saveRowDataEditHistory(store.history());
    },

    /** 行削除情報 履歴追加 */
    setRowDataDel: (edit: RowDataEdit, datas: RowData[]): void => {
      patchState(store, setRowDataDel(edit, datas));
      apiService.saveRowDataEditHistory(store.history());
    },

    /** 行移動情報 履歴追加 */
    setRowDataDrag: (edit: RowDataEdit, datas: RowData[]): void => {
      patchState(store, setRowDataDrag(edit, datas));
      apiService.saveRowDataEditHistory(store.history());
    },
  })),
  // Event
  withHooks((store, apiService = inject(ApiService)) => ({
    onInit: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          apiService.loadRowDataEditHistory().pipe(
            tapResponse({
              next: (data) => store.setRowDataEdit(data),
              error: (error) => patchState(store, { error }),
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);

/** 履歴編集情報設定 Updater */
const setRowDataEdit =
  (
    history: RowDataEditHistory,
  ): PartialStateUpdater<{ history: RowDataEditHistory }> =>
  (state) => {
    return {
      history: {
        ...state.history,
        ...history,
      },
    };
  };

/** 行データ履歴IDX更新 */
const updHistoryIdx =
  (increment: boolean): PartialStateUpdater<{ history: RowDataEditHistory }> =>
  (state) => ({
    history: {
      ...state.history,
      ix: state.history.ix + (increment ? 1 : -1),
    },
  });

/** 行編集情報 履歴削除 */
const delRowDataEdit =
  (): PartialStateUpdater<{ history: RowDataEditHistory }> => (state) => {
    const history = structuredClone(state.history);
    history.ud.length = history.ix;
    history.ud.push([]);

    history.rd.length = history.ix;
    history.rd.push([]);

    if (history.ix >= Const.HISTORY_MAX_LEN) {
      // 履歴保持最大数に達した場合
      for (history.ix; history.ix > Const.HISTORY_MAX_LEN - 1; history.ix--) {
        history.ud.shift();
        history.rd.shift();
      }
    }

    return {
      history: {
        ...state.history,
        ix: history.ix,
        ud: history.ud,
        rd: history.rd,
      },
    };
  };

/** 行編集情報 履歴追加 共通 */
const setRowDataEditCommon = (
  state: { history: RowDataEditHistory },
  undo: RowDataEdit,
  redo: RowDataEdit,
): { history: RowDataEditHistory } => {
  const history = structuredClone(state.history);
  history.ud[history.ix] = [undo, ...history.ud[history.ix]];
  history.rd[history.ix] = [...history.rd[history.ix], redo];

  return {
    history: {
      ...state.history,
      ud: structuredClone(history.ud),
      rd: structuredClone(history.rd),
    },
  };
};

/** 行追加情報 履歴追加 Updater*/
const setRowDataAdd =
  (edit: RowDataEdit): PartialStateUpdater<{ history: RowDataEditHistory }> =>
  (state) => {
    const event = edit.event as RowDataAdd;
    // Undo用削除データ作成
    const undo: RowDataEdit = {
      type: Const.ROW_DATA_EDIT_TYPE.DEL,
      event: {
        key: event.key,
        datas: event.datas,
      } as RowDataDel,
    };
    return setRowDataEditCommon(state, undo, edit);
  };

/** 行更新情報 履歴追加 Updater */
const setRowDataUpd =
  (
    edit: RowDataEdit,
    datas: RowData[],
  ): PartialStateUpdater<{ history: RowDataEditHistory }> =>
  (state) => {
    const event = edit.event as RowDataUpd;
    const updDatas: RowData[] = [];
    for (const data of event.datas) {
      const updData = datas.find(
        (dt) =>
          dt[Const.ROW_DATA_COMMON_COL_ID.ID] ===
          data[Const.ROW_DATA_COMMON_COL_ID.ID],
      );
      if (!updData) {
        continue;
      }
      updDatas.push(updData);
    }
    // undo用更新データ作成
    const undo: RowDataEdit = {
      type: Const.ROW_DATA_EDIT_TYPE.UPD,
      event: {
        key: event.key,
        datas: updDatas,
      } as RowDataUpd,
    };
    return setRowDataEditCommon(state, undo, edit);
  };

/** 行削除情報 履歴追加 Updater */
const setRowDataDel =
  (
    edit: RowDataEdit,
    datas: RowData[],
  ): PartialStateUpdater<{ history: RowDataEditHistory }> =>
  (state) => {
    const event = edit.event as RowDataDel;
    const delIds = event.datas.map(
      (data) => data[Const.ROW_DATA_COMMON_COL_ID.ID],
    );
    const addDatas: RowData[] = [];
    const addIds: (string | null)[] = [];
    for (const [dataIdx, data] of datas.entries()) {
      const delIdx = delIds.findIndex(
        (id) => id === data[Const.ROW_DATA_COMMON_COL_ID.ID],
      );
      if (delIdx === -1) {
        continue;
      }
      delIds.splice(delIdx, 1);

      addDatas.push(data);
      // 行追加するIDを算出
      for (let idx = dataIdx + 1; ; idx++) {
        if (!datas[idx]) {
          // 最終行に追加する必要がある場合nullを設定
          addIds.push(null);
          break;
        }

        if (!delIds.includes(datas[idx][Const.ROW_DATA_COMMON_COL_ID.ID])) {
          // 行追加するIDを設定
          addIds.push(datas[idx][Const.ROW_DATA_COMMON_COL_ID.ID]!.toString());
          break;
        }
      }

      if (delIds.length === 0) {
        break;
      }
    }
    // undo用追加データ作成
    const undo: RowDataEdit = {
      type: Const.ROW_DATA_EDIT_TYPE.ADD,
      event: {
        key: event.key,
        datas: addDatas,
        addIds,
      } as RowDataAdd,
    };
    return setRowDataEditCommon(state, undo, edit);
  };

/** 行移動情報 履歴追加 Updater */
const setRowDataDrag =
  (
    edit: RowDataEdit,
    datas: RowData[],
  ): PartialStateUpdater<{ history: RowDataEditHistory }> =>
  (state) => {
    const event = edit.event as RowDataDrag;
    const delIds = event.datas.map(
      (data) => data[Const.ROW_DATA_COMMON_COL_ID.ID],
    );
    const addDatas: RowData[] = [];
    const addIds: (string | null)[] = [];
    for (const [dataIdx, data] of datas.entries()) {
      const delIdx = delIds.findIndex(
        (id) => id === data[Const.ROW_DATA_COMMON_COL_ID.ID],
      );
      if (delIdx === -1) {
        continue;
      }
      delIds.splice(delIdx, 1);

      addDatas.push(data);
      // 行追加するIDを算出
      for (let idx = dataIdx + 1; ; idx++) {
        if (!datas[idx]) {
          // 最終行に追加する必要がある場合nullを設定
          addIds.push(null);
          break;
        }

        if (!delIds.includes(datas[idx][Const.ROW_DATA_COMMON_COL_ID.ID])) {
          // 行追加するIDを設定
          addIds.push(datas[idx][Const.ROW_DATA_COMMON_COL_ID.ID]!.toString());
          break;
        }
      }

      if (delIds.length === 0) {
        break;
      }
    }
    // undo用移動データ作成
    const undo: RowDataEdit = {
      type: Const.ROW_DATA_EDIT_TYPE.DRAG,
      event: {
        key: event.key,
        datas: addDatas,
        addIds,
      } as RowDataDrag,
    };
    return setRowDataEditCommon(state, undo, edit);
  };
