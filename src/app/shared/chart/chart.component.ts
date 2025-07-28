import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Row } from 'src/app/domain/row-data';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  private readonly dialog = inject(MatDialog);

  readonly rows = input.required<Row[]>();

  protected readonly onClick = (): void => {
    const config: MatDialogConfig<DialogChart> = {
      data: {
        inputDatas: this.rows(),
        creditDatas: [],
      },
    };
    this.dialog.open(DialogChartComponent, config);
  };
}
