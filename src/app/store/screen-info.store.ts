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
import { ScrData, ScrInf } from 'src/app/domain/screen-info';
import { ApiService } from 'src/app/shared/services/api.service';
import { SCR, Scr, SCR_INF } from 'src/app/shared/utils/util-screen';

/** State */
type ScrInfState = {
  loading: boolean;
  scrInf: ScrInf;
  err?: any;
};

/** Initial State */
const initState: ScrInfState = {
  loading: false,
  scrInf: {
    si: SCR.MAIN,
    oi: SCR.SUMMARY,
    fi: SCR.MAIN,
    md: true,
    sd: (() => {
      const rec = {} as Record<Scr, ScrData>;
      for (const [key, inf] of Object.entries(SCR_INF)) {
        const scr = key as Scr;
        rec[scr] = {
          od: inf.od,
          px: inf.px,
          py: inf.py,
        };
      }
      return rec;
    })(),
  },
};

/** Signal Store */
export const ScrInfStore = signalStore(
  { providedIn: 'root' },
  // Redux DevTools Enable
  withDevtools('scrInf'),
  // Initial State
  withState(initState),
  // Method
  withMethods((store, apiService = inject(ApiService)) => ({
    /** 画面情報設定 */
    setScrInf: (scrInf: ScrInf): void => {
      patchState(store, setScrInf(scrInf));
      apiService.saveScrInf(store.scrInf());
    },
    /** 画面ID更新 */
    updScrId: (scrId?: Scr): void => {
      patchState(store, updScrId(scrId));
      apiService.saveScrInf(store.scrInf());
    },
  })),
  // Event
  withHooks((store, apiService = inject(ApiService)) => ({
    onInit: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          apiService.loadScrInf().pipe(
            tapResponse({
              next: (data) => store.setScrInf(data),
              error: (err) => patchState(store, { err: err }),
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);

/** 画面情報設定 Updater */
const setScrInf =
  (scrInf: ScrInf): PartialStateUpdater<{ scrInf: ScrInf }> =>
  (state) => {
    const inf: ScrInf = {
      si: scrInf.si ?? state.scrInf.si,
      oi: scrInf.oi ?? state.scrInf.oi,
      fi: scrInf.fi ?? state.scrInf.fi,
      md: scrInf.md ?? state.scrInf.md,
      sd: structuredClone(state.scrInf.sd),
    };
    for (const [key, sd] of Object.entries(scrInf.sd)) {
      const scr = key as Scr;
      inf.sd[scr] = structuredClone(sd);
    }

    return {
      scrInf: inf,
    };
  };

/** 画面ID更新 Updater */
const updScrId =
  (scrId?: Scr): PartialStateUpdater<{ scrInf: ScrInf }> =>
  (state) => ({
    scrInf: {
      ...state.scrInf,
      si: !!scrId ? scrId : state.scrInf.oi,
      oi: scrId === state.scrInf.si ? state.scrInf.oi : state.scrInf.si,
    },
  });
