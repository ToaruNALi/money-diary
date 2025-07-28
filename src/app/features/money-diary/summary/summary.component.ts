import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Row } from 'src/app/domain/row-data';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import { SummaryUsecase } from 'src/app/features/money-diary/summary/summary.usecase';
import {
  GridBelowContentOption,
  GridComponent,
} from 'src/app/shared/grid/grid.component';

@Component({
  selector: 'app-summary',
  imports: [GridComponent],
  providers: [SummaryUsecase],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryComponent extends MoneyDiaryBaseComponent {
  /** usecase */
  private readonly usecase = inject(SummaryUsecase);

  /** Other Row Datas */
  readonly inputRows = input.required<Row[]>();
  readonly itmRows = input.required<Row[]>();

  /** 列定義 */
  protected override readonly colDefs = computed(() =>
    this.usecase.getColDefs(this.inputRows(), this.itmRows()),
  );
  /** 行データ */
  protected override readonly rows = computed(() =>
    this.usecase.getRows(this.inputRows(), this.itmRows()),
  );
  /** グリッド下ボタンオプション */
  protected readonly belowContentOption = {
    jumpFirstCol: true,
    jumpLastCol: true,
    jumpFirstRow: true,
    jumpLastRow: true,
  } as const satisfies GridBelowContentOption;
}
