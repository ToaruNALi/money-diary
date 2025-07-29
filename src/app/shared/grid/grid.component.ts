import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  CellContextMenuEvent,
  CellDoubleClickedEvent,
  CellValueChangedEvent,
  ColDef,
  ColGroupDef,
  ColumnHeaderContextMenuEvent,
  FilterModel,
  FirstDataRenderedEvent,
  GetRowIdFunc,
  GetRowIdParams,
  GridApi,
  GridOptions,
  GridReadyEvent,
  iconSetMaterial,
  ITextFilterParams,
  ModelUpdatedEvent,
  RowClassParams,
  RowClickedEvent,
  RowDoubleClickedEvent,
  RowDragEndEvent,
  RowDragEnterEvent,
  RowSelectedEvent,
  RowStyle,
  SelectionChangedEvent,
  themeQuartz,
} from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import { RowEdt, SortOpt, Tbl, ValType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  MoneyStatus,
  MoneyStatusComponent,
} from 'src/app/shared/money-status/money-status.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

/** グリッド */

// TODO: 作成中
/** グリッド入力クラス */
export class GridInputComponent {
  readonly tbl: Tbl;
  readonly style: Record<string, string>;

  rowStyle?: {
    (params: RowClassParams): RowStyle;
  };

  constructor(tbl: Tbl, style: Record<string, string>) {
    this.tbl = tbl;
    this.style = style;
  }
}

export type GridAboveContentOption = {
  calcSelectStatus?: (
    rows: Row[],
    colDefs: (ColDef<Row, any> | ColGroupDef<Row>)[],
  ) => MoneyStatus[];
};
export type GridBelowContentOption = {
  addRow?: boolean | (() => boolean);
  sort?: SortOpt[];
  filterOff?: boolean;
  changeFilter?: boolean;
  changeSelection?: boolean;
  quickFilter?: boolean;
  search?: boolean;
  jumpFirstCol?: boolean;
  jumpLastCol?: boolean;
  jumpFirstRow?: boolean;
  jumpLastRow?: boolean;
};
type BelowOpt = Record<keyof GridBelowContentOption, boolean>;

@Component({
  selector: 'app-grid',
  imports: [SharedCommonModule, AgGridAngular, MoneyStatusComponent],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  /********************
   * input.required
   ********************/
  /** スタイル */
  readonly style = input.required<Record<string, string>>();
  /** 行データKey */
  readonly tbl = input.required<Tbl>();
  /** 列定義 */
  readonly colDefs = input.required<ColDef<Row, ValType>[]>();
  /** 行データ */
  readonly rows = input.required<Row[]>();

  /********************
   * input
   ********************/
  /** 行スタイル */
  readonly rowStyle = input<{
    (params: RowClassParams<Row>): RowStyle;
  }>((params: RowClassParams<Row>) => {
    const style: RowStyle = {};
    const mode = params.data?.[Const.CMN_COL.INPUT_MODE];

    if (mode === Const.INPUT_MODE.NONE) {
      // 空データ
      style['backgroundColor'] = Const.ROW_CLR.NONE;
    } else if (mode === Const.INPUT_MODE.SOME_REQ) {
      // エラーデーア
      style['backgroundColor'] = Const.ROW_CLR.ERROR;
    }
    return style;
  });
  /** Grid上ボタンオプション */
  readonly aboveContentOption = input<GridAboveContentOption>(); // HTMLが!!で判定しているため初期値不要
  /** Grid下ボタンオプション */
  readonly belowContentOpt = input<GridBelowContentOption>(); // HTMLが!!で判定しているため初期値不要
  /** セルクリック禁止列 */
  readonly cellClickForbCols = input<string[]>([]);
  /** 空行判定方法 */
  readonly emptyRowJudgeFn = input<(row: Row) => boolean>(
    (row) => !row[Const.CMN_COL.LABEL],
  );

  /********************
   * output
   ********************/
  /** 行更新 Emitter */
  protected readonly rowEdt = output<RowEdt[]>();
  /** 初期化処理 */
  protected readonly gridReady = output<GridReadyEvent>();
  /** 選択チェック処理 */
  protected readonly selectionChange = output<SelectionChangedEvent>();
  /** 行選択 */
  protected readonly rowSelect = output<RowSelectedEvent>();
  /** 値変更処理 */
  protected readonly cellValueChange = output<CellValueChangedEvent>();
  /** セルクリック(禁止列) */
  protected readonly cellClick = output<CellClickedEvent>();
  /** セルクリック */
  protected readonly selectCellClick = output<CellClickedEvent>();
  /** セルダブルクリック */
  protected readonly cellDoubleClick = output<CellDoubleClickedEvent>();
  /** 行クリック */
  protected readonly rowClick = output<RowClickedEvent>();
  /** 行ダブルクリック */
  protected readonly rowDoubleClick = output<RowDoubleClickedEvent>();
  /** ドラッグ後 */
  protected readonly rowDragEnd = output<RowDragEndEvent>();
  /** ドラッグ開始 */
  protected readonly rowDragEnter = output<RowDragEnterEvent>();
  /** セル長押し */
  protected readonly cellContextMenu = output<CellContextMenuEvent>();
  /** ヘッダー長押し */
  protected readonly columnHeaderLongClick =
    output<ColumnHeaderContextMenuEvent>();

  /********************
   * viewChild
   ********************/
  /** QuickFilterText */
  private readonly quickFilterText =
    viewChild.required<ElementRef<HTMLInputElement>>('quickFilterText');

  /** Gridテーマ */
  protected readonly myTheme = themeQuartz
    .withPart(iconSetMaterial)
    .withParams({
      // accentColor: '#FF00FF',
      accentColor: '#69f0ae',
      backgroundColor: '#0C0C0D',
      oddRowBackgroundColor: '#182226AA',
      borderColor: '#FFFFFF00',
      borderRadius: '10px',
      browserColorScheme: 'dark',
      cellHorizontalPaddingScale: 1,
      chromeBackgroundColor: {
        ref: 'backgroundColor',
      },
      columnBorder: true,
      fontFamily: {
        googleFont: 'Roboto',
      },
      fontSize: '13px',
      foregroundColor: Const.FONT_CLR.DEF,
      headerBackgroundColor: '#182226',
      headerFontFamily: {
        googleFont: 'Roboto',
      },
      headerFontSize: '13px',
      headerFontWeight: 500,
      headerTextColor: '#FFFFFF',
      headerVerticalPaddingScale: 0.9,
      iconSize: '13px',
      rowBorder: false,
      rowVerticalPaddingScale: 1.2,
      sidePanelBorder: false,
      spacing: '8px',
      wrapperBorder: false,
      wrapperBorderRadius: 0,
    });
  /** Gridオプション */
  protected readonly gridOptions = signal<GridOptions<Row>>({
    multiSortKey: 'ctrl', // 複数列ソート用キー: ctrl
    tooltipShowDelay: 0,
    rowDragManaged: true, // 行ドラッグ可能
    suppressMoveWhenRowDragging: true, // 行ドラッグ抑制
    rowDragMultiRow: true, // 複数行ドラッグ
    paginationAutoPageSize: true,
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 20,
    suppressMovableColumns: true, // 列移動不可
    suppressMoveWhenColumnDragging: true, // 列移動抑制
    suppressDragLeaveHidesColumns: true, // 列削除無効
    // 列タイプ
    columnTypes: {
      dateCol: {
        headerClass: 'ag-left-aligned-header',
        cellClass: 'ag-right-aligned-cell',
        cellEditor: 'agDateStringCellEditor',
        filter: 'agDateColumnFilter',
        // filterValueGetter: (params) =>
        //   Usecase.cvtStringToDate(params.data?.[params.column.getId()]),
      },
      numericCol: {
        headerClass: 'ag-left-aligned-header',
        cellClass: 'ag-right-aligned-cell',
        cellEditor: 'agNumberCellEditor',
        valueFormatter: (params) => Util.cvtNumToPrice(params.value),
        filter: 'agNumberColumnFilter',
        comparator: Util.compAmt,
        cellStyle: (params) => Util.getStylePrice(params.value),
      },
      amountCol: {
        headerClass: 'ag-left-aligned-header',
        cellClass: 'ag-right-aligned-cell',
        cellEditor: 'agNumberCellEditor',
        filter: 'agNumberColumnFilter',
      },
    },
    // デフォルト列定義
    defaultColDef: {
      hide: false, // 表示
      editable: false, // 非活性
      filter: true, // フィルタ有効化
      filterParams: {
        buttons: ['reset'],
      } as ITextFilterParams,
    },
    // 行選択
    rowSelection: {
      mode: 'multiRow',
      checkboxes: false,
      headerCheckbox: false,
      enableSelectionWithoutKeys: true,
      enableClickSelection: false, // セル選択状態自動変更無効
    },
    // Googleフォントを使用する
    loadThemeGoogleFonts: true,
    quickFilterMatcher(
      quickFilterParts: string[],
      rowQuickFilterAggregateText: string,
    ) {
      let result: boolean;
      try {
        result = quickFilterParts.every((part) =>
          rowQuickFilterAggregateText.match(part),
        );
      } catch {
        result = false;
      }
      return result;
    }, // TODO: テスト用
    // cellFlashDuration: 10000, // セルフラッシュ時間
    // autoSizeStrategy: {
    // type: 'fitCellContents',
    // defaultMinWidth: 100,
    // },

    // singleClickEdit: true, // シングルクリックで編集
    // autoSizeStrategy: {
    //   type: 'fitGridWidth',
    //   defaultMinWidth: 100,
    // },
    // getRowId: (params) => params.data.id,
    // ※行のグループ化はエンタープライズ
    // autoGroupColumnDef: {
    //   headerName: '日付',
    //   field: 'price',
    //   type: 'numericCol',
    //   valueFormatter: this.ags.priceFormatter,
    //   minWidth: 250,
    //   cellRenderer: 'agGroupCellRenderer',
    //   cellRendererParams: {
    //     checkbox: true,
    //   } as IGroupCellRendererParams,
    // },
  });
  /** 行ID */
  protected readonly rowId = signal<GetRowIdFunc<Row>>(
    (params: GetRowIdParams<Row>) => {
      const id = params.data[Const.CMN_COL.ID];
      if (!id || typeof id !== 'string') {
        return '';
      }

      return id;
    },
  );
  /** Grid上ボタンオプション */
  protected readonly aboveOpt = computed(() => {
    const inputOpt = this.aboveContentOption();
    const defOpt: Required<GridAboveContentOption> = {
      calcSelectStatus: inputOpt?.calcSelectStatus ?? (() => []),
    };
    return defOpt;
  });
  private readonly changeStatus = signal(false);
  /** ステータスリスト(表示用) */
  protected readonly statusDspList = computed(() => {
    // 行データ増減時にもステータスを更新
    this.rows();
    this.changeStatus();
    // 選択行の取得
    const rows = this.gridApi?.getSelectedRows() ?? [];
    // 列情報の取得
    const colDefs = this.gridApi?.getColumnDefs() ?? [];
    // 選択切替状態更新
    this.selectChangeState = rows.length === 0;
    return this.aboveOpt().calcSelectStatus(rows, colDefs);
  });
  /** Grid下ボタンオプション */
  protected readonly belowOpt = computed(() => {
    const inputOpt = this.belowContentOpt() ?? {};
    const defOpt: BelowOpt = {
      addRow: false,
      sort: false,
      filterOff: false,
      changeFilter: false,
      changeSelection: false,
      quickFilter: false,
      search: false,
      jumpFirstCol: false,
      jumpLastCol: false,
      jumpFirstRow: false,
      jumpLastRow: false,
    };
    const retOpt: BelowOpt = {
      ...defOpt,
      ...inputOpt,
      addRow:
        !!inputOpt.addRow && (inputOpt.addRow === true || !!inputOpt.addRow()),
      sort: !!inputOpt.sort && inputOpt.sort.length > 0,
      changeFilter: !!inputOpt.changeFilter && this.tbl() === Const.TBL.MAIN,
    };
    return retOpt;
  });
  /** 選択切替状態 */
  protected selectChangeState = true;
  /** フィルタ状態 */
  protected filterChangeState = true;
  /** Grid Api */
  private gridApi!: GridApi<Row>;

  /********************
   * イベント処理
   ********************/
  /**
   * Grid初期化時
   * @param event
   */
  protected readonly onReadyGrid = (event: GridReadyEvent): void => {
    this.gridApi = event.api;
    this.gridReady.emit(event);
  };
  /**
   * セル選択時
   * @param event
   */
  protected readonly onSelectCell = (): void => {
    this.changeStatus.update((st) => !st);
  };
  /**
   * 行選択状態を切り替える
   * @param event
   */
  protected readonly onClickCell = (event: CellClickedEvent): void => {
    if (this.cellClickForbCols().includes(event.column.getId())) {
      // セルクリック禁止列に該当する場合、Emit
      this.cellClick.emit(event);
    } else {
      // 上記以外、セル選択状態を切り替える
      event.node.setSelected(!event.node.isSelected());
      this.selectCellClick.emit(event);
    }
  };
  /**
   * モデル更新時
   * @param event
   */
  protected readonly onUpdateModel = (event: ModelUpdatedEvent): void => {
    // 行背景色を更新
    event.api.redrawRows();
  };

  /** ドラッグ対象行INDEX */
  private beforeRowIdxes: (number | null)[] = [];
  /**
   * ドラッグ開始
   * @param event
   */
  protected readonly onDragEnterRow = (
    event: RowDragEnterEvent<Row, ValType>,
  ): void => {
    this.beforeRowIdxes = event.nodes.map((node) => node.rowIndex);
  };
  /**
   * ドラッグ後
   * @param event
   */
  protected readonly onDragEndRow = (
    event: RowDragEndEvent<Row, ValType>,
  ): void => {
    const rowIdxes = event.nodes.map((node) => node.rowIndex);
    if (Util.equalObject(rowIdxes, this.beforeRowIdxes)) {
      return;
    }
    const targetIds = event.nodes.map((node) => node.id);
    const updRows: Row[] = [];
    const addIds: (ValType | undefined)[] = [];
    const edtInf: RowEdt[] = [];

    event.api.forEachNode(({ id, data }) => {
      if (targetIds.includes(id)) {
        updRows.push({ ...data });
        addIds.push(undefined);
      } else {
        for (const [dragIdx, row] of updRows.entries()) {
          if (row !== undefined && addIds[dragIdx] === undefined) {
            addIds[dragIdx] = id;
          }
        }
      }
    });

    edtInf.push(
      Util.getRowEdtUpd(this.tbl(), updRows),
      Util.getRowEdtDrg(
        this.tbl(),
        Util.getRowIds(updRows),
        addIds as ValType[],
      ),
    );

    this.rowEdt.emit(edtInf);
  };
  /**
   * 初期描画後
   */
  protected readonly onDspFirstData = (event: FirstDataRenderedEvent): void => {
    // 最終行にスクロール
    Util.jumpRow(event.api);
  };

  /**
   * 行追加
   */
  protected readonly onAddRow = (): void => {
    this.rowEdt.emit([Util.getRowEdtAddNew(this.tbl(), this.rows())]);
  };

  /**
   * ソート
   */
  protected readonly onSort = (): void => {
    const oldRows = this.rows();
    const newRows = Util.sortRow(oldRows, this.belowContentOpt()?.sort ?? []);
    if (Util.equalObject(oldRows, newRows)) {
      // ソート前と順番が変わらない場合は、履歴に追加しない
      return;
    }

    const targetIds = oldRows
      .filter((dt) => !!dt[Const.CMN_COL.UPDATE])
      .map((dt) => dt[Const.CMN_COL.ID]);
    const updRows: Row[] = [];
    const addIds: (ValType | undefined)[] = [];
    const edtInf: RowEdt[] = [];

    for (const newRow of newRows) {
      const id = newRow[Const.CMN_COL.ID];
      if (targetIds.includes(id)) {
        updRows.push({ ...newRow });
        addIds.push(undefined);
      } else {
        for (const [dragIdx, row] of updRows.entries()) {
          if (row !== undefined && addIds[dragIdx] === undefined) {
            addIds[dragIdx] = id?.toString();
          }
        }
      }
    }

    edtInf.push(
      Util.getRowEdtUpd(this.tbl(), updRows, false),
      Util.getRowEdtDrg(
        this.tbl(),
        Util.getRowIds(updRows),
        addIds as ValType[],
      ),
    );

    this.rowEdt.emit(edtInf);
  };

  /**
   * フィルタ解除
   */
  protected readonly onFilterOff = (): void => {
    // フィルタ解除
    this.gridApi.setFilterModel(null);
    // ソート解除
    this.gridApi.applyColumnState({
      defaultState: { sort: null },
    });
    // クイックフィルタ入力欄クリア
    this.quickFilterText().nativeElement.value = '';
    // クイックフィルタ解除
    this.gridApi.setGridOption('quickFilterText', '');
  };
  /**
   * フィルタ状態を切り替える(入力画面のみ)
   */
  protected readonly onChangeFilter = (): void => {
    // フィルタリセット
    this.gridApi.setFilterModel(null);
    // フィルタモデル設定
    const hardcodedFilter: FilterModel = {
      [Const.MAIN_COL.INPUT_MODE]: {
        filterType: 'number',
        type: this.filterChangeState ? 'notEqual' : 'equal',
        filter: Const.INPUT_MODE.ALL_REQ,
      },
    };
    this.gridApi.setFilterModel(hardcodedFilter);
    // フィルタ切替状態更新
    this.filterChangeState = !this.filterChangeState;
  };
  /**
   * セル選択状態を切り替える
   */
  protected readonly onChangeSelection = (): void => {
    if (this.gridApi.getSelectedRows().length > 0) {
      // 選択行が1件以上の場合、選択解除
      this.gridApi.deselectAll();
    } else {
      // 選択行が0件の場合、全選択後、空行の選択解除
      this.gridApi.selectAll('filtered');
      this.gridApi.forEachNode((node) => {
        const data = node.data;
        const id = node.id;
        if (!!id && !!data && this.emptyRowJudgeFn()(data)) {
          this.gridApi.getRowNode(id)?.setSelected(false);
        }
      });
    }
  };

  /** 検索モード */
  private readonly searchText = signal('');
  // /** 検索モードアイコン */
  // protected readonly searchModeIcon = computed(() =>
  //   this.searchModeState() ? 'search' : 'filter_list',
  // );
  // /**
  //  * 検索/フィルタモードを切り替える
  //  */
  // protected readonly onChangeSearchOrFilter = (): void => {
  //   this.searchModeState.update((state) => !state);
  // };
  /**
   * フィルタリングする
   * @param event
   */
  protected readonly onFilter = (event: Event): void => {
    // フィルタモード
    this.gridApi.setGridOption(
      'quickFilterText',
      (event.target as HTMLInputElement).value,
    );
  };
  /**
   * 検索する
   * @param event
   */
  protected readonly onSearch = (event: Event): void => {
    this.searchText.set((event.target as HTMLInputElement).value);
  };
  /**
   * 最初の列にジャンプする
   */
  protected readonly onJumpFirstCol = (): void => {
    Util.jumpCol(this.gridApi, 0);
  };
  /**
   * 最後の列にジャンプする
   */
  protected readonly onJumpLastCol = (): void => {
    Util.jumpCol(this.gridApi);
  };
  /**
   * 最初の行にジャンプする
   */
  protected readonly onJumpFirstRow = (): void => {
    if (!!this.searchText()) {
      // 検索モードの場合
    } else {
      // 検索モードでない場合
      Util.jumpRow(this.gridApi, 0);
    }
  };
  /**
   * 最後の行にジャンプする
   */
  protected readonly onJumpLastRow = (): void => {
    if (!!this.searchText()) {
      // 検索モードの場合

      // 選択行を取得。未選択の場合0行目を取得
      const lastNode = this.gridApi.getSelectedNodes().at(-1);
      // 選択行より下の検索一致行を取得
      this.gridApi.forEachNode((node) => {
        if (!node.displayed) {
          // 非表示
          return;
        }

        if (node === undefined || node.rowIndex === null) {
          return;
        }

        if (node.rowIndex <= (lastNode?.rowIndex ?? 0)) {
          return;
        }

        console.log('test');
      });

      // 検索一致行にジャンプする
      console.log('test');
    } else {
      // 検索モードでない場合
      Util.jumpRow(this.gridApi);
    }
  };
}
