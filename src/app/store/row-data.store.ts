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
import { RowData, RowDataMap } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import {
  RowDataAdd,
  RowDataDel,
  RowDataDrag,
  RowDataEditEvent,
  RowDataKey,
  RowDataUpd,
} from 'src/app/shared/constants/types';
import * as Usecase from 'src/app/shared/constants/usecases';
import { ApiService } from 'src/app/shared/services/api.service';

/** State */
type RowDataState = {
  loading: boolean;
  rowDataMap: RowDataMap;
  error?: any;
};

/** Initial State */
const initialState: RowDataState = {
  loading: false,
  rowDataMap: {} as RowDataMap,
};

/** Signal Store */
export const RowDataStore = signalStore(
  { providedIn: 'root' },
  // Redux DevTools Enable
  withDevtools('rowData'),
  // Initial State
  withState(initialState),
  // Method
  withMethods((store, apiService = inject(ApiService)) => ({
    /*+ 行データMap設定(※Loadのみ利用すること) */
    setRowDataMapOnLoad: (map: RowDataMap): void => {
      patchState(store, setRowDataMapOnLoad(map));
      apiService.saveRowDataMap(store.rowDataMap()).subscribe();
    },

    /** 行データMap設定 */
    setRowDataMap: (rowDataMap: RowDataMap): void => {
      patchState(store, { rowDataMap });
      apiService.saveRowDataMap(store.rowDataMap()).subscribe();
    },

    /** 行データ追加 */
    addRowData: (event: RowDataEditEvent): void => {
      patchState(store, addRowData(event as RowDataAdd));
      apiService
        .saveRowData(event.key, store.rowDataMap()[event.key])
        .subscribe();
    },

    /** 行データ更新 */
    updRowData: (event: RowDataEditEvent): void => {
      patchState(store, updRowData(event as RowDataUpd));
      apiService
        .saveRowData(event.key, store.rowDataMap()[event.key])
        .subscribe();
    },

    /** 行データ削除 */
    delRowData: (event: RowDataEditEvent): void => {
      patchState(store, delRowData(event as RowDataDel));
      apiService
        .saveRowData(event.key, store.rowDataMap()[event.key])
        .subscribe();
    },

    /** 行データ移動 */
    dragRowData: (event: RowDataEditEvent): void => {
      patchState(store, dragRowData(event as RowDataDrag));
      apiService
        .saveRowData(event.key, store.rowDataMap()[event.key])
        .subscribe();
    },
  })),
  // Event
  withHooks((store, apiService = inject(ApiService)) => ({
    onInit: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          apiService.loadRowDataMap().pipe(
            tapResponse({
              next: (data) => store.setRowDataMapOnLoad(data),
              error: (error) => patchState(store, { error }),
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);

const setRowDataMapOnLoad =
  (map: RowDataMap): PartialStateUpdater<{ rowDataMap: RowDataMap }> =>
  (_state) => {
    const result = {} as RowDataMap;
    for (const [rowDataKey, datas] of Object.entries(map)) {
      const key = rowDataKey as RowDataKey;
      result[key] = Usecase.editRowDataOnLoad(key, datas);
    }
    return { rowDataMap: result };
  };

/** 行データ設定 共通 */
const setRowDatasCommon = (
  state: any,
  key: RowDataKey,
  datas: RowData[],
): { rowDataMap: RowDataMap } => ({
  rowDataMap: {
    ...state.rowDataMap,
    [key]: structuredClone(datas),
  },
});

/** 行データ追加 Updater */
const addRowData =
  (add: RowDataAdd): PartialStateUpdater<{ rowDataMap: RowDataMap }> =>
  (state) => {
    const newDatas = structuredClone(state.rowDataMap[add.key]);

    for (const [idx, data] of add.datas.entries()) {
      const addIdx = newDatas.findIndex(
        (data) => data[Const.ROW_DATA_COMMON_COL_ID.ID] === add.addIds[idx],
      );

      if (addIdx >= 0) {
        newDatas.splice(addIdx, 0, data);
      } else {
        newDatas.push(data);
      }
    }

    return setRowDatasCommon(state, add.key, newDatas);
  };

/** 行データ更新 Updater */
const updRowData =
  (upd: RowDataUpd): PartialStateUpdater<{ rowDataMap: RowDataMap }> =>
  (state) => {
    const newDatas = structuredClone(state.rowDataMap[upd.key]);

    for (const data of upd.datas) {
      for (let idx = 0; idx < newDatas.length; idx++) {
        if (
          newDatas[idx][Const.ROW_DATA_COMMON_COL_ID.ID] ===
          data[Const.ROW_DATA_COMMON_COL_ID.ID]
        ) {
          newDatas[idx] = data;
          break;
        }
      }
    }

    return setRowDatasCommon(state, upd.key, newDatas);
  };

/** 行データ削除 Updater */
const delRowData =
  (del: RowDataDel): PartialStateUpdater<{ rowDataMap: RowDataMap }> =>
  (state) => {
    const datas = structuredClone(state.rowDataMap[del.key]);
    const delIds = del.datas.map(
      (data) => data[Const.ROW_DATA_COMMON_COL_ID.ID],
    );

    const newDatas = datas.filter(
      (data) => !delIds.includes(data[Const.ROW_DATA_COMMON_COL_ID.ID]),
    );

    return setRowDatasCommon(state, del.key, newDatas);
  };

/** 行データ移動 Updater */
const dragRowData =
  (drag: RowDataDrag): PartialStateUpdater<{ rowDataMap: RowDataMap }> =>
  (state) => {
    const datas = structuredClone(state.rowDataMap[drag.key]);
    const markDel = '_delete';

    for (let idx = 0; idx < drag.datas.length; idx++) {
      const id = drag.datas[idx][Const.ROW_DATA_COMMON_COL_ID.ID];
      const dragData = datas.find(
        (data) => data[Const.ROW_DATA_COMMON_COL_ID.ID] === id,
      );
      if (!dragData) {
        continue;
      }

      const dragIdx = datas.findIndex(
        (data) => data[Const.ROW_DATA_COMMON_COL_ID.ID] === drag.addIds[idx],
      );

      if (dragIdx >= 0) {
        datas.splice(dragIdx, 0, structuredClone(dragData));
      } else {
        datas.push(structuredClone(dragData));
      }
      dragData[Const.ROW_DATA_COMMON_COL_ID.ID] += markDel;
    }

    const newDatas = datas.filter(
      (data) =>
        !(data[Const.ROW_DATA_COMMON_COL_ID.ID]?.toString() ?? '').endsWith(
          markDel,
        ),
    );

    return setRowDatasCommon(state, drag.key, newDatas);
  };
