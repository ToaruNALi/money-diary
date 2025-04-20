import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RowData } from 'src/app/domain/row-data';
import {
  DialogChart,
  DialogChartComponent,
} from 'src/app/shared/chart/dialog-chart/dialog-chart.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
    selector: 'app-chart',
    imports: [SharedCommonModule],
    templateUrl: './chart.component.html',
    styleUrl: './chart.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent {
  private readonly dialog = inject(MatDialog);

  readonly datas = input.required<RowData[]>();

  protected readonly onClick = (): void => {
    const config: MatDialogConfig<DialogChart> = {
      data: {
        inputDatas: this.datas(),
        creditDatas: [],
      },
    };
    this.dialog.open(DialogChartComponent, config);
  };
}
