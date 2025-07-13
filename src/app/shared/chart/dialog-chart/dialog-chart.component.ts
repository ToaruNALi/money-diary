import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AgChartsModule } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import * as DateUtil from 'date-fns';
import { RowData } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import * as Util from 'src/app/shared/constants/utils';
import { DialogCommonModule } from 'src/app/shared/dialog-common.module';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type DialogChart = {
  inputDatas: RowData[];
  creditDatas: RowData[];
};

@Component({
  imports: [SharedCommonModule, DialogCommonModule, AgChartsModule],
  templateUrl: './dialog-chart.component.html',
  styleUrl: './dialog-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogChartComponent {
  protected readonly dialogRef = inject(MatDialogRef);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private readonly data: DialogChart,
  ) {}

  protected readonly options = signal<AgChartOptions>({});

  private readonly unitDate = signal('month');
  private readonly date = signal('date');

  ngOnInit(): void {
    const chartDatas: RowData[] = [];
    const startDate: string = Const.MANAGEMENT_DATE.START;
    const endDate = new Date();
    const xKeys = [Const.SUMMARY_COL_ID.DATE];
    const yKeys = [Const.SUMMARY_COL_ID.INCOME, Const.SUMMARY_COL_ID.EXPENSES];

    for (
      let date = startDate;
      DateUtil.differenceInCalendarMonths(endDate, date) >= 0;
      date = Util.getDate(DateUtil.addMonths(date, 1))
    ) {
      const chartData: RowData = {};
      for (const key of xKeys) {
        chartData[key] = Util.getDate(date, Const.DATE_FORMAT.YYYY_MM);
      }
      for (const key of yKeys) {
        chartData[key] = Util.getInitValue(Const.ROW_DATA_KEY.SUMMARY, key);
      }
      chartDatas.push(chartData);
    }

    for (const rowData of this.data.inputDatas) {
      // chartDatas.push(data);
      if (!Util.checkInputMode(rowData, Const.INPUT_MODE.ALL_REQ)) {
        // 必須項目漏れあり
        continue;
      }

      const dateStr = Util.getPayDate(
        rowData[Const.MONEY_DIARY_COL_ID.USE_DATE],
        rowData[Const.MONEY_DIARY_COL_ID.CREDIT],
        this.data.creditDatas,
      );
      rowData[Const.MONEY_DIARY_COL_ID.DATE]?.toString() ?? '';
      const startDateStr = Util.getDate(DateUtil.startOfMonth(dateStr));
      const chartData = chartDatas.find(
        (data) =>
          DateUtil.differenceInCalendarMonths(
            data[Const.SUMMARY_COL_ID.DATE]?.toString() ?? '',
            startDateStr,
          ) === 0,
      );

      if (!chartData) {
        // 集計データ内に該当月行なし
        continue;
      }

      const amountNum = Number(rowData[Const.MONEY_DIARY_COL_ID.AMOUNT_NUM]);

      if (amountNum > 0) {
        (chartData[Const.SUMMARY_COL_ID.INCOME] as number) += amountNum;
      } else if (amountNum < 0) {
        (chartData[Const.SUMMARY_COL_ID.EXPENSES] as number) += amountNum;
      }
    }

    this.options.set({
      theme: 'ag-default-dark',
      axes: [
        {
          type: 'number',
          position: 'left',
          label: {
            formatter: ({ value }) => {
              return Util.cvtNumToPrice(value);
            },
          },
          crosshair: {
            strokeWidth: 100,
          },
          interval: {
            minSpacing: 80,
            maxSpacing: 120,
          },
        },
        {
          type: 'category',
          position: 'bottom',
          paddingOuter: 1,
        },
      ],
      data: chartDatas,
      series: [
        {
          type: 'bar',
          xKey: Const.SUMMARY_COL_ID.DATE,
          yKey: Const.SUMMARY_COL_ID.INCOME,
          yName: 'Income',
        },
        {
          type: 'bar',
          xKey: Const.SUMMARY_COL_ID.DATE,
          yKey: Const.SUMMARY_COL_ID.EXPENSES,
          yName: 'Expenses',
        },
      ],
    });
  }

  /**
   * Chartオプションを作成する
   */
  private readonly createChartOption = (): void => {
    // 横軸の間隔となるFormatを設定(日/月/年)
    const dateFormat =
      this.unitDate() === 'year'
        ? Const.DATE_FORMAT.YYYY
        : this.unitDate() === 'month'
          ? Const.DATE_FORMAT.YYYY_MM
          : this.unitDate() === 'day'
            ? Const.DATE_FORMAT.YY_MM_DD
            : '';
    // 横軸の値を設定する内部関数を設定(日付/支払日)
    // const dateFn =
    //   this.date() === 'date'? (date: ValueType) => date :
    //   this.date() === 'payDate'? (date: ValueType) => !!date? ;
    // 縦軸の値を設定する
  };
}
