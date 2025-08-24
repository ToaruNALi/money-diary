import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  PartialStateUpdater,
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';
import * as Const from 'src/app/shared/constants/constants';
import {
  FilterEdt,
  FilterInputModel,
  Scr,
  Tbl,
} from 'src/app/shared/constants/types';

/** State */
type TmpState = {
  /** 画面遷移マップ表示フラグ */
  mapDsp: boolean;
  /** 遷移予定画面ID */
  nextScrId: Scr | null;
  /** 画面遷移マップ表示タイマー */
  mapDspTimers: any[];
  /** 入力画面フィルタ情報 */
  filterModel: Record<Tbl, FilterInputModel>;
  /** 過去データ編集可能フラグ */
  edtPastData: boolean;
};

/** Initial State */
const initState: TmpState = {
  mapDsp: false,
  nextScrId: null,
  mapDspTimers: [],
  filterModel: (() => {
    const rec = {} as Record<Tbl, FilterInputModel>;
    for (const key of Object.values(Const.TBL)) {
      const tbl = key as Tbl;
      rec[tbl] = 'none';
    }
    return rec;
  })(),
  edtPastData: true, // false
};

/** Signal Store */
export const TmpStore = signalStore(
  { providedIn: 'root' },
  // Redux DevTools Enable
  withDevtools('tmp'),
  // Initial State
  withState(initState),
  // Method
  withMethods((store) => ({
    /** 画面遷移マップ表示フラグ設定 */
    setMapDsp: (mapDsp: boolean): void => {
      patchState(store, { mapDsp });
    },
    /** 遷移予定画面ID設定 */
    setNextScrId: (nextScrId: Scr | null): void => {
      patchState(store, { nextScrId });
    },
    /** 画面遷移マップ表示タイマーリセット */
    resetMapDspTimers: (): void => {
      for (const id of store.mapDspTimers()) {
        clearTimeout(id);
      }
      patchState(store, { mapDspTimers: [] });
    },
    /** 画面遷移マップ表示タイマー追加 */
    addMapDspTimer: (timer: any): void => {
      patchState(store, addMapDspTimers([timer]));
    },
    /** フィルタモデル設定 */
    edtFilter: (edt: FilterEdt): void => {
      patchState(store, (state) => ({
        filterModel: {
          ...state.filterModel,
          [edt.tbl]: edt.filter,
        },
      }));
    },
    /** 過去データ編集フラグ設定 */
    setEdtPastData: (edtPastData: boolean): void => {
      patchState(store, { edtPastData });
    },
  })),
);

/** 画面遷移マップ表示タイマー追加 */
const addMapDspTimers =
  (timers: any[]): PartialStateUpdater<{ mapDspTimers: any[] }> =>
  (state) => ({
    mapDspTimers: [...state.mapDspTimers, ...timers],
  });
