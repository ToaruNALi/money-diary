import { Component, computed, signal } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CellClickedEvent,
  CellContextMenuEvent,
  RowClassParams,
  RowStyle,
} from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import {
  INPUT_OPTION_TYPE,
  MoneyDiaryInputUsecase,
} from 'src/app/features/money-diary/money-diary-input/money-diary-input.usecase';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import {
  GridBtm,
  GridComponent,
  GridInput,
  GridOptInput,
  GridTop,
} from 'src/app/shared/grid/grid.component';
import { MoneyStatusComponent } from 'src/app/shared/money-status/money-status.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import {
  SelectOption,
  ValType,
} from 'src/app/shared/signal-form/signal-form.component';
import {
  CMN_COL,
  cvtDateToStr,
  getRowEdtAdd,
  getRowEdtDel,
  getRowIds,
  getRowIdsSet,
  MAIN_COL,
} from 'src/app/shared/utils/util-row';
import { MenuListData, SCR } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-money-diary-input',
  imports: [
    SharedCommonModule,
    FormsCommonModule,
    GridComponent,
    MatMenuModule,
    MatSnackBarModule,
    MoneyStatusComponent,
  ],
  providers: [MoneyDiaryInputUsecase],
  templateUrl: './money-diary-input.component.html',
  styleUrl: './money-diary-input.component.scss',
})
export class MoneyDiaryInputComponent extends MoneyDiaryBaseComponent {
  /** usecase */
  constructor(protected override readonly usecase: MoneyDiaryInputUsecase) {
    super(usecase);
  }

  /** Grid入力データ */
  protected readonly gridInput = computed<GridInput>(() => ({
    style: this.style,
    tbl: this.tbl,
    colDefs: this.colDefs,
    rows: this.rows,
    topOpt: this.gridTopOpt,
    btmOpt: this.gridBtmOpt,
    cellClickForbCols: this.cellClickForbCols,
    rowStyle: this.rowStyle,
  }));

  /** スタイル */
  private readonly style = signal<Record<string, string>>({
    width: '100vw',
    height: 'calc(100vh - 200px - 25px - 25px)',
  });
  /** 行スタイル */
  private readonly rowStyle = signal(
    (_params: RowClassParams<Row>, rowStyle: RowStyle) => rowStyle,
  );
  /** 列定義 */
  private readonly colDefs = computed(() =>
    this.usecase.getColDefs(
      this.stgRows(),
      this.crdRows(),
      this.itmRows(),
      this.rmkRows(),
    ),
  );
  /** 行データ */
  private readonly rows = computed(() =>
    this.usecase.getRows(this.mainRows(), this.crdRows()),
  );
  /** グリッド上ボタンオプション */
  private readonly gridTopOpt = signal<GridOptInput<GridTop>>({
    selSts: {
      func: this.usecase.calcSelStatus,
    },
  });

  /**
   * 削除時(コンテキストメニュー)
   */
  private readonly onDelete = (): void => {
    this.rowEdt.emit([
      getRowEdtDel(this.tbl(), getRowIds(this.gridApi.getSelectedRows())),
    ]);
  };

  /**
   * 置換時(コンテキストメニュー)
   */
  private readonly onReplace = async (): Promise<void> => {
    // 行データ編集処理
    const edtInf = await this.usecase.openDialog({
      selectedRows: this.gridApi.getSelectedRows(),
      tbl: this.tbl(),
      allTblRows: this.tblMap(),
      option: { type: INPUT_OPTION_TYPE.REPLACE },
    });

    if (!!edtInf) {
      this.rowEdt.emit(edtInf);
    }
  };

  /**
   * 連番付与(コンテキストメニュー)
   */
  private readonly onSerialNumber = async (): Promise<void> => {
    // 行データ編集処理
    const edtInf = await this.usecase.openDialog({
      selectedRows: this.gridApi.getSelectedRows(),
      tbl: this.tbl(),
      allTblRows: this.tblMap(),
      option: { type: INPUT_OPTION_TYPE.SERIAL_NUM },
    });
    if (!!edtInf) {
      this.rowEdt.emit(edtInf);
    }
  };

  /**
   * まとめて更新(コンテキストメニュー)
   */
  private readonly onUpdate = async (): Promise<void> => {
    // 行データ編集処理
    const edtInf = await this.usecase.openDialog({
      selectedRows: this.gridApi.getSelectedRows(),
      tbl: this.tbl(),
      allTblRows: this.tblMap(),
      option: { type: INPUT_OPTION_TYPE.UPDATE },
    });
    if (!!edtInf) {
      this.rowEdt.emit(edtInf);
    }
  };

  /**
   * まとめてコピー(コンテキストメニュー)
   */
  private readonly onCopy = (): void => {
    this.rowEdt.emit([
      getRowEdtAdd(
        this.tbl(),
        this.gridApi.getSelectedRows(),
        [],
        getRowIdsSet(this.rows()),
      ),
    ]);
  };

  /** グリッド下ボタンオプション */
  private readonly gridBtmOpt = signal<GridOptInput<GridBtm>>({
    menuList: {
      valid: true,
      dspOdr: 0,
      detail: [
        {
          id: 'replace',
          lb: 'Replace',
          ic: 'find_replace',
          func: this.onReplace,
        },
        {
          id: 'serialNumber',
          lb: 'Serial Number',
          ic: '123',
          func: this.onSerialNumber,
        },
        {
          id: 'update',
          lb: 'Update',
          ic: 'edit',
          func: this.onUpdate,
        },
        {
          id: 'copy',
          lb: 'Copy & Paste',
          ic: 'copy_all',
          func: this.onCopy,
        },
        {
          id: 'delete',
          lb: 'Delete',
          ic: 'delete',
          func: this.onDelete,
        },
      ] as (MenuListData & { func: () => {} })[],
      iconList: ['menu'],
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
      dspOdr: 4,
    },
    quickFlt: {
      valid: true,
      dspOdr: 5,
      detail: () => {
        // オートコンプリートデータの設定
        const autocompData: SelectOption[] = [];
        const optLabelSet: Set<string> = new Set();
        const reverseRows = this.rows().toReversed();
        for (const row of reverseRows) {
          const label = row[MAIN_COL.MEMO]?.toString() ?? '';
          if (!label || optLabelSet.has(label)) {
            // メモが空欄、または既にに存在する場合、オートコンプリートに追加しない
            continue;
          }

          optLabelSet.add(label);
          autocompData.push({
            id: row[CMN_COL.ID]?.toString() ?? '',
            value: label,
            label: label,
          });
        }

        return autocompData;
      },
    },
    search: {
      valid: true,
      dspOdr: 6,
    },
    jmpFirstRow: {
      valid: true,
      dspOdr: 7,
    },
    jmpLastRow: {
      valid: true,
      dspOdr: 8,
    },
    sort: {
      valid: true,
      dspOdr: 9,
      detail: [
        { col: MAIN_COL.INPUT_MODE, asc: false },
        { col: MAIN_COL.DATE },
      ],
    },
  });

  /** セルクリック禁止列 */
  private readonly cellClickForbCols = signal([MAIN_COL.AMOUNT]);

  /** ステータスリスト */
  protected readonly statusList = computed(() =>
    this.usecase.calcStatusList(this.mainRows(), this.crdRows()),
  );

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
      option: { type: INPUT_OPTION_TYPE.DEFAULT },
    });

    if (!!edtInf) {
      this.rowEdt.emit(edtInf);
    }
  };

  /**
   * ステータスリスト押下時
   */
  protected readonly onClickStatusContent = (): void => {
    this.scrIdSet.emit(SCR.STORAGE);
  };

  /**
   * 長押し時
   * @param event
   */
  protected readonly onCellContextMenu = (
    event: CellContextMenuEvent,
  ): void => {
    if ((this.cellClickForbCols() as string[]).includes(event.column.getId())) {
      // セルクリック禁止列の場合
      this.rowEdt.emit([
        getRowEdtAdd(
          this.tbl(),
          [
            {
              ...event.data,
              [MAIN_COL.DATE]: cvtDateToStr(),
              [MAIN_COL.USE_DATE]: cvtDateToStr(),
            },
          ],
          [],
          getRowIdsSet(this.rows()),
        ),
      ]);
    }
  };
}
