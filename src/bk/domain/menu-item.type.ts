import { CommonType } from './common.type';

/** メニュー項目 */
export type MenuItemType = CommonType & {
  /** 遷移先 */
  route: string;
};
