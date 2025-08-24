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
  protected override readonly inputColId = Const.MAIN_COL.REMARK;
  constructor(protected override readonly usecase: RemarkUsecase) {
    super(usecase);
  }

  /**
   * セル長押し時
   */
  protected override readonly onCellContextMenu = (
    event: CellContextMenuEvent,
  ): void => {
    const id = event.data[Const.CMN_COL.ID];
    const label = event.data[Const.CMN_COL.LABEL];

    if (id === Const.MARK.NO_SELECT.id || !label) {
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
          filter: dt[Const.STG_COL.LABEL],
          filterType: 'text',
          type: 'equals',
        })),
        filterType: 'text',
        operator: 'OR',
      };
    })();

    const colId = event.column.getId();
    const filterAmount = (() => {
      if (colId === Const.RMK_COL.INCOME) {
        // 収入
        return {
          filter: 0,
          filterType: 'number',
          type: 'greaterThanOrEqual',
        };
      } else if (colId === Const.RMK_COL.EXPENSES) {
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
    this.filterEdt.emit({
      tbl: Const.TBL.MAIN,
      filter: {
        [Const.MAIN_COL.REMARK]: filterRemark,
        [Const.MAIN_COL.AMOUNT_NUM]: filterAmount,
        [Const.MAIN_COL.INPUT_MODE]: {
          filter: Const.INPUT_MODE.ALL_REQ,
          filterType: 'number',
          type: 'equal',
        },
      },
    });
    // 入力画面に遷移
    this.scrIdSet.emit(Const.SCR.MAIN);
  };
}
