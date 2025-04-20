import { ScreenId } from 'src/app/shared/constants/types';

/** 画面遷移データ */
export type ScreenData = {
  /** 画面ID */
  id: ScreenId;
  /** 画面マップ表示X位置 */
  px: number;
  /** 画面マップ表示Y位置 */
  py: number;
};

/** 画面情報 */
export type ScreenInfo = {
  /** 画面ID */
  si: ScreenId;
  /** 前画面ID */
  oi: ScreenId;
  /** お気に入り画面ID */
  fi: ScreenId;
  /** 画面遷移マップ表示フラグ */
  md: boolean;
  /** 画面遷移データ */
  sd: ScreenData[];
};
