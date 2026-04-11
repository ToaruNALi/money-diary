import { Component, computed, signal } from '@angular/core';
import { CellClickedEvent, CellContextMenuEvent } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import { SettingUsecase } from 'src/app/features/money-diary/setting/setting.usecase';
import {
  GridBtm,
  GridComponent,
  GridInput,
  GridOptInput,
  GridTop,
} from 'src/app/shared/grid/grid.component';
import { ValType } from 'src/app/shared/signal-form/signal-form.component';
import { CMN_COL } from 'src/app/shared/utils/util-row';

@Component({
  imports: [GridComponent],
  templateUrl: './setting.component.html',
})
export abstract class SettingComponent extends MoneyDiaryBaseComponent {
  /** Grid入力データ */
  protected readonly gridInput = computed<GridInput>(() => ({
    style: this.style,
    tbl: this.tbl,
    colDefs: this.colDefs,
    rows: this.rows,
    topOpt: this.gridTopOpt,
    btmOpt: this.gridBtmOpt,
    cellClickForbCols: this.cellClickForbCols,
  }));
  /** スタイル */
  private readonly style = signal<Record<string, string>>({
    width: '100vw',
    height: 'calc(100vh - 200px - 25px)',
  });
  /** 列定義 */
  private readonly colDefs = computed(() =>
    this.usecase.getColDefs(this.inputRows(), this.crdRows()),
  );
  /** 行データ */
  private readonly rows = computed(() =>
    this.usecase.getRows(this.mainRows(), this.inputRows(), this.crdRows()),
  );
  /** グリッド上ボタンオプション */
  private readonly gridTopOpt = signal<GridOptInput<GridTop>>({
    selSts: {
      func: this.usecase.calcSelStatus,
    },
  });
  /** グリッド下ボタンオプション */
  private readonly gridBtmOpt = signal<GridOptInput<GridBtm>>({
    addRow: {
      valid: true,
      dspOdr: 0,
    },
    chgSel: {
      valid: true,
      dspOdr: 1,
    },
    jmpFirstRow: {
      valid: true,
      dspOdr: 2,
    },
    jmpLastRow: {
      valid: true,
      dspOdr: 3,
    },
  });
  /** セルクリック禁止列 */
  private readonly cellClickForbCols = signal([CMN_COL.LABEL]);

  constructor(protected override readonly usecase: SettingUsecase) {
    super(usecase);
  }

  /**
   * セルクリック時
   * @param event
   */
  protected readonly onClickCell = async (
    event?: CellClickedEvent<Row, ValType>,
  ): Promise<void> => {
    // 行データ編集処理
    const edtInf = await this.usecase.openDialog({
      tbl: this.tbl(),
      allTblRows: this.tblMap(),
      selectedRows: event?.data,
    });
    if (!!edtInf) {
      this.rowEdt.emit(edtInf);
    }
  };

  /**
   * セル長押し時
   */
  protected readonly onCellContextMenu = (_: CellContextMenuEvent): void => {};
}
