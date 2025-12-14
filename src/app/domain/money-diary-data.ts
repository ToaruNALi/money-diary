import { TblInf } from 'src/app/domain/row-data';
import { Hist } from 'src/app/domain/row-data-edit-history';
import { ScrInf } from 'src/app/domain/screen-info';

/** 家計簿データ */
export type MoneyDiaryData = {
  /** 画面関連情報 */
  si: ScrInf;
  /** グリッド関連データ */
  ti: TblInf;
  /** 行編集保存情報 */
  rh: Hist;
};
