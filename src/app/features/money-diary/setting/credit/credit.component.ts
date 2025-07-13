import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellContextMenuEvent } from 'ag-grid-community';
import { CreditUsecase } from 'src/app/features/money-diary/setting/credit/credit.usecase';
import { SettingComponent } from 'src/app/features/money-diary/setting/setting.component';
import * as Const from 'src/app/shared/constants/constants';
import * as Util from 'src/app/shared/constants/utils';
import { GridComponent } from 'src/app/shared/grid/grid.component';

@Component({
  selector: 'app-credit',
  imports: [GridComponent],
  providers: [CreditUsecase],
  templateUrl: '../setting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditComponent extends SettingComponent {
  protected override readonly inputColId = Const.MONEY_DIARY_COL_ID.CREDIT;
  constructor(protected override readonly usecase: CreditUsecase) {
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
    const [filterCredit, filterPayDate] = (() => {
      if (selectDatas.length === 0) {
        // 未選択
        const payDay = event.data[Const.CREDIT_COL_ID.PAY_DAY];
        const date = `${event.colDef.headerName}-${payDay}`;
        const businessDays = event.data[Const.CREDIT_COL_ID.BUSINESS_DAYS];
        const payDate = Util.calcPayDateConsiderHoliday(date, businessDays);

        return [
          {
            filter: label,
            filterType: 'text',
            type: 'equals',
          },
          {
            dateFrom: payDate,
            dateTo: null,
            filterType: 'date',
            type: 'equals',
          },
        ];
      }
      // 選択あり
      return [
        {
          conditions: selectDatas.map((dt) => ({
            filter: dt[Const.STORAGE_COL_ID.LABEL],
            filterType: 'text',
            type: 'equals',
          })),
          filterType: 'text',
          operator: 'OR',
        },
        {
          conditions: selectDatas.map((dt) => {
            const payDay = dt[Const.CREDIT_COL_ID.PAY_DAY];
            const date = `${event.colDef.headerName}-${payDay}`;
            const businessDays = dt[Const.CREDIT_COL_ID.BUSINESS_DAYS];
            const payDate = Util.calcPayDateConsiderHoliday(date, businessDays);
            return {
              dateFrom: payDate,
              dateTo: null,
              filterType: 'date',
              type: 'equals',
            };
          }),
          filterType: 'date',
          operator: 'OR',
        },
      ];
    })();

    // フィルターモデル設定
    this.filterInputModelSet.emit({
      [Const.MONEY_DIARY_COL_ID.CREDIT]: filterCredit,
      [Const.MONEY_DIARY_COL_ID.PAY_DATE]: filterPayDate,
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
