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
import {
  GridBtmOptKey,
  GridComponent,
  GridInput,
  GridOptInput,
} from 'src/app/shared/grid/grid.component';
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

  /** Grid入力データ */
  protected readonly gridInput = computed<GridInput>(() => ({
    style: this.style,
    tbl: this.tbl,
    colDefs: this.colDefs,
    rows: this.rows,
    btmOpt: this.gridBtmOpt,
    cellClickForbCols: this.cellClickForbCols,
  }));
  /** スタイル */
  private readonly style = signal<Record<string, string>>({
    width: '100vw',
    height: 'calc(100vh - 200px)',
  });
  /** 列定義 */
  private readonly colDefs = signal<ColDef<Row, ValType>[]>([]);
  /** 行データ */
  private readonly rows = computed(() => this.mainRows());
  /** グリッド下ボタンオプション */
  private readonly gridBtmOpt = signal<GridOptInput<GridBtmOptKey>[]>([
    {
      key: 'addRow',
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
  /** セルクリック禁止列 */
  private readonly cellClickForbCols = signal([Const.CMN_COL.LABEL]);

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
