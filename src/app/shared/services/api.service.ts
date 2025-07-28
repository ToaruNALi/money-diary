import { Injectable } from '@angular/core';
import { lastValueFrom, Observable, of, switchMap } from 'rxjs';
import { Row, TblMap } from 'src/app/domain/row-data';
import { Hist } from 'src/app/domain/row-data-edit-history';
import { ScrInf } from 'src/app/domain/screen-info';
import * as Const from 'src/app/shared/constants/constants';
import { Tbl } from 'src/app/shared/constants/types';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  /**
   * 行データ取得
   * @param key
   * @returns Observable<Row[]>
   */
  readonly loadRows = (key: Tbl): Observable<Row[]> => {
    const item = localStorage.getItem(key);
    const data = (!!item ? JSON.parse(item) : []) as Row[];
    return of(data);
  };

  /**
   * 行データ保存
   * @param tbl
   * @param rows
   * @returns Observable<boolean>
   */
  readonly saveRows = (tbl: Tbl, rows: Row[]): Observable<boolean> => {
    const item = JSON.stringify(rows);
    localStorage.setItem(tbl, item);
    return of(true);
  };

  /**
   * 行データMap取得
   * @returns Observable<TblMap>
   */
  readonly loadTblMap = (): Observable<TblMap> => {
    return of(Object.values(Const.TBL)).pipe(
      switchMap(async (keys) => {
        const map = {} as TblMap;
        for (const key of keys) {
          const datas = await lastValueFrom(this.loadRows(key));
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
  readonly saveTblMap = (map: TblMap): Observable<boolean> => {
    return of(Object.entries(map)).pipe(
      switchMap(async (map) => {
        let result = true;
        for (const [key, datas] of map) {
          const ret = await lastValueFrom(this.saveRows(key as Tbl, datas));
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
   * @returns Observable<ScrInf>
   */
  readonly loadScrInf = (): Observable<ScrInf> => {
    const item = localStorage.getItem(Const.SAVE_STG.SCR_INF);
    const data = (!!item ? JSON.parse(item) : {}) as ScrInf;
    return of(data);
  };

  /**
   * 画面情報保存
   * @param inf
   * @returns Observable<boolean>
   */
  readonly saveScrInf = (inf: ScrInf): Observable<boolean> => {
    const item = JSON.stringify(inf);
    localStorage.setItem(Const.SAVE_STG.SCR_INF, item);
    return of(true);
  };

  /**
   * 行データ履歴情報取得
   * @returns Observable<Hist>
   */
  readonly loadHist = (): Observable<Hist> => {
    const item = localStorage.getItem(Const.SAVE_STG.HIST_INF);
    const data = (!!item ? JSON.parse(item) : {}) as Hist;
    return of(data);
  };

  /**
   * 行データ履歴情報保存
   * @param hist
   * @returns Observable<boolean>
   */
  readonly saveHist = (hist: Hist): Observable<boolean> => {
    const item = JSON.stringify(hist);
    localStorage.setItem(Const.SAVE_STG.HIST_INF, item);
    return of(true);
  };
}
