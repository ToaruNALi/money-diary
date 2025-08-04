import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Row } from 'src/app/domain/row-data';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import { SummaryUsecase } from 'src/app/features/money-diary/summary/summary.usecase';
import {
  GridBtmOptKey,
  GridComponent,
  GridInput,
  GridOptInput,
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

  /** Grid入力データ */
  protected readonly gridInput = computed<GridInput>(() => ({
    style: this.style,
    tbl: this.tbl,
    colDefs: this.colDefs,
    rows: this.rows,
    btmOpt: this.gridBtmOpt,
  }));
  /** スタイル */
  private readonly style = signal<Record<string, string>>({
    width: '100vw',
    height: 'calc(100vh - 200px)',
  });
  /** 列定義 */
  private readonly colDefs = computed(() =>
    this.usecase.getColDefs(this.inputRows(), this.itmRows()),
  );
  /** 行データ */
  private readonly rows = computed(() =>
    this.usecase.getRows(this.inputRows(), this.itmRows()),
  );
  /** グリッド下ボタンオプション */
  private readonly gridBtmOpt = signal<GridOptInput<GridBtmOptKey>[]>([
    {
      key: 'jmpFirstCol',
      valid: true,
    },
    {
      key: 'jmpLastCol',
      valid: true,
    },
    {
      key: 'jmpFirstRow',
      valid: true,
    },
    {
      key: 'jmpLastRow',
      valid: true,
    },
  ]);
}
