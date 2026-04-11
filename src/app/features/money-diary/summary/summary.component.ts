import { Component } from '@angular/core';
import { SummaryUsecase } from 'src/app/features/money-diary/summary/summary.usecase';
import { GridComponent } from 'src/app/shared/grid/grid.component';

@Component({
  selector: 'app-summary',
  imports: [GridComponent],
  providers: [SummaryUsecase],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent {
  // TODO: 一から作成し直す
  // /** usecase */
  // constructor(protected override readonly usecase: SummaryUsecase) {
  //   super(usecase);
  // }
  // /** Grid入力データ */
  // protected readonly gridInput = computed<GridInput>(() => ({
  //   style: this.style,
  //   tbl: this.tbl,
  //   colDefs: this.colDefs,
  //   rows: this.rows,
  //   btmOpt: this.gridBtmOpt,
  // }));
  // /** スタイル */
  // private readonly style = signal<Record<string, string>>({
  //   width: '100vw',
  //   height: 'calc(100vh - 200px)',
  // });
  // /** 列定義 */
  // private readonly colDefs = computed(() =>
  //   this.usecase.getColDefs(this.inputRows(), this.itmRows()),
  // );
  // /** 行データ */
  // private readonly rows = computed(() =>
  //   this.usecase.getRows(this.inputRows(), this.itmRows()),
  // );
  // /** グリッド下ボタンオプション */
  // private readonly gridBtmOpt = signal<GridOptInput<GridBtm>>({
  //   jmpFirstCol: {
  //     valid: true,
  //     dspOdr: 0,
  //   },
  //   jmpLastCol: {
  //     valid: true,
  //     dspOdr: 1,
  //   },
  //   jmpFirstRow: {
  //     valid: true,
  //     dspOdr: 2,
  //   },
  //   jmpLastRow: {
  //     valid: true,
  //     dspOdr: 3,
  //   },
  // });
}
