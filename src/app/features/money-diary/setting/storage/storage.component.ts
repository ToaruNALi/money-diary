import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellContextMenuEvent } from 'ag-grid-community';
import { addDays } from 'date-fns';
import { Row } from 'src/app/domain/row-data';
import { SettingComponent } from 'src/app/features/money-diary/setting/setting.component';
import { StorageUsecase } from 'src/app/features/money-diary/setting/storage/storage.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { ValType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import { GridComponent } from 'src/app/shared/grid/grid.component';

@Component({
  selector: 'app-storage',
  imports: [GridComponent],
  providers: [StorageUsecase],
  templateUrl: '../setting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorageComponent extends SettingComponent {
  protected override inputColId = Const.MAIN_COL.STORAGE;
  constructor(protected override readonly usecase: StorageUsecase) {
    super(usecase);
  }

  /**
   * セル長押し時
   */
  protected override readonly onCellContextMenu = (
    event: CellContextMenuEvent<Row, ValType>,
  ): void => {
    const id = event.data?.[Const.CMN_COL.ID];
    const label = event.data?.[Const.CMN_COL.LABEL];
    if (id === Const.MARK.NO_SELECT.id || !label) {
      // 未選択項目とラベルなし項目は対象外
      return;
    }

    const selectDatas = event.api.getSelectedRows();
    const filterStorage = (() => {
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

    const today = Util.getDate(addDays(new Date(), 1));
    const colId = event.column.getId();
    const filterPayDate = (() => {
      if (colId === Const.STG_COL.SAVINGS) {
        // 現時点での残高
        return {
          dateFrom: today,
          dateTo: null,
          filterType: 'date',
          type: 'lessThan',
        };
      }
      return {};
    })();

    // フィルターモデル設定
    this.filterEdt.emit({
      tbl: Const.TBL.MAIN,
      filter: {
        [Const.MAIN_COL.STORAGE]: filterStorage,
        [Const.MAIN_COL.PAY_DATE]: filterPayDate,
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
