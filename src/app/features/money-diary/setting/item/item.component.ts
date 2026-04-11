import { Component } from '@angular/core';
import { CellContextMenuEvent } from 'ag-grid-community';
import { ItemUsecase } from 'src/app/features/money-diary/setting/item/item.usecase';
import { SettingComponent } from 'src/app/features/money-diary/setting/setting.component';
import { GridComponent } from 'src/app/shared/grid/grid.component';
import { NO_SELECT_VAL } from 'src/app/shared/signal-form/signal-form.component';
import {
  CMN_COL,
  INPUT_MODE,
  MAIN_COL,
  STG_COL,
  TBL,
} from 'src/app/shared/utils/util-row';
import { SCR } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-item',
  imports: [GridComponent],
  providers: [ItemUsecase],
  templateUrl: '../setting.component.html',
})
export class ItemComponent extends SettingComponent {
  constructor(protected override readonly usecase: ItemUsecase) {
    super(usecase);
  }

  /**
   * セル長押し時
   */
  protected override readonly onCellContextMenu = (
    event: CellContextMenuEvent,
  ): void => {
    const id = event.data[CMN_COL.ID];
    const label = event.data[CMN_COL.LABEL];

    if (id === NO_SELECT_VAL.ID || !label) {
      // 未選択項目とラベルなし項目は対象外
      return;
    }

    const selectDatas = event.api.getSelectedRows();
    const filterItem = (() => {
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
          filter: dt[STG_COL.LABEL],
          filterType: 'text',
          type: 'equals',
        })),
        filterType: 'text',
        operator: 'OR',
      };
    })();

    // フィルターモデル設定
    this.filterModelChange.emit({
      tbl: TBL.MAIN,
      filter: {
        [MAIN_COL.ITEM]: filterItem,
        [MAIN_COL.INPUT_MODE]: {
          filter: INPUT_MODE.ALL_REQ,
          filterType: 'number',
          type: 'equal',
        },
      },
    });
    // 入力画面に遷移
    this.scrIdSet.emit(SCR.MAIN);
  };
}
