import { RowDataMap } from 'src/app/domain/row-data';
import { RowDataEditHistory } from 'src/app/domain/row-data-edit-history';
import { ScreenInfo } from 'src/app/domain/screen-info';

/** 家計簿データ */
export type MoneyDiaryData = {
  /** 画面関連情報 */
  si: ScreenInfo;
  /** グリッド関連データ */
  rm: RowDataMap;
  /** 行編集保存情報 */
  rh: RowDataEditHistory;
};
