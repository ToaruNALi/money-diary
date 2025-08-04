import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CellClickedEvent } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import { ScheduleUsecase } from 'src/app/features/money-diary/schedule/schedule.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { ValType } from 'src/app/shared/constants/types';
import { GridComponent, GridInput } from 'src/app/shared/grid/grid.component';
import { SharedCommonModule } from '../../../shared/shared-common.module';

@Component({
  selector: 'app-schedule',
  imports: [SharedCommonModule, GridComponent],
  providers: [ScheduleUsecase],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleComponent extends MoneyDiaryBaseComponent {
  /** usecase */
  private readonly usecase = inject(ScheduleUsecase);

  /** Other Row Datas */
  readonly inputRows = input.required<Row[]>();

  /** Grid入力データ */
  protected readonly gridInput = computed<GridInput>(() => ({
    style: this.style,
    tbl: this.tbl,
    colDefs: this.colDefs,
    rows: this.rows,
    cellClickForbCols: this.cellClickForbCols,
  }));

  /** スタイル */
  private readonly style = signal<Record<string, string>>({
    width: '100vw',
    height: 'calc(100vh - 230px)',
  });
  /** 列定義 */
  private readonly colDefs = computed(() => this.usecase.getColDefs());
  /** 行データ */
  private readonly rows = computed(() =>
    this.usecase.getRows(this.mainRows(), this.inputRows()),
  );
  /** セルクリック禁止列 */
  private readonly cellClickForbCols = signal([Const.CMN_COL.LABEL]);

  /**
   * セルクリック時
   * @param event
   */
  protected readonly onClickCell = async (
    event: CellClickedEvent<Row, ValType>,
  ): Promise<void> => {
    // 入力チェック
    const check = this.usecase.checkInputData(event);
    if (!check) {
      return;
    }
    // ダイアログ入力データ作成
    const rows = this.mainRows();
    const input = this.usecase.createInputData([event.data!], this.tbl());
    // ダイアログオープン
    const output = await this.usecase.openDialog(input);
    if (!output) {
      return;
    }
    // 行編集Emitterデータ作成
    const result = this.usecase.createResultData(
      output,
      [event.data!],
      rows,
      this.tbl(),
    );
    // Emit
    this.rowEdt.emit(result);
  };
}
