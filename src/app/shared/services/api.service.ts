import { Injectable } from '@angular/core';
import { lastValueFrom, Observable, of, switchMap } from 'rxjs';
import { RowData, RowDataMap } from 'src/app/domain/row-data';
import { RowDataEditHistory } from 'src/app/domain/row-data-edit-history';
import { ScreenInfo } from 'src/app/domain/screen-info';
import * as Const from 'src/app/shared/constants/constants';
import { RowDataKey, StorageKey } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  /**
   * 家計簿データ読込
   * @returns
   */
  readonly loadMoneyDiaryData = (): Observable<Record<StorageKey, unknown>> => {
    const data = {} as Record<StorageKey, unknown>;

    for (const storageKey of Object.values(Const.STORAGE_KEY)) {
      const item = localStorage.getItem(storageKey);
      if (!!item) {
        data[storageKey] = JSON.parse(item);
      } else {
        data[storageKey] = undefined;
      }
    }
    return of(data);
  };

  /**
   * 行データ保存
   * @param key
   * @param datas
   */
  readonly saveRowDatas = (
    key: RowDataKey,
    datas: RowData[],
  ): Observable<boolean> => {
    localStorage.setItem(
      key,
      JSON.stringify(Util.createSaveRowDatas(key, datas)),
    );
    return of(true);
  };

  /**
   * 画面関連情報保存
   * @param info
   */
  readonly saveScreenInfobk = (info: ScreenInfo): Observable<boolean> => {
    localStorage.setItem(Const.STORAGE_KEY.SCREEN_INFO, JSON.stringify(info));
    return of(true);
  };

  /******************************
   * 下記メソッドを今後使用する
   ******************************/
  /**
   * 行データ取得
   * @param key
   * @returns Observable<RowData[]>
   */
  readonly loadRowData = (key: RowDataKey): Observable<RowData[]> => {
    const item = localStorage.getItem(key);
    const data = (!!item ? JSON.parse(item) : []) as RowData[];
    return of(data);
  };

  /**
   * 行データ保存
   * @param key
   * @param datas
   * @returns Observable<boolean>
   */
  readonly saveRowData = (
    key: RowDataKey,
    datas: RowData[],
  ): Observable<boolean> => {
    const item = JSON.stringify(datas);
    localStorage.setItem(key, item);
    return of(true);
  };

  /**
   * 行データMap取得
   * @returns Observable<RowDataMap>
   */
  readonly loadRowDataMap = (): Observable<RowDataMap> => {
    return of(Object.values(Const.ROW_DATA_KEY)).pipe(
      switchMap(async (keys) => {
        const map = {} as RowDataMap;
        for (const key of keys) {
          const datas = await lastValueFrom(this.loadRowData(key));
          map[key] = datas;
        }
        return map;
      }),
    );
  };

  /**
   * 行データMap保存
   * @param map
   * @returns Observable<boolean>
   */
  readonly saveRowDataMap = (map: RowDataMap): Observable<boolean> => {
    return of(Object.entries(map)).pipe(
      switchMap(async (map) => {
        let result = true;
        for (const [key, datas] of map) {
          const ret = await lastValueFrom(
            this.saveRowData(key as RowDataKey, datas),
          );
          if (!ret) {
            result = false;
          }
        }
        return result;
      }),
    );
  };

  /**
   * 画面情報取得
   * @returns Observable<ScreenInfo>
   */
  readonly loadScreenInfo = (): Observable<ScreenInfo> => {
    const item = localStorage.getItem(Const.STORAGE_KEY.SCREEN_INFO);
    const data = (!!item ? JSON.parse(item) : {}) as ScreenInfo;
    return of(data);
  };

  /**
   * 画面情報保存
   * @param info
   * @returns Observable<boolean>
   */
  readonly saveScreenInfo = (info: ScreenInfo): Observable<boolean> => {
    const item = JSON.stringify(info);
    localStorage.setItem(Const.STORAGE_KEY.SCREEN_INFO, item);
    return of(true);
  };

  /**
   * 行データ履歴情報取得
   * @returns Observable<RowDataEditHistory>
   */
  readonly loadRowDataEditHistory = (): Observable<RowDataEditHistory> => {
    const item = localStorage.getItem(
      Const.STORAGE_KEY.ROW_DATA_EDITS_SAVE_INFO,
    );
    const data = (!!item ? JSON.parse(item) : {}) as RowDataEditHistory;
    return of(data);
  };

  /**
   * 行データ履歴情報保存
   * @param history
   * @returns Observable<boolean>
   */
  readonly saveRowDataEditHistory = (
    history: RowDataEditHistory,
  ): Observable<boolean> => {
    const item = JSON.stringify(history);
    localStorage.setItem(Const.STORAGE_KEY.ROW_DATA_EDITS_SAVE_INFO, item);
    return of(true);
  };
}
