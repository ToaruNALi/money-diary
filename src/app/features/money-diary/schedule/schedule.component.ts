import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CellClickedEvent, RowClassParams, RowStyle } from 'ag-grid-community';
import { RowData } from 'src/app/domain/row-data';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import { ScheduleUsecase } from 'src/app/features/money-diary/schedule/schedule.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { ValueType } from 'src/app/shared/constants/types';
import { GridComponent } from 'src/app/shared/grid/grid.component';
import { SharedCommonModule } from '../../../shared/shared-common.module';

@Component({
    selector: 'app-schedule',
    imports: [SharedCommonModule, GridComponent],
    providers: [ScheduleUsecase],
    templateUrl: './schedule.component.html',
    styleUrl: './schedule.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleComponent extends MoneyDiaryBaseComponent {
  /** usecase */
  private readonly usecase = inject(ScheduleUsecase);

  /** Other Row Datas */
  readonly inputDatas = input.required<RowData[]>();

  /** 列定義 */
  protected override readonly colDefs = computed(() =>
    this.usecase.getColDefs(),
  );
  /** 行データ */
  protected override readonly rowDatas = computed(() =>
    this.usecase.getRowDatas(this.mainRowDatas(), this.inputDatas()),
  );
  /** 行スタイル */
  protected readonly rowStyle = signal<{ (params: RowClassParams): RowStyle }>(
    this.usecase.getRowStyle,
  );

  /** セルクリック禁止列 */
  protected readonly cellClickForbColumns = [
    Const.SCHEDULE_COL_ID.LABEL,
  ] as const satisfies string[];

  /**
   * セルクリック時
   * @param event
   */
  protected readonly onClickCell = async (
    event: CellClickedEvent<RowData, ValueType>,
  ): Promise<void> => {
    // 入力チェック
    const check = this.usecase.checkInputData(event);
    if (!check) {
      return;
    }
    // ダイアログ入力データ作成
    const rowDatas = this.mainRowDatas();
    const input = this.usecase.createInputData(
      [event.data!],
      this.rowDataKey(),
    );
    // ダイアログオープン
    const output = await this.usecase.openDialog(input);
    if (!output) {
      return;
    }
    // 行編集Emitterデータ作成
    const result = this.usecase.createResultData(
      output,
      [event.data!],
      rowDatas,
      this.rowDataKey(),
    );
    // Emit
    this.rowDataEdits.emit(result);
  };
}
