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
import { ScreenData, ScreenInfo } from 'src/app/domain/screen-info';
import * as Const from 'src/app/shared/constants/constants';
import { ScreenId } from 'src/app/shared/constants/types';
import { ApiService } from 'src/app/shared/services/api.service';

/** State */
type ScreenInfoState = {
  loading: boolean;
  screenInfo: ScreenInfo;
  error?: any;
};

/** Initial State */
const initialState: ScreenInfoState = {
  loading: false,
  screenInfo: {
    si: Const.SCREEN_ID.MONEY_DIARY,
    oi: Const.SCREEN_ID.SUMMARY,
    fi: Const.SCREEN_ID.MONEY_DIARY,
    md: true,
    sd: Const.SCREEN_INFO.map((info) => ({
      id: info.id,
      px: info.px,
      py: info.py,
    })),
  },
};

/** Signal Store */
export const ScreenInfoStore = signalStore(
  { providedIn: 'root' },
  // Redux DevTools Enable
  withDevtools('screenInfo'),
  // Initial State
  withState(initialState),
  // Method
  withMethods((store, apiService = inject(ApiService)) => ({
    /** 画面情報設定 */
    setScreenInfo: (screenInfo: ScreenInfo): void => {
      patchState(store, setScreenInfo(screenInfo));
      apiService.saveScreenInfo(store.screenInfo());
    },

    /** 画面遷移マップ表示フラグ設定 */
    setMapDisp: (mapDisp: boolean): void => {
      patchState(store, setMapDisp(mapDisp));
      apiService.saveScreenInfo(store.screenInfo());
    },

    /** 画面遷移データ設定 */
    setScreenDatas: (datas: ScreenData[]): void => {
      patchState(store, setScreenDatas(datas));
      apiService.saveScreenInfo(store.screenInfo());
    },

    /** 画面ID更新 */
    updScreenId: (screenId?: ScreenId): void => {
      patchState(store, updScreenId(screenId));
      apiService.saveScreenInfo(store.screenInfo());
    },
  })),
  // Event
  withHooks((store, apiService = inject(ApiService)) => ({
    onInit: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          apiService.loadScreenInfo().pipe(
            tapResponse({
              next: (data) => store.setScreenInfo(data),
              error: (error) => patchState(store, { error }),
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);

/** 画面情報設定 Updater */
const setScreenInfo =
  (screenInfo: ScreenInfo): PartialStateUpdater<{ screenInfo: ScreenInfo }> =>
  (state) => {
    const info: ScreenInfo = {
      si: screenInfo.si ?? state.screenInfo.si,
      oi: screenInfo.oi ?? state.screenInfo.oi,
      fi: screenInfo.fi ?? state.screenInfo.fi,
      md: screenInfo.md ?? state.screenInfo.md,
      sd: structuredClone(state.screenInfo.sd),
    };
    for (let idx = 0; idx < info.sd.length; idx++) {
      const data = info.sd[idx];
      const sd = screenInfo.sd.find((sd) => sd.id === data.id);
      if (!sd) {
        continue;
      }
      info.sd[idx] = structuredClone(sd);
    }

    return {
      screenInfo: info,
    };
  };

/** 画面遷移マップ表示フラグ設定 Updater */
const setMapDisp =
  (md: boolean): PartialStateUpdater<{ screenInfo: ScreenInfo }> =>
  (state) => ({
    screenInfo: {
      ...state.screenInfo,
      md,
    },
  });

/** 画面遷移データ設定 */
const setScreenDatas =
  (sd: ScreenData[]): PartialStateUpdater<{ screenInfo: ScreenInfo }> =>
  (state) => ({
    screenInfo: {
      ...state.screenInfo,
      sd,
    },
  });

/** 画面ID更新 Updater */
const updScreenId =
  (screenId?: ScreenId): PartialStateUpdater<{ screenInfo: ScreenInfo }> =>
  (state) => ({
    screenInfo: {
      ...state.screenInfo,
      si: !!screenId ? screenId : state.screenInfo.oi,
      oi:
        screenId === state.screenInfo.si
          ? state.screenInfo.oi
          : state.screenInfo.si,
    },
  });
