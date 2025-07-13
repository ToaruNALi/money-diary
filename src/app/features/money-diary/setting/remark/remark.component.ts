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

    const selectDatas = event.api.getSelectedRows();
    const filterRemark = (() => {
      if (selectDatas.length === 0) {
        // 未選択
        return {
          filter: label,
          filterType: 'text',
          type: 'equals',
        };
      }
      // 選択あり
      return {
        conditions: selectDatas.map((dt) => ({
          filter: dt[Const.STORAGE_COL_ID.LABEL],
          filterType: 'text',
          type: 'equals',
        })),
        filterType: 'text',
        operator: 'OR',
      };
    })();

    const colId = event.column.getId();
    const filterAmount = (() => {
      if (colId === Const.REMARK_COL_ID.INCOME) {
        // 収入
        return {
          filter: 0,
          filterType: 'number',
          type: 'greaterThanOrEqual',
        };
      } else if (colId === Const.REMARK_COL_ID.EXPENSES) {
        // 支出
        return {
          filter: 0,
          filterType: 'number',
          type: 'lessThanOrEqual',
        };
      }
      return {};
    })();

    // フィルターモデル設定
    this.filterInputModelSet.emit({
      [Const.MONEY_DIARY_COL_ID.REMARK]: filterRemark,
      [Const.MONEY_DIARY_COL_ID.AMOUNT_NUM]: filterAmount,
      [Const.MONEY_DIARY_COL_ID.INPUT_MODE]: {
        filter: Const.INPUT_MODE.ALL_REQ,
        filterType: 'number',
        type: 'equal',
      },
    });
    // 入力画面に遷移
    this.screenIdSet.emit(Const.SCREEN_ID.MONEY_DIARY);
  };
}
