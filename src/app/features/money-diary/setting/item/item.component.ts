import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellContextMenuEvent } from 'ag-grid-community';
import { ItemUsecase } from 'src/app/features/money-diary/setting/item/item.usecase';
import { SettingComponent } from 'src/app/features/money-diary/setting/setting.component';
import * as Const from 'src/app/shared/constants/constants';
import { GridComponent } from 'src/app/shared/grid/grid.component';

@Component({
  selector: 'app-item',
  imports: [GridComponent],
  providers: [ItemUsecase],
  templateUrl: '../setting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComponent extends SettingComponent {
  protected override readonly inputColId = Const.MONEY_DIARY_COL_ID.ITEM;
  constructor(protected override readonly usecase: ItemUsecase) {
    super(usecase);
  }

  /**
   * セル長押し時
   */
  protected override readonly onCellContextMenu = (
    event: CellContextMenuEvent,
  ): void => {
    const id = event.data[Const.ROW_DATA_COMMON_COL_ID.ID];
    const label = event.data[Const.ROW_DATA_COMMON_COL_ID.LABEL];

    if (id === Const.MARK.NO_SELECT.ID || !label) {
      // 未選択項目とラベルなし項目は対象外
      return;
    }

    // フィルターモデル設定
    this.filterInputModelSet.emit({
      [Const.MONEY_DIARY_COL_ID.ITEM]: {
        filterType: 'text',
        type: 'equals',
        filter: label,
      },
      [Const.MONEY_DIARY_COL_ID.INPUT_MODE]: {
        filterType: 'number',
        type: 'equal',
        filter: Const.INPUT_MODE.ALL_REQ,
      },
    });
    // 入力画面に遷移
    this.screenIdSet.emit(Const.SCREEN_ID.MONEY_DIARY);
  };
}
