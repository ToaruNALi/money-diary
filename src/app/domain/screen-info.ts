import { Scr } from 'src/app/shared/constants/types';

/** 画面遷移データ */
export type ScrData = {
  /** 表示順 */
  od: number;
  /** 画面マップ表示X位置 */
  px: number;
  /** 画面マップ表示Y位置 */
  py: number;
};

/** 画面情報 */
export type ScrInf = {
  /** 画面ID */
  si: Scr;
  /** 前画面ID */
  oi: Scr;
  /** お気に入り画面ID */
  fi: Scr;
  /** 画面遷移マップ表示フラグ */
  md: boolean;
  /** 画面遷移データ */
  sd: Record<Scr, ScrData>;
};
