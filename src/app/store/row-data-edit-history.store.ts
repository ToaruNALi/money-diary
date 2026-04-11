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
import { Hist } from 'src/app/domain/row-data-edit-history';
import { ApiService } from 'src/app/shared/services/api.service';
import { RowEdt } from 'src/app/shared/utils/util-row';

/** 履歴保持最大件数 */
const HIST_MAX_LEN = 30;

/** State */
type HistState = {
  loading: boolean;
  hist: Hist;
  err?: any;
};

/** Initial State */
const initState: HistState = {
  loading: false,
  hist: {
    ix: 0,
    ud: [],
    rd: [],
  },
};

/** Signal Store */
export const HistStore = signalStore(
  { providedIn: 'root' },
  // Redux DevTools Enable
  withDevtools('hist'),
  // Initial State
  withState(initState),
  // Method
  withMethods((store, apiService = inject(ApiService)) => ({
    /** 履歴情報リセット */
    resetHist: (): void => {
      patchState(store, initState);
      apiService.saveHist(store.hist());
    },
    /** 行編集情報 履歴設定 */
    setHist: (hist: Hist): void => {
      patchState(store, setHist(hist));
      apiService.saveHist(store.hist());
    },
    /** 行編集情報 履歴IDX更新 */
    updHistIdx: (inc: boolean): void => {
      patchState(store, updHistIdx(inc));
      apiService.saveHist(store.hist());
    },
    /** 行編集情報 履歴削除 */
    delHist: (): void => {
      patchState(store, delHist());
      apiService.saveHist(store.hist());
    },
    /** 行編集情報 履歴更新 */
    updRowEdt: (undo: RowEdt, redo: RowEdt): void => {
      patchState(store, updRowEdt(undo, redo));
      apiService.saveHist(store.hist());
    },
  })),
  // Event
  withHooks((store, apiService = inject(ApiService)) => ({
    onInit: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          apiService.loadHist().pipe(
            tapResponse({
              next: (data) => store.setHist(data),
              error: (err) => patchState(store, { err }),
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);

/** 行編集情報 履歴設定 Updater */
const setHist =
  (hist: Hist): PartialStateUpdater<{ hist: Hist }> =>
  (state) => {
    return {
      hist: {
        ...state.hist,
        ...hist,
      },
    };
  };

/** 行編集情報 履歴IDX更新 Updater */
const updHistIdx =
  (increment: boolean): PartialStateUpdater<{ hist: Hist }> =>
  (state) => ({
    hist: {
      ...state.hist,
      ix: state.hist.ix + (increment ? 1 : -1),
    },
  });

/** 行編集情報 履歴削除 Updater */
const delHist = (): PartialStateUpdater<{ hist: Hist }> => (state) => {
  const hist = structuredClone(state.hist);
  hist.ud.length = hist.ix;
  hist.ud.push([]);

  hist.rd.length = hist.ix;
  hist.rd.push([]);

  if (hist.ix >= HIST_MAX_LEN) {
    // 履歴保持最大数に達した場合
    for (hist.ix; hist.ix > HIST_MAX_LEN - 1; hist.ix--) {
      hist.ud.shift();
      hist.rd.shift();
    }
  }

  return {
    hist: {
      ...state.hist,
      ix: hist.ix,
      ud: hist.ud,
      rd: hist.rd,
    },
  };
};

/** 行編集情報 履歴追加 Updater*/
const updRowEdt =
  (undo: RowEdt, redo: RowEdt): PartialStateUpdater<{ hist: Hist }> =>
  (state) => {
    const hist = structuredClone(state.hist);
    hist.ud[hist.ix] = [undo, ...hist.ud[hist.ix]];
    hist.rd[hist.ix] = [...hist.rd[hist.ix], redo];

    return {
      hist: {
        ...state.hist,
        ud: structuredClone(hist.ud),
        rd: structuredClone(hist.rd),
      },
    };
  };
