import { Component, computed, signal } from '@angular/core';
import { CellClickedEvent } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import { ScheduleUsecase } from 'src/app/features/money-diary/schedule/schedule.usecase';
import { GridComponent, GridInput } from 'src/app/shared/grid/grid.component';
import { ValType } from 'src/app/shared/signal-form/signal-form.component';
import { CMN_COL } from 'src/app/shared/utils/util-row';
import { SharedCommonModule } from '../../../shared/shared-common.module';

@Component({
  selector: 'app-schedule',
  imports: [SharedCommonModule, GridComponent],
  providers: [ScheduleUsecase],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent extends MoneyDiaryBaseComponent {
  /** usecase */
  constructor(protected override readonly usecase: ScheduleUsecase) {
    super(usecase);
  }
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
  private readonly cellClickForbCols = signal([CMN_COL.LABEL]);

  /**
   * セルクリック時
   * @param event
   */
  protected readonly onClickCell = async (
    event: CellClickedEvent<Row, ValType>,
  ): Promise<void> => {
    // // 行データ編集処理
    // const edtInf = await this.usecase.procEditRows(
    //   [event.data],
    //   this.tbl(),
    //   this.tblMap(),
    // );
    // if (!!edtInf) {
    //   this.rowEdt.emit(edtInf);
    // }
  };
}
