import { CommonType } from './common.type';
import { MenuItemType } from './menu-item.type';

/** メニュー */
export type MenuType = CommonType & {
  /** メニュー項目 */
  items: MenuItemType[];
};
