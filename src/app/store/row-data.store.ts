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
import { Row, TblMap } from 'src/app/domain/row-data';
import { Tbl } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import { ApiService } from 'src/app/shared/services/api.service';

/** State */
type TblInfState = {
  loading: boolean;
  tblMap: TblMap;
  err?: any;
};

/** Initial State */
const initState: TblInfState = {
  loading: false,
  tblMap: {} as TblMap,
};

/** Signal Store */
export const TblInfStore = signalStore(
  { providedIn: 'root' },
  // Redux DevTools Enable
  withDevtools('tblInf'),
  // Initial State
  withState(initState),
  // Method
  withMethods((store, apiService = inject(ApiService)) => ({
    /*+ 行データMap設定(※Loadのみ利用すること) */
    setTblMapOnLoad: (map: TblMap): void => {
      patchState(store, setTblMapOnLoad(map));
      apiService.saveTblMap(store.tblMap()).subscribe();
    },
    /** 行データ更新 */
    updRows: (tbl: Tbl, rows: Row[]): void => {
      patchState(store, updRows(tbl, rows));
      apiService.saveRows(tbl, store.tblMap()[tbl]).subscribe();
    },
  })),
  // Event
  withHooks((store, apiService = inject(ApiService)) => ({
    onInit: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          apiService.loadTblMap().pipe(
            tapResponse({
              next: (data) => store.setTblMapOnLoad(data),
              error: (err) => patchState(store, { err }),
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);

const setTblMapOnLoad =
  (map: TblMap): PartialStateUpdater<{ tblMap: TblMap }> =>
  (_state) => {
    const result = {} as TblMap;
    for (const [key, rows] of Object.entries(map)) {
      const tbl = key as Tbl;
      result[tbl] = Util.getLoadRows(tbl, rows);
    }
    return { tblMap: result };
  };

/** 行データ更新 Updater */
const updRows =
  (tbl: Tbl, rows: Row[]): PartialStateUpdater<{ tblMap: TblMap }> =>
  (state) => ({
    tblMap: {
      ...state.tblMap,
      [tbl]: structuredClone(rows),
    },
  });
