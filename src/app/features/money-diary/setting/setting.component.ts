import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CellClickedEvent, CellContextMenuEvent } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { MainCol, ValType } from 'src/app/shared/constants/types';
import {
  GridAboveContentOption,
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
  readonly inputRows = input.required<Row[]>();
  /** Creditデータ */
  readonly crdRows = input<Row[]>([]);

  /** 列定義 */
  protected override readonly colDefs = computed(() =>
    this.usecase.getColDefs(this.inputRows(), this.crdRows()),
  );
  /** 行データ */
  protected override readonly rows = computed(() =>
    this.usecase.getRows(this.mainRows(), this.inputRows(), this.crdRows()),
  );
  /** グリッド上ボタンオプション */
  protected readonly aboveContentOption = computed<GridAboveContentOption>(
    () => ({
      calcSelectStatus: this.usecase.calcSelStatus,
    }),
  );
  /** グリッド下ボタンオプション */
  protected readonly belowContentOption = computed<GridBelowContentOption>(
    () => ({
      addRow: () => this.mainRows().every((dt) => !!dt[Const.CMN_COL.LABEL]),
      changeSelection: true,
      jumpFirstRow: true,
      jumpLastRow: true,
    }),
  );
  /** セルクリック禁止列 */
  protected readonly cellClickForbColumns = [
    Const.CMN_COL.LABEL,
  ] as const satisfies string[];

  /** 入力データ関連列ID */
  protected abstract readonly inputColId: MainCol;

  constructor(protected readonly usecase: SettingUsecase) {
    super();
  }

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
    const input = this.usecase.createInputData(
      [event.data!],
      this.tbl(),
      [this.mainRows(), this.inputRows()],
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
      this.mainRows(),
      this.tbl(),
    );
    // Emit
    this.rowEdt.emit(result);
  };

  /**
   * セル長押し時
   */
  protected readonly onCellContextMenu = (_: CellContextMenuEvent): void => {};
}
