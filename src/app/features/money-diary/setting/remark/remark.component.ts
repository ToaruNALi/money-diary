import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellContextMenuEvent } from 'ag-grid-community';
import { RemarkUsecase } from 'src/app/features/money-diary/setting/remark/remark.usecase';
import { SettingComponent } from 'src/app/features/money-diary/setting/setting.component';
import * as Const from 'src/app/shared/constants/constants';
import { GridComponent } from 'src/app/shared/grid/grid.component';

@Component({
  selector: 'app-remark',
  imports: [GridComponent],
  providers: [RemarkUsecase],
  templateUrl: '../setting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemarkComponent extends SettingComponent {
  protected override readonly inputColId = Const.MONEY_DIARY_COL_ID.REMARK;
  constructor(protected override readonly usecase: RemarkUsecase) {
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

    const colId = event.column.getId();
    let filterAmount = {};
    if (colId === Const.REMARK_COL_ID.INCOME) {
      // 収入
      filterAmount = {
        filterType: 'number',
        type: 'greaterThanOrEqual',
        filter: 0,
      };
    } else if (colId === Const.REMARK_COL_ID.EXPENSES) {
      // 支出
      filterAmount = {
        filterType: 'number',
        type: 'lessThanOrEqual',
        filter: 0,
      };
    }

    // フィルターモデル設定
    this.filterInputModelSet.emit({
      [Const.MONEY_DIARY_COL_ID.REMARK]: {
        filterType: 'text',
        type: 'equals',
        filter: label,
      },
      [Const.MONEY_DIARY_COL_ID.AMOUNT_NUM]: filterAmount,
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
