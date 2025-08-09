import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  Signal,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  CellContextMenuEvent,
  CellDoubleClickedEvent,
  CellValueChangedEvent,
  ColDef,
  ColGroupDef,
  ColumnHeaderContextMenuEvent,
  FilterChangedEvent,
  FilterModel,
  FirstDataRenderedEvent,
  GetRowIdParams,
  GridApi,
  GridOptions,
  GridReadyEvent,
  iconSetMaterial,
  ITextFilterParams,
  ModelUpdatedEvent,
  RowClassParams,
  RowClickedEvent,
  RowDataUpdatedEvent,
  RowDoubleClickedEvent,
  RowDragEndEvent,
  RowDragEnterEvent,
  RowSelectedEvent,
  RowStyle,
  SelectionChangedEvent,
  SortChangedEvent,
  themeQuartz,
} from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import {
  MenuListData,
  RowEdt,
  SortOpt,
  Tbl,
  ValType,
} from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DialogSearchComponent,
  DialogSearchInput,
} from 'src/app/shared/dialog-search/dialog-search.component';
import {
  MoneyStatus,
  MoneyStatusComponent,
} from 'src/app/shared/money-status/money-status.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { MenuListComponent } from '../menu-list/menu-list.component';

/** 入力タイプ */
export type GridInput = {
  /** スタイル */
  style: Signal<Record<string, string>>;
  /** 行データKey */
  tbl: Signal<Tbl>;
  /** 列定義 */
  colDefs: Signal<ColDef<Row, ValType>[]>;
  /** 行データ */
  rows: Signal<Row[]>;
  /** Grid上ボタンオプション */
  topOpt?: Signal<GridOptInput<GridTopOptKey>[]>;
  /** Grid下ボタンオプション */
  btmOpt?: Signal<GridOptInput<GridBtmOptKey>[]>;
  /** セルクリック禁止列 */
  cellClickForbCols?: Signal<string[]>;
  /** 行ID取得関数 */
  rowId?: Signal<(params: GetRowIdParams<Row>) => string>;
  /** 行スタイル */
  rowStyle?: Signal<(params: RowClassParams<Row>) => RowStyle>;
};

export type GridTopOpt = {
  selStatus?: (
    rows: Row[],
    colDefs: (ColDef<Row, any> | ColGroupDef<Row>)[],
  ) => MoneyStatus[];
};
export type GridTopOptKey = 'selSts';
export type GridBtmOptKey =
  | 'addRow'
  | 'sort'
  | 'fltOff'
  | 'chgFlt'
  | 'chgSel'
  | 'quickFlt'
  | 'jmpFirstCol'
  | 'jmpLastCol'
  | 'jmpFirstRow'
  | 'jmpLastRow'
  | 'custom1'
  | 'custom2'
  | 'menuList';
export type GridOptInput<T = GridTopOptKey | GridBtmOptKey, U = any> = {
  key: T;
  valid?: boolean;
  hide?: boolean | ((api: GridApi) => boolean);
  disabled?: boolean | ((api: GridApi) => boolean);
  sts?: number;
  iconList?: string[];
  detail?: U;
  func?: (...opt: any) => any;
};
type GridOpt<T = GridTopOptKey | GridBtmOptKey, U = any> = Required<
  GridOptInput<T, U>
> & {
  icon: string;
};

@Component({
  selector: 'app-grid',
  imports: [
    SharedCommonModule,
    AgGridAngular,
    MoneyStatusComponent,
    MenuListComponent,
  ],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  /** ダイアログ */
  private readonly dialog = inject(MatDialog);

  /********************
   * Grid
   ********************/
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
  /** Grid Api */
  private gridApi!: GridApi<Row>;

  /********************
   * Input
   ********************/
  /** Grid入力 */
  readonly gridInput = input.required<GridInput>();

  protected readonly style = computed(() => this.gridInput().style());
  protected readonly tbl = computed(() => this.gridInput().tbl());
  protected readonly colDefs = computed(() => this.gridInput().colDefs());
  protected readonly rows = computed(() => this.gridInput().rows());
  protected readonly topOpt = computed(() => this.gridInput().topOpt?.());
  protected readonly btmOpt = computed(() => this.gridInput().btmOpt?.());
  protected readonly cellClickForbCols = computed(
    () => this.gridInput().cellClickForbCols?.() ?? [],
  );
  protected readonly rowId = computed(
    () =>
      this.gridInput().rowId?.() ??
      ((params: GetRowIdParams<Row>) => {
        const id = params.data[Const.CMN_COL.ID];
        if (!id || typeof id !== 'string') {
          return '';
        }
        return id;
      }),
  );
  protected readonly rowStyle = computed(
    () =>
      this.gridInput().rowStyle?.() ??
      ((params: RowClassParams<Row>) => {
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
      }),
  );

  /********************
   * Output
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
   * Grid Top Option
   ********************/
  private readonly gridTopOptInputDef = [
    {
      key: 'selSts',
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: [''],
      detail: '',
      func: (_: any) => {},
    },
  ] as const satisfies Required<GridOptInput<GridTopOptKey>>[];

  private readonly gridTopOpt = linkedSignal<
    Required<GridOptInput<GridTopOptKey>>[]
  >(
    () =>
      (this.topOpt()?.map((opt) => ({
        ...(this.gridTopOptInputDef.find((def) => def.key === opt.key) ?? {}),
        ...opt,
      })) ?? []) as Required<GridOptInput<GridTopOptKey>>[],
  );

  protected readonly gridTopOptDsp = computed<GridOpt<GridTopOptKey>[]>(() => {
    return this.gridTopOpt().map((opt) => ({
      ...opt,
      icon: opt.iconList[opt.sts],
    }));
  });

  /********************
   * Grid Btm Option
   ********************/
  private readonly updSts = (key: GridBtmOptKey, sts?: number): void => {
    this.gridBtmOpt.update((list) => {
      const opt = list.find((opt) => opt.key === key);
      if (!!opt) {
        if (sts === undefined) {
          if (opt.sts < opt.iconList.length - 1) {
            opt.sts++;
          } else {
            opt.sts = 0;
          }
        } else {
          opt.sts = sts;
        }
      }
      return [...list];
    });
  };

  private readonly onAddRow = (_opt: GridOpt<GridBtmOptKey>): void => {
    this.rowEdt.emit([Util.getRowEdtAddNew(this.tbl(), this.rows())]);
  };
  private readonly onSort = (opt: GridOpt<GridBtmOptKey, SortOpt[]>): void => {
    const oldRows = this.rows();
    const newRows = Util.sortRow(oldRows, opt.detail);
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
  private readonly onFltOff = (_opt: GridOpt<GridBtmOptKey>): void => {
    // フィルタ解除
    this.gridApi.setFilterModel(null);
    // ソート解除
    this.gridApi.applyColumnState({
      defaultState: { sort: null },
    });
    // クイックフィルタ解除
    this.gridApi.setGridOption('quickFilterText', '');
  };
  private readonly onChgFlt = (opt: GridOpt<GridBtmOptKey>): void => {
    // フィルタモデル設定
    const hardcodedFilter: FilterModel = {
      [Const.CMN_COL.INPUT_MODE]: {
        filterType: 'number',
        type: opt.sts === 0 ? 'notEqual' : 'equals',
        filter: Const.INPUT_MODE.ALL_REQ,
      },
    };
    this.gridApi.setFilterModel(hardcodedFilter);
    // フィルタ切替状態更新
    this.updSts(opt.key);
  };
  private readonly onChgSel = (_opt: GridOpt<GridBtmOptKey>): void => {
    if (this.gridApi.getSelectedRows().length > 0) {
      // 選択行が1件以上の場合、選択解除
      this.gridApi.deselectAll();
    } else {
      // 選択行が0件の場合、全選択
      this.gridApi.selectAll('filtered');
    }
  };
  private readonly quickFlt = (opt: GridOpt<GridBtmOptKey>): void => {
    // ダイアログオープン
    const dialogRef = this.dialog.open<
      DialogSearchComponent,
      DialogSearchInput
    >(DialogSearchComponent, {
      data: {
        val: this.gridApi.getGridOption('quickFilterText') ?? '',
        opts: opt.detail(),
      },
    });
    // 出力データ
    dialogRef.componentInstance.emitter.subscribe((res) => {
      res = res
        .replace(Const.INPUT_CHARS.AUTOCOMP_REPLACE, ' ')
        .replace(/\s+/g, ' ');
      this.gridApi.setGridOption('quickFilterText', res);
    });
  };
  private readonly onJmpFirstCol = (_opt: GridOpt<GridBtmOptKey>): void => {
    Util.jumpCol(this.gridApi, 0);
  };
  private readonly onJmpLastCol = (_opt: GridOpt<GridBtmOptKey>): void => {
    Util.jumpCol(this.gridApi);
  };
  private readonly onJmpFirstRow = (_opt: GridOpt<GridBtmOptKey>): void => {
    Util.jumpRow(this.gridApi, 0);
  };
  private readonly onJmpLastRow = (_opt: GridOpt<GridBtmOptKey>): void => {
    Util.jumpRow(this.gridApi);
  };
  private readonly onClickMenu = (
    opt: GridOpt<GridBtmOptKey>,
    id: string,
  ): void => {
    (opt.detail as (MenuListData & { func: () => {} })[])
      .find((dt) => dt.id === id)
      ?.func();
  };

  private readonly gridBtmOptInputDef = [
    {
      key: 'addRow',
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['add'],
      detail: [],
      func: this.onAddRow,
    },
    {
      key: 'sort',
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['sort'],
      detail: [],
      func: this.onSort,
    },
    {
      key: 'fltOff',
      valid: false,
      hide: false,
      disabled: true, // 始めは非活性
      sts: 0,
      iconList: ['filter_list_off'],
      detail: [],
      func: this.onFltOff,
    },
    {
      key: 'chgSel',
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['select_all', 'deselect'],
      detail: [],
      func: this.onChgSel,
    },
    {
      key: 'quickFlt',
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['search'],
      detail: () => [],
      func: this.quickFlt,
    },
    {
      key: 'chgFlt',
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['warning', 'check_circle'],
      detail: [],
      func: this.onChgFlt,
    },
    {
      key: 'jmpFirstCol',
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['arrow_left'],
      detail: [],
      func: this.onJmpFirstCol,
    },
    {
      key: 'jmpLastCol',
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['arrow_right'],
      detail: [],
      func: this.onJmpLastCol,
    },
    {
      key: 'jmpFirstRow',
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['arrow_drop_up'],
      detail: [],
      func: this.onJmpFirstRow,
    },
    {
      key: 'jmpLastRow',
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['arrow_drop_down'],
      detail: [],
      func: this.onJmpLastRow,
    },
    {
      key: 'custom1',
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['looks_1'],
      detail: [],
      func: (_opt: GridOpt<GridBtmOptKey>) => {},
    },
    {
      key: 'custom2',
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['looks_2'],
      detail: [],
      func: (_opt: GridOpt<GridBtmOptKey>) => {},
    },
    {
      key: 'menuList',
      valid: false,
      hide: false,
      disabled: true, // 始めは非活性
      sts: 0,
      iconList: ['more_vert'],
      detail: [],
      func: this.onClickMenu,
    },
  ] as const satisfies Required<GridOptInput<GridBtmOptKey>>[];

  private readonly gridBtmOpt = linkedSignal<
    Required<GridOptInput<GridBtmOptKey>>[]
  >(
    () =>
      (this.btmOpt()?.map((opt) => ({
        ...(this.gridBtmOptInputDef.find((def) => def.key === opt.key) ?? {}),
        ...opt,
      })) ?? []) as Required<GridOptInput<GridBtmOptKey>>[],
  );

  protected readonly gridBtmOptDsp = computed<GridOpt<GridBtmOptKey>[]>(() => {
    return this.gridBtmOpt().map((opt) => ({
      ...opt,
      icon: opt.iconList[opt.sts],
    }));
  });

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
  protected readonly onChangeSelection = (
    event: SelectionChangedEvent,
  ): void => {
    // 選択行の取得
    const rows = event.api.getSelectedRows() ?? [];
    // 列情報の取得
    const colDefs = event.api.getColumnDefs() ?? [];

    this.gridBtmOpt.update((list) => {
      for (const opt of list) {
        if (opt.key === 'chgSel') {
          // 選択状態更新
          opt.sts = rows.length === 0 ? 0 : 1;
        } else if (opt.key === 'menuList') {
          // メニューリストボタンの活性状態更新
          opt.disabled = rows.length === 0;
        }
      }
      return [...list];
    });
    this.gridTopOpt.update((list) => {
      for (const opt of list) {
        if (opt.key === 'selSts') {
          // ステータスリスト更新
          opt.detail = opt.func(rows, colDefs);
        }
      }
      return [...list];
    });

    this.selectionChange.emit(event);
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
   * 行更新時
   * @param event
   */
  protected readonly onUpdRows = (
    event: RowDataUpdatedEvent<Row, ValType>,
  ): void => {
    // 選択行の取得
    const rows = event.api.getSelectedRows() ?? [];
    // 列情報の取得
    const colDefs = event.api.getColumnDefs() ?? [];

    this.gridBtmOpt.update((list) => {
      for (const opt of list) {
        if (opt.key === 'chgSel') {
          // 選択状態更新
          opt.sts = rows.length === 0 ? 0 : 1;
        } else if (opt.key === 'addRow') {
          // 追加ボタンの有効状態更新
          opt.hide = this.rows().length > 0;
        } else if (opt.key === 'menuList') {
          // メニューリストボタンの活性状態更新
          opt.disabled = rows.length === 0;
        }
      }
      return [...list];
    });
    this.gridTopOpt.update((list) => {
      for (const opt of list) {
        if (opt.key === 'selSts') {
          // ステータスリスト更新
          opt.detail = opt.func(rows, colDefs);
        }
      }
      return [...list];
    });
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
   * フィルタ・ソート変更時
   * @param event
   */
  protected readonly onChangeFilterAndSort = (
    event: FilterChangedEvent | SortChangedEvent,
  ): void => {
    // ログ出力
    Util.outputLog(event.api.getFilterModel());
    this.gridBtmOpt.update((list) => {
      for (const opt of list) {
        if (opt.key === 'fltOff') {
          // フィルタリセットボタン活性状態更新
          const fltState = event.api.isAnyFilterPresent();
          const sortState = event.api
            .getColumnState()
            .some((col) => !!col.sort);
          opt.disabled = !fltState && !sortState;
        }
      }
      return [...list];
    });
  };
}
