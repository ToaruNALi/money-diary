import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
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
import * as Const from 'src/app/shared/constants/constants';
import { MenuListData, ValType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { SelectOption } from 'src/app/shared/forms/forms.component';
import {
  GridBtm,
  GridComponent,
  GridInput,
  GridOptInput,
  GridTop,
} from 'src/app/shared/grid/grid.component';
import { MoneyStatusComponent } from 'src/app/shared/money-status/money-status.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoneyDiaryInputComponent extends MoneyDiaryBaseComponent {
  /** usecase */
  // private readonly usecase = inject(MoneyDiaryInputUsecase);
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
      Util.getRowEdtDel(
        this.tbl(),
        Util.getRowIds(this.gridApi.getSelectedRows()),
      ),
    ]);
  };

  /**
   * 置換時(コンテキストメニュー)
   */
  private readonly onReplace = async (): Promise<void> => {
    // 行データ編集処理
    const edtInf = await this.usecase.procEditRows(
      this.gridApi.getSelectedRows(),
      this.tbl(),
      this.tblMap(),
      { type: INPUT_OPTION_TYPE.REPLACE },
    );
    if (!!edtInf) {
      this.rowEdt.emit(edtInf);
    }
  };

  /**
   * 連番付与(コンテキストメニュー)
   */
  private readonly onSerialNumber = async (): Promise<void> => {
    // 行データ編集処理
    const edtInf = await this.usecase.procEditRows(
      this.gridApi.getSelectedRows(),
      this.tbl(),
      this.tblMap(),
      { type: INPUT_OPTION_TYPE.SERIAL_NUM },
    );
    if (!!edtInf) {
      this.rowEdt.emit(edtInf);
    }
  };

  /**
   * まとめて更新(コンテキストメニュー)
   */
  private readonly onUpdate = async (): Promise<void> => {
    // 行データ編集処理
    const edtInf = await this.usecase.procEditRows(
      this.gridApi.getSelectedRows(),
      this.tbl(),
      this.tblMap(),
      { type: INPUT_OPTION_TYPE.UPDATE },
    );
    if (!!edtInf) {
      this.rowEdt.emit(edtInf);
    }
  };

  /**
   * まとめてコピー(コンテキストメニュー)
   */
  private readonly onCopy = (): void => {
    this.rowEdt.emit([
      Util.getRowEdtAdd(
        this.tbl(),
        this.gridApi.getSelectedRows(),
        [],
        Util.getRowIdsSet(this.rows()),
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
          const label = row[Const.MAIN_COL.MEMO]?.toString() ?? '';
          if (!label || optLabelSet.has(label)) {
            // メモが空欄、または既にに存在する場合、オートコンプリートに追加しない
            continue;
          }

          optLabelSet.add(label);
          autocompData.push({
            id: row[Const.CMN_COL.ID]?.toString() ?? '',
            value: label,
            lb: label,
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
        { col: Const.MAIN_COL.INPUT_MODE, asc: false },
        { col: Const.MAIN_COL.DATE },
      ],
    },
  });

  /** セルクリック禁止列 */
  private readonly cellClickForbCols = signal([Const.MAIN_COL.AMOUNT]);

  /** ステータスリスト */
  protected readonly statusList = computed(() =>
    this.usecase.calcStatusList(this.mainRows(), this.crdRows()),
  );

  /**
   * セルクリック時
   * @param event
   */
  protected readonly onClickCell = (
    event?: CellClickedEvent<Row, ValType>,
  ): void => {
    Util.procClick(
      Const.TIME.DOUBLE_CLICK,
      // 1回クリック時
      async () => {
        // 行データ編集処理
        const edtInf = await this.usecase.procEditRows(
          !!event ? [event.data] : [],
          this.tbl(),
          this.tblMap(),
        );

        if (!!edtInf) {
          this.rowEdt.emit(edtInf);
        }
      },
      // 2回クリック時
      () => {},
    );
  };

  /**
   * ステータスリスト押下時
   */
  protected readonly onClickStatusContent = (): void => {
    this.scrIdSet.emit(Const.SCR.STORAGE);
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
        Util.getRowEdtAdd(
          this.tbl(),
          [
            {
              ...event.data,
              [Const.MAIN_COL.DATE]: Util.getDate(),
              [Const.MAIN_COL.USE_DATE]: Util.getDate(),
            },
          ],
          [],
          Util.getRowIdsSet(this.rows()),
        ),
      ]);
    }
  };
}
