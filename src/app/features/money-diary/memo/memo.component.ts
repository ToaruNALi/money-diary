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
import * as Util from 'src/app/shared/constants/utils';
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
  private readonly style = computed<Record<string, string>>(() => ({
    width: '100vw',
    height: `calc(100vh - 200px - ${!!this.fltKey() ? 48 : 0}px)`,
  }));
  /** 列定義 */
  private readonly colDefs = computed<ColDef<Row, ValType>[]>(() => {
    if (!!this.fltKey()) {
      // 詳細
      return this.usecase.getColDefsDetail(this.mainRows(), this.fltKey());
    }
    // 一覧
    return this.usecase.getColDefs(this.mainRows());
  });
  /** 行データ */
  private readonly rows = computed(() => {
    return this.mainRows().filter((row) => {
      if (!!this.fltKey()) {
        // 詳細データ
        return (
          (row[Const.MEM_COL.MODE] === Const.MEMO_MODE.DETAIL &&
            row[Const.MEM_COL.LABEL] === this.fltKey()) ||
          row[Const.MEM_COL.INPUT_MODE] === Const.INPUT_MODE.NONE
        );
      } else {
        // 一覧データ
        return (
          row[Const.MEM_COL.MODE] === Const.MEMO_MODE.LIST ||
          row[Const.MEM_COL.INPUT_MODE] === Const.INPUT_MODE.NONE
        );
      }
    });
  });
  /** グリッド下ボタンオプション */
  private readonly gridBtmOpt = signal<GridOptInput<GridBtmOptKey>[]>([
    {
      key: 'addRow',
      valid: true,
    },
    {
      key: 'fltOff',
      valid: true,
    },
    {
      key: 'quickFlt',
      valid: true,
    },
    {
      key: 'chgSel',
      valid: true,
    },
    {
      key: 'sort',
      valid: true,
      detail: [
        { col: Const.MEM_COL.STATUS, asc: false },
        { col: Const.MEM_COL.VALID },
        { col: Const.MAIN_COL.DATE },
      ],
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
  private readonly cellClickForbCols = signal([
    Const.MEM_COL.LABEL,
    Const.MEM_COL.DETAIL_COUNT,
    Const.MEM_COL.DISPLAY_COLUMNS,
    Const.MEM_COL.VALID_COLUMNS,
    Const.MEM_COL.DETAIL,
  ]);

  /** 戻るボタン表示制御 */
  protected readonly dspBackBtn = computed(() => {
    return !!this.fltKey() ? 'flex' : 'none';
  });

  /**
   * グリッド初期化処理
   */
  protected readonly onReadyGrid = (event: GridReadyEvent): void => {
    this.gridApi = event.api;
  };

  /**
   * セルクリック時
   * @param event
   */
  protected readonly onClickCell = async (
    event: CellClickedEvent<Row, ValType>,
  ): Promise<void> => {
    if (event.column.getId() === Const.MEM_COL.LABEL) {
      // 一覧データ編集
      const edtInf = await this.usecase.procEditRows(
        [event.data],
        this.tbl(),
        this.tblMap(),
        { type: Const.MEMO_MODE.LIST, fltKey: this.fltKey() },
      );
      if (!!edtInf) {
        this.rowEdt.emit(edtInf);
      }
    } else if (event.column.getId() === Const.MEM_COL.DETAIL) {
      // 詳細データ編集
      const edtInf = await this.usecase.procEditRows(
        [event.data],
        this.tbl(),
        this.tblMap(),
        { type: Const.MEMO_MODE.DETAIL, fltKey: this.fltKey() },
      );
      if (!!edtInf) {
        this.rowEdt.emit(edtInf);
      }
    } else {
      if (Util.checkInputMode(event.data ?? {}, Const.INPUT_MODE.NONE)) {
        return;
      }
      // 詳細データに切り替える
      this.fltKey.set(event.data?.[Const.MEM_COL.ID]?.toString() ?? '');
    }
  };

  /**
   * 戻るボタン押下時
   */
  protected readonly onClickBack = (): void => {
    // 一覧データに切り替える
    this.fltKey.set('');
  };
}
