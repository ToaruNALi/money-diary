import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CellClickedEvent,
  CellContextMenuEvent,
  GridReadyEvent,
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
  GridBtmOptKey,
  GridComponent,
  GridInput,
  GridOptInput,
  GridTopOptKey,
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
  private readonly usecase = inject(MoneyDiaryInputUsecase);

  /** 過去データ編集可能フラグ */
  readonly edtPastData = input.required<boolean>();

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
    height: 'calc(100vh - 200px - 25px - 25px)',
  });
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
  private readonly rows = computed(() => {
    const filter = this.filter();
    if (filter !== 'none') {
      this.gridApi?.setFilterModel(null);
      this.gridApi?.setFilterModel(filter);
    }
    return this.usecase.getRows(this.mainRows(), this.crdRows());
  });
  /** グリッド上ボタンオプション */
  private readonly gridTopOpt = signal<GridOptInput<GridTopOptKey>[]>([
    {
      key: 'selSts',
      func: this.usecase.calcSelStatus,
    },
  ]);

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
      { type: INPUT_OPTION_TYPE.REPLACE, edtPastData: this.edtPastData() },
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
      { type: INPUT_OPTION_TYPE.SERIAL_NUM, edtPastData: this.edtPastData() },
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
      { type: INPUT_OPTION_TYPE.UPDATE, edtPastData: this.edtPastData() },
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
  private readonly gridBtmOpt = signal<GridOptInput<GridBtmOptKey>[]>([
    {
      key: 'menuList',
      valid: true,
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
    {
      key: 'addRow',
      valid: true,
    },
    {
      key: 'chgFlt',
      valid: true,
    },
    {
      key: 'fltOff',
      valid: true,
    },
    {
      key: 'quickFlt',
      valid: true,
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
    {
      key: 'chgSel',
      valid: true,
    },
    {
      key: 'sort',
      valid: true,
      detail: [
        { col: Const.MAIN_COL.INPUT_MODE, asc: false },
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
  private readonly cellClickForbCols = signal([Const.MAIN_COL.DATE]);

  /** ステータスリスト */
  protected readonly statusList = computed(() =>
    this.usecase.calcStatusList(this.mainRows(), this.crdRows()),
  );

  /**
   * グリッド初期化処理
   * @param event
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
    // 行データ編集処理
    const edtInf = await this.usecase.procEditRows(
      [event.data],
      this.tbl(),
      this.tblMap(),
      { edtPastData: this.edtPastData() },
    );

    if (!!edtInf) {
      this.rowEdt.emit(edtInf);
    }
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
