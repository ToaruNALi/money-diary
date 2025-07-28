import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CellClickedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { MemoUsecase } from 'src/app/features/money-diary/memo/memo.usecase';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import * as Const from 'src/app/shared/constants/constants';
import { ValType } from 'src/app/shared/constants/types';
import { GridComponent } from 'src/app/shared/grid/grid.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-memo',
  imports: [SharedCommonModule, GridComponent],
  providers: [MemoUsecase],
  templateUrl: './memo.component.html',
  styleUrl: './memo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoComponent extends MoneyDiaryBaseComponent {
  /** usecase */
  private readonly usecase = inject(MemoUsecase);
  /** 列定義 */
  protected override readonly colDefs = signal<ColDef<Row, ValType>[]>([]);
  /** 行データ */
  protected override readonly rows = computed(() => this.mainRows());
  /** グリッド下ボタンオプション */
  protected readonly belowContentOpt = computed(() => ({
    addRow: () => this.mainRows().length === 0,
    jumpFirstRow: true,
    jumpLastRow: true,
  }));
  /** セルクリック禁止列 */
  protected readonly cellClickForbCols = [
    Const.MEM_COL.LABEL,
  ] as const satisfies string[];

  /**
   * グリッド初期化処理
   */
  protected readonly onReadyGrid = (_: GridReadyEvent): void => {
    // 列定義
    this.colDefs.set(this.usecase.getColDefs());
  };

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
