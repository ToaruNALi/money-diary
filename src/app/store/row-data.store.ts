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
import { Row, TblInf, TblMap } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import {
  ColEdt,
  FilterInputModel,
  RowsKeyEdt,
  Tbl,
} from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import { ApiService } from 'src/app/shared/services/api.service';
import { FilterEdt } from './../shared/constants/types';

/** State */
type TblInfState = {
  loading: boolean;
  tblInf: TblInf;
  err?: any;
};

const initFn = <T>(initVal: T): Record<Tbl, T> => {
  const rec = {} as Record<Tbl, T>;
  for (const key of Object.values(Const.TBL)) {
    const tbl = key as Tbl;
    rec[tbl] = initVal;
  }
  return rec;
};

/** Initial State */
const initState: TblInfState = {
  loading: false,
  tblInf: {
    fm: initFn<FilterInputModel>('none'),
    rk: initFn<string>(''),
    rd: initFn<Row[]>([]),
    cd: initFn<Row[]>([]),
  },
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
    setTblInf: (tblInf: TblInf): void => {
      patchState(store, setTblInf(tblInf));
      apiService.saveTblInf(store.tblInf());
    },
    /** 行データ更新 */
    updRows: (tbl: Tbl, rows: Row[]): void => {
      patchState(store, updRows(tbl, rows));
      apiService.saveTblInf(store.tblInf());
    },
    /** フィルタモデル更新 */
    updFilterModel: ({ tbl, filter }: FilterEdt): void => {
      patchState(store, updFilterModel(tbl, filter));
      // apiService.saveTblInf(store.tblInf());
    },
    /** テーブルデータKey設定 */
    updRowsKey: ({ tbl, key }: RowsKeyEdt): void => {
      patchState(store, updRowsKey(tbl, key));
      apiService.saveTblInf(store.tblInf());
    },
    /** 列データKey設定 */
    updCol: ({ tbl, cols }: ColEdt): void => {
      patchState(store, updCol(tbl, cols));
      apiService.saveTblInf(store.tblInf());
    },
  })),
  // Event
  withHooks((store, apiService = inject(ApiService)) => ({
    onInit: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          apiService.loadTblInf().pipe(
            tapResponse({
              next: (data) => store.setTblInf(data),
              error: (err) => patchState(store, { err }),
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);

const setTblInf =
  (tblInf: TblInf): PartialStateUpdater<{ tblInf: TblInf }> =>
  (state) => {
    const tblMap = {} as TblMap;
    for (const [key, rows] of Object.entries(tblInf.rd)) {
      const tbl = key as Tbl;
      tblMap[tbl] = Util.getLoadRows(tbl, rows);
    }
    tblInf.rd = tblMap;

    return {
      tblInf: {
        ...state.tblInf,
        ...tblInf,
      },
    };
  };

/** 行データ更新 Updater */
const updRows =
  (tbl: Tbl, rows: Row[]): PartialStateUpdater<{ tblInf: TblInf }> =>
  (state) => ({
    tblInf: {
      ...state.tblInf,
      rd: {
        ...state.tblInf.rd,
        [tbl]: structuredClone(rows),
      },
    },
  });

/** フィルターモデル更新 */
const updFilterModel =
  (
    tbl: Tbl,
    filter: FilterInputModel,
  ): PartialStateUpdater<{ tblInf: TblInf }> =>
  (state) => ({
    tblInf: {
      ...state.tblInf,
      fm: {
        ...state.tblInf.fm,
        [tbl]: structuredClone(filter),
      },
    },
  });

/** データKey更新 */
const updRowsKey =
  (tbl: Tbl, key: string): PartialStateUpdater<{ tblInf: TblInf }> =>
  (state) => ({
    tblInf: {
      ...state.tblInf,
      rk: {
        ...state.tblInf.rk,
        [tbl]: structuredClone(key),
      },
    },
  });

/** 列データ更新 Updater */
const updCol =
  (tbl: Tbl, cols: Row[]): PartialStateUpdater<{ tblInf: TblInf }> =>
  (state) => ({
    tblInf: {
      ...state.tblInf,
      cd: {
        ...state.tblInf.cd,
        [tbl]: structuredClone(cols),
      },
    },
  });
