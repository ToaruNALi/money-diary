import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgChartsModule } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { RowData } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type DialogChart = {
  inputDatas: RowData[];
  creditDatas: RowData[];
};

@Component({
    imports: [SharedCommonModule, AgChartsModule],
    templateUrl: './dialog-chart.component.html',
    styleUrl: './dialog-chart.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogChartComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    private readonly data: DialogChart,
  ) {}

  protected readonly options = signal<AgChartOptions>({});

  private readonly unitDate = signal('month');
  private readonly date = signal('date');

  ngOnInit(): void {
    this.options.set({
      title: {
        text: "Apple's Revenue by Product Category",
      },
      subtitle: {
        text: 'In Billion U.S. Dollars',
      },
      data: this.data.inputDatas,
      series: [
        {
          type: 'bar',
          xKey: 'dt',
          yKey: 'an',
          yName: 'Amount',
        },
      ],
    });
    // this.options.set({
    //   title: {
    //     text: "Apple's Revenue by Product Category",
    //   },
    //   subtitle: {
    //     text: 'In Billion U.S. Dollars',
    //   },
    //   data: [
    //     {
    //       quarter: "Q1'18",
    //       iphone: 140,
    //       mac: 16,
    //       ipad: 14,
    //       wearables: 12,
    //       services: 20,
    //     },
    //     {
    //       quarter: "Q2'18",
    //       iphone: 124,
    //       mac: 20,
    //       ipad: 14,
    //       wearables: 12,
    //       services: 30,
    //     },
    //     {
    //       quarter: "Q3'18",
    //       iphone: 112,
    //       mac: 20,
    //       ipad: 18,
    //       wearables: 14,
    //       services: 36,
    //     },
    //     {
    //       quarter: "Q4'18",
    //       iphone: 118,
    //       mac: 24,
    //       ipad: 14,
    //       wearables: 14,
    //       services: 36,
    //     },
    //   ],
    //   series: [
    //     {
    //       type: 'bar',
    //       xKey: 'quarter',
    //       yKey: 'iphone',
    //       yName: 'iPhone',
    //     },
    //     {
    //       type: 'bar',
    //       xKey: 'quarter',
    //       yKey: 'mac',
    //       yName: 'Mac',
    //     },
    //     {
    //       type: 'bar',
    //       xKey: 'quarter',
    //       yKey: 'ipad',
    //       yName: 'iPad',
    //     },
    //     {
    //       type: 'bar',
    //       xKey: 'quarter',
    //       yKey: 'wearables',
    //       yName: 'Wearables',
    //     },
    //     {
    //       type: 'bar',
    //       xKey: 'quarter',
    //       yKey: 'services',
    //       yName: 'Services',
    //     },
    //   ],
    // });
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

    //
  };
}
