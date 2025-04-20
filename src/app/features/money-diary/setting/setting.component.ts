import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import {
  CellClickedEvent,
  CellContextMenuEvent,
  RowClassParams,
  RowStyle,
} from 'ag-grid-community';
import { RowData } from 'src/app/domain/row-data';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { MoneyDiaryColId, ValueType } from 'src/app/shared/constants/types';
import {
  GridBelowContentOption,
  GridComponent,
} from 'src/app/shared/grid/grid.component';

@Component({
  imports: [GridComponent],
  templateUrl: './setting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class SettingComponent extends MoneyDiaryBaseComponent {
  /** 入力データ */
  readonly inputDatas = input.required<RowData[]>();
  /** Creditデータ */
  readonly creditDatas = input<RowData[]>([]);

  /** 列定義 */
  protected override readonly colDefs = computed(() =>
    this.usecase.getColDefs(this.inputDatas(), this.creditDatas()),
  );
  /** 行データ */
  protected override readonly rowDatas = computed(() =>
    this.usecase.getRowDatas(
      this.mainRowDatas(),
      this.inputDatas(),
      this.creditDatas(),
    ),
  );
  /** 行スタイル */
  protected readonly rowStyle = signal<{ (params: RowClassParams): RowStyle }>(
    this.usecase.getRowStyle,
  );
  /** グリッド下ボタンオプション */
  protected readonly belowContentOption = {
    addRow: (rowDatas) =>
      rowDatas.every((dt) => !!dt[Const.ROW_DATA_COMMON_COL_ID.LABEL]),
    jumpFirstRow: true,
    jumpLastRow: true,
  } as const satisfies GridBelowContentOption;
  /** セルクリック禁止列 */
  protected readonly cellClickForbColumns = [
    Const.ROW_DATA_COMMON_COL_ID.LABEL,
  ] as const satisfies string[];

  /** 入力データ関連列ID */
  protected abstract readonly inputColId: MoneyDiaryColId;

  constructor(protected readonly usecase: SettingUsecase) {
    super();
  }

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
    const input = this.usecase.createInputData(
      [event.data!],
      this.rowDataKey(),
      [this.mainRowDatas(), this.inputDatas()],
      this.inputColId,
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
      this.mainRowDatas(),
      this.rowDataKey(),
    );
    // Emit
    this.rowDataEdits.emit(result);
  };

  /**
   * セル長押し時
   */
  protected readonly onCellContextMenu = (_: CellContextMenuEvent): void => {};
}
