import { CommonType } from './common.type';
import { MenuItemType } from './menu-item.type';

/** ヘッダメニュー */
export type HeaderMenuType = CommonType & {
  /** ヘッダメニュー項目 */
  items: MenuItemType[];
};
