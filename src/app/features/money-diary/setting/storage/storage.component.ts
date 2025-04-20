import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellContextMenuEvent } from 'ag-grid-community';
import { addDays, format } from 'date-fns';
import { SettingComponent } from 'src/app/features/money-diary/setting/setting.component';
import { StorageUsecase } from 'src/app/features/money-diary/setting/storage/storage.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { GridComponent } from 'src/app/shared/grid/grid.component';

@Component({
  selector: 'app-storage',
  imports: [GridComponent],
  providers: [StorageUsecase],
  templateUrl: '../setting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorageComponent extends SettingComponent {
  protected override inputColId = Const.MONEY_DIARY_COL_ID.STORAGE;
  constructor(protected override readonly usecase: StorageUsecase) {
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

    const today = format(addDays(new Date(), 1), Const.DATE_FORMAT.YYYY_MM_DD);
    const colId = event.column.getId();
    let filterPayDate = {};
    if (colId === Const.STORAGE_COL_ID.SAVINGS) {
      // 現時点での残高
      filterPayDate = {
        filterType: 'date',
        type: 'lessThan',
        dateFrom: today,
        dateTo: null,
      };
    }

    // フィルターモデル設定
    this.filterInputModelSet.emit({
      [Const.MONEY_DIARY_COL_ID.STORAGE]: {
        filterType: 'text',
        type: 'equals',
        filter: label,
      },
      [Const.MONEY_DIARY_COL_ID.PAY_DATE]: filterPayDate,
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
