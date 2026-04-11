import { Component, computed, signal } from '@angular/core';
import { CellClickedEvent, ColDef } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { MemoUsecase } from 'src/app/features/money-diary/memo/memo.usecase';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import {
  GridBtm,
  GridComponent,
  GridInput,
  GridOptInput,
} from 'src/app/shared/grid/grid.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { ValType } from 'src/app/shared/signal-form/signal-form.component';
import {
  checkInputMode,
  INPUT_MODE,
  MAIN_COL,
  MEM_COL,
  MEMO_MODE,
} from 'src/app/shared/utils/util-row';

@Component({
  selector: 'app-memo',
  imports: [SharedCommonModule, GridComponent],
  providers: [MemoUsecase],
  templateUrl: './memo.component.html',
  styleUrl: './memo.component.scss',
})
export class MemoComponent extends MoneyDiaryBaseComponent {
  /** usecase */
  constructor(protected override readonly usecase: MemoUsecase) {
    super(usecase);
  }

  /** Grid入力データ */
  protected readonly gridInput = computed<GridInput>(() => ({
    style: this.style,
    tbl: this.tbl,
    rowsKey: this.rowsKey,
    colDefs: this.colDefs,
    rows: this.rows,
    btmOpt: this.gridBtmOpt,
    cellClickForbCols: this.cellClickForbCols,
  }));
  /** スタイル */
  private readonly style = computed<Record<string, string>>(() => ({
    width: '100vw',
    height: `calc(100vh - 200px)`,
  }));
  /** 列定義 */
  private readonly colDefs = computed<ColDef<Row, ValType>[]>(() => {
    if (!!this.rowsKey()) {
      // 詳細
      return this.usecase.getColDefsDetail(this.mainRows(), this.rowsKey());
    }
    // 一覧
    return this.usecase.getColDefs(this.mainRows());
  });
  /** 行データ */
  private readonly rows = computed(() => {
    return this.mainRows().filter((row) => {
      if (!!this.rowsKey()) {
        // 詳細データ
        return (
          (row[MEM_COL.MODE] === MEMO_MODE.DETAIL &&
            row[MEM_COL.LABEL] === this.rowsKey()) ||
          row[MEM_COL.INPUT_MODE] === INPUT_MODE.NONE
        );
      } else {
        // 一覧データ
        return (
          row[MEM_COL.MODE] === MEMO_MODE.LIST ||
          row[MEM_COL.INPUT_MODE] === INPUT_MODE.NONE
        );
      }
    });
  });
  /** グリッド下ボタンオプション */
  private readonly gridBtmOpt = computed<GridOptInput<GridBtm>>(() => ({
    back: {
      valid: true,
      hide: !this.rowsKey(),
      dspOdr: 0,
      func: () => {
        // 一覧データに切り替える
        this.edtRowsKey('');
      },
    },
    addRow: {
      valid: true,
      dspOdr: 1,
    },
    chgSel: {
      valid: true,
      dspOdr: 2,
    },
    fltOff: {
      valid: true,
      dspOdr: 3,
    },
    quickFlt: {
      valid: true,
      dspOdr: 4,
    },
    search: {
      valid: true,
      dspOdr: 5,
    },
    jmpFirstRow: {
      valid: true,
      dspOdr: 6,
    },
    jmpLastRow: {
      valid: true,
      dspOdr: 7,
    },
    sort: {
      valid: true,
      dspOdr: 8,
      detail: [
        { col: MEM_COL.STATUS, asc: false },
        { col: MEM_COL.VALID },
        { col: MAIN_COL.DATE },
      ],
    },
    rowDrg: {
      valid: true,
      dspOdr: 9,
    },
  }));
  /** セルクリック禁止列 */
  private readonly cellClickForbCols = signal([
    MEM_COL.LABEL,
    MEM_COL.DETAIL_COUNT,
    MEM_COL.DISPLAY_COLUMNS,
    MEM_COL.VALID_COLUMNS,
    MEM_COL.DETAIL,
  ]);

  /**
   * セルクリック時
   * @param event
   */
  protected readonly onClickCell = async (
    event?: CellClickedEvent<Row, ValType>,
  ): Promise<void> => {
    // 行データ編集処理
    const callProcEditRows = async (mode: string) => {
      const edtInf = await this.usecase.openDialog({
        tbl: this.tbl(),
        allTblRows: this.tblMap(),
        selectedRows: event?.data,
        option: { type: mode, fltKey: this.rowsKey() },
      });
      if (!!edtInf) {
        this.rowEdt.emit(edtInf.map((inf) => ({ ...inf, rk: this.rowsKey() })));
      }
    };

    if (
      (!event && !this.rowsKey()) ||
      (!!event && event.column.getId() === MEM_COL.LABEL)
    ) {
      // 一覧データ編集
      callProcEditRows(MEMO_MODE.LIST);
    } else if (
      (!event && !!this.rowsKey()) ||
      (!!event && event.column.getId() === MEM_COL.DETAIL)
    ) {
      // 詳細データ編集
      callProcEditRows(MEMO_MODE.DETAIL);
    } else if (!!event) {
      if (checkInputMode(event.data ?? {}, INPUT_MODE.NONE)) {
        return;
      }
      // 詳細データに切り替える
      this.edtRowsKey(event.data?.[MEM_COL.ID]?.toString() ?? '');
    }
  };
}
