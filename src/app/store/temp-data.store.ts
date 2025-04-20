import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  PartialStateUpdater,
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';
import { FilterInputModel } from 'src/app/shared/constants/types';

/** State */
type TempDataState = {
  /** 画面遷移マップ表示フラグ */
  mapDisp: boolean;
  /** 画面遷移マップ表示タイマー */
  mapDispTimers: any[];
  /** 入力画面フィルタ情報 */
  filterInputModel: FilterInputModel;
  /** 過去データ編集可能フラグ */
  editPastData: boolean;
};

/** Initial State */
const initialState: TempDataState = {
  mapDisp: false,
  mapDispTimers: [],
  filterInputModel: 'none',
  editPastData: false,
};

/** Signal Store */
export const TempDataStore = signalStore(
  { providedIn: 'root' },
  // Redux DevTools Enable
  withDevtools('tempData'),
  // Initial State
  withState(initialState),
  // Method
  withMethods((store) => ({
    /** 画面遷移マップ表示フラグ設定 */
    setMapDisp: (mapDisp: boolean): void => {
      patchState(store, { mapDisp });
    },

    /** 画面遷移マップ表示タイマーリセット */
    resetMapDispTimers: (): void => {
      for (const id of store.mapDispTimers()) {
        clearTimeout(id);
      }
      patchState(store, { mapDispTimers: [] });
    },

    /** 画面遷移マップ表示タイマー追加 */
    addMapDispTimer: (timer: any): void => {
      patchState(store, addMapDispTimers([timer]));
    },

    /** フィルタモデル設定 */
    setFilterInputModel: (filterInputModel: FilterInputModel): void => {
      patchState(store, { filterInputModel });
    },

    /** 過去データ編集フラグ設定 */
    setEditPastData: (editPastData: boolean): void => {
      patchState(store, { editPastData });
    },
  })),
);

/** 画面遷移マップ表示タイマー追加 */
const addMapDispTimers =
  (timers: any[]): PartialStateUpdater<{ mapDispTimers: any[] }> =>
  (state) => ({
    mapDispTimers: [...state.mapDispTimers, ...timers],
  });
