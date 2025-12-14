import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TblInf } from 'src/app/domain/row-data';
import { Hist } from 'src/app/domain/row-data-edit-history';
import { ScrInf } from 'src/app/domain/screen-info';
import * as Const from 'src/app/shared/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  /**
   * 行データMap取得
   * @returns Observable<TblMap>
   */
  readonly loadTblInf = (): Observable<TblInf> => {
    const item = localStorage.getItem(Const.SAVE_STG.TBL_INF);
    const data = (!!item ? JSON.parse(item) : {}) as TblInf;
    return of(data);
  };

  /**
   * テーブル情報保存
   * @param inf
   * @returns Observable<boolean>
   */
  readonly saveTblInf = (inf: TblInf): Observable<boolean> => {
    const item = JSON.stringify(inf);
    localStorage.setItem(Const.SAVE_STG.TBL_INF, item);
    return of(true);
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
