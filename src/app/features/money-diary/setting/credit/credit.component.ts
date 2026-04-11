import { Component } from '@angular/core';
import { CellContextMenuEvent } from 'ag-grid-community';
import { CreditUsecase } from 'src/app/features/money-diary/setting/credit/credit.usecase';
import { SettingComponent } from 'src/app/features/money-diary/setting/setting.component';
import { GridComponent } from 'src/app/shared/grid/grid.component';
import { NO_SELECT_VAL } from 'src/app/shared/signal-form/signal-form.component';
import {
  calcPayDateConsiderHoliday,
  CMN_COL,
  CRD_COL,
  INPUT_MODE,
  MAIN_COL,
  STG_COL,
  TBL,
} from 'src/app/shared/utils/util-row';
import { SCR } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-credit',
  imports: [GridComponent],
  providers: [CreditUsecase],
  templateUrl: '../setting.component.html',
})
export class CreditComponent extends SettingComponent {
  constructor(protected override readonly usecase: CreditUsecase) {
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
    const [filterCredit, filterPayDate] = (() => {
      if (selectDatas.length === 0) {
        // 未選択
        const payDay = event.data[CRD_COL.PAY_DAY];
        const date = `${event.colDef.headerName}-${payDay}`;
        const businessDays = event.data[CRD_COL.BUSINESS_DAYS];
        const payDate = calcPayDateConsiderHoliday(date, businessDays);

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
            filter: dt[STG_COL.LABEL],
            filterType: 'text',
            type: 'equals',
          })),
          filterType: 'text',
          operator: 'OR',
        },
        {
          conditions: selectDatas.map((dt) => {
            const payDay = dt[CRD_COL.PAY_DAY];
            const date = `${event.colDef.headerName}-${payDay}`;
            const businessDays = dt[CRD_COL.BUSINESS_DAYS];
            const payDate = calcPayDateConsiderHoliday(date, businessDays);
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
    this.filterModelChange.emit({
      tbl: TBL.MAIN,
      filter: {
        [MAIN_COL.CREDIT]: filterCredit,
        [MAIN_COL.PAY_DATE]: filterPayDate,
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
