import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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
  Tbl,
  ValType,
} from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DialogFilterComponent,
  DialogFilterInput,
} from 'src/app/shared/dialog-filter/dialog-filter.component';
import {
  DialogSearchComponent,
  DialogSearchInput,
} from 'src/app/shared/dialog-search/dialog-search.component';
import { MoneyStatusComponent } from 'src/app/shared/money-status/money-status.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { MenuListComponent } from '../menu-list/menu-list.component';

/** 入力タイプ */
export type GridInput = {
  /** スタイル */
  style: Signal<Record<string, string>>;
  /** 行データKey */
  tbl: Signal<Tbl>;
  /** データKey */
  rowsKey?: Signal<string>;
  /** 列定義 */
  colDefs: Signal<ColDef<Row, ValType>[]>;
  /** 行データ */
  rows: Signal<Row[]>;
  /** Grid上ボタンオプション */
  topOpt?: Signal<GridOptInput<GridTop>>;
  /** Grid下ボタンオプション */
  btmOpt?: Signal<GridOptInput<GridBtm>>;
  /** セルクリック禁止列 */
  cellClickForbCols?: Signal<string[]>;
  /** 行ID取得関数 */
  rowId?: Signal<(params: GetRowIdParams<Row>) => string>;
  /** 行スタイル */
  rowStyle?: Signal<
    (params: RowClassParams<Row>, rowStyle: RowStyle) => RowStyle | undefined
  >;
};
export type GridTop = 'top';
export type GridBtm = 'btm';
type GridOptType = GridTop | GridBtm;
type GridOptKey<T = GridOptType> = T extends GridTop
  ? 'selSts'
  :
      | 'back'
      | 'addRow'
      | 'sort'
      | 'fltOff'
      | 'chgFlt'
      | 'chgSel'
      | 'quickFlt'
      | 'search'
      | 'jmpFirstCol'
      | 'jmpLastCol'
      | 'jmpFirstRow'
      | 'jmpLastRow'
      | 'menuList'
      | 'rowDrg';
type GridOptParam = {
  valid: boolean;
  hide: boolean;
  disabled: boolean;
  sts: number;
  iconList: string[];
  value: string;
  dspOdr: number;
  detail: any;
  func: (...opt: any) => any;
};
export type GridOptInput<T = GridOptType> = Partial<
  Record<GridOptKey<T>, Partial<GridOptParam>>
>;
type GridOpt<T = GridOptType> = Record<GridOptKey<T>, GridOptParam>;
type GridOptDsp<T = GridOptType> = GridOptParam & {
  key: GridOptKey<T>;
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
  constructor() {
    effect(() =>
      ((searchVal, _updRow, _chgFilter) => {
        this.procSearchVal(searchVal);
      })(
        this.signalSearchVal(),
        this.signalUpdRows(),
        this.signalChgFilterAndSort(),
      ),
    );
  }

  /**
   * 検索値変更時処理
   * @param val
   */
  private readonly procSearchVal = (val: string): void => {
    if (!this.gridApi) {
      return;
    }

    if (!val) {
      // 検索欄が空の場合、行スタイルと検索件数をクリア
      this.signalSearchCnt.reset();
      this.rowStyleInput.set(
        (_params: RowClassParams<Row>, rowStyle: RowStyle) => rowStyle,
      );
      this.gridApi.redrawRows();
      return;
    }

    const nowRowIdx = this.gridApi.getFocusedCell()?.rowIndex ?? -1;
    const rowCnt = this.gridApi.getDisplayedRowCount();
    const minInf = { rowIdx: rowCnt, row: {} };
    const nextInf = { rowIdx: rowCnt, row: {} };
    const matchArr: number[] = [];

    this.gridApi.forEachNode((node) => {
      if (!node.displayed || !node.data || node.rowIndex === null) {
        // データなし、非表示、行インデックスなしの場合、処理なし
        return;
      }
      if (
        Object.values(node.data).some((row) => !!row?.toString().includes(val))
      ) {
        // 検索条件と一致する場合
        matchArr.push(node.rowIndex);

        if (node.rowIndex < nowRowIdx) {
          if (node.rowIndex < minInf.rowIdx) {
            minInf.rowIdx = node.rowIndex;
            minInf.row = node.data;
          }
        } else {
          if (node.rowIndex < nextInf.rowIdx) {
            nextInf.rowIdx = node.rowIndex;
            nextInf.row = node.data;
          }
        }
      }
    });

    const rowInf = (() => {
      if (nextInf.rowIdx < rowCnt) {
        return nextInf;
      } else if (minInf.rowIdx < rowCnt) {
        return minInf;
      }
      return { rowIdx: -1, row: {} };
    })();

    // 検索件数設定
    matchArr.sort((a, b) => a - b);
    this.signalSearchCnt.setAll(
      rowInf.rowIdx,
      rowInf.row,
      matchArr.findIndex((idx) => idx === rowInf.rowIdx) + 1,
      matchArr.length,
    );

    if (rowInf.rowIdx === -1) {
      // 行移動
      Util.jumpRow(this.gridApi, rowInf.rowIdx);
    }

    // 行スタイル設定
    this.rowStyleInput.set(
      (params: RowClassParams<Row>, rowStyle: RowStyle) => {
        if (params.rowIndex === rowInf.rowIdx) {
          rowStyle['backgroundColor'] = Const.ROW_CLR.SEARCH_FOCUS;
        } else if (matchArr.includes(params.rowIndex)) {
          rowStyle['backgroundColor'] = Const.ROW_CLR.SEARCH;
        }
        return rowStyle;
      },
    );
    this.gridApi.redrawRows();
  };

  /**
   * 検索実行
   * @param val 検索値
   * @param dir 検索方向 (true:次方向、false:前方向)
   */
  private readonly procSearch = (val: string, dir: boolean): void => {
    if (!this.gridApi || !val) {
      return;
    }

    const nowRowInf = this.signalSearchCnt();
    const rowCnt = this.gridApi.getDisplayedRowCount();
    const [otherInf, nextInf] = (() => {
      if (dir) {
        return [
          { rowIdx: rowCnt, row: {} },
          { rowIdx: rowCnt, row: {} },
        ];
      }
      return [
        { rowIdx: -1, row: {} },
        { rowIdx: -1, row: {} },
      ];
    })();
    const matchArr: number[] = [];

    this.gridApi.forEachNode((node) => {
      if (!node.displayed || !node.data || node.rowIndex === null) {
        // データなし、非表示、行インデックスなしの場合、処理なし
        return;
      }
      if (
        Object.values(node.data).some((row) => !!row?.toString().includes(val))
      ) {
        // 検索条件と一致する場合
        matchArr.push(node.rowIndex);

        if (dir) {
          if (node.rowIndex <= nowRowInf.rowIdx) {
            if (node.rowIndex < otherInf.rowIdx) {
              otherInf.rowIdx = node.rowIndex;
              otherInf.row = node.data;
            }
          } else {
            if (node.rowIndex < nextInf.rowIdx) {
              nextInf.rowIdx = node.rowIndex;
              nextInf.row = node.data;
            }
          }
        } else {
          if (node.rowIndex >= nowRowInf.rowIdx) {
            if (node.rowIndex > otherInf.rowIdx) {
              otherInf.rowIdx = node.rowIndex;
              otherInf.row = node.data;
            }
          } else {
            if (node.rowIndex > nextInf.rowIdx) {
              nextInf.rowIdx = node.rowIndex;
              nextInf.row = node.data;
            }
          }
        }
      }
    });

    const rowInf = (() => {
      if (dir) {
        if (nextInf.rowIdx < rowCnt) {
          return nextInf;
        } else if (otherInf.rowIdx < rowCnt) {
          return otherInf;
        }
      } else {
        if (nextInf.rowIdx > -1) {
          return nextInf;
        } else if (otherInf.rowIdx > -1) {
          return otherInf;
        }
      }
      return nowRowInf;
    })();

    // 検索件数設定
    matchArr.sort((a, b) => a - b);
    this.signalSearchCnt.setIdxAndCnt(
      rowInf.rowIdx,
      rowInf.row,
      matchArr.findIndex((idx) => idx === rowInf.rowIdx) + 1,
    );

    // 行移動
    Util.jumpRow(this.gridApi, rowInf.rowIdx);

    const colId =
      Object.entries(rowInf.row).find(
        ([_, row]) => !!row?.toString().includes(val),
      )?.[0] ?? Const.CMN_COL.LABEL;
    this.gridApi.setFocusedCell(rowInf.rowIdx, colId);

    // 行スタイル設定
    this.rowStyleInput.set(
      (params: RowClassParams<Row>, rowStyle: RowStyle) => {
        if (params.rowIndex === rowInf.rowIdx) {
          rowStyle['backgroundColor'] = Const.ROW_CLR.SEARCH_FOCUS;
        } else if (matchArr.includes(params.rowIndex)) {
          rowStyle['backgroundColor'] = Const.ROW_CLR.SEARCH;
        }
        return rowStyle;
      },
    );
    this.gridApi.redrawRows();
  };

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
    suppressRowDrag: true, // 行ドラッグアイコン非表示
    rowDragManaged: true, // 行ドラッグ可能
    suppressMoveWhenRowDragging: true, // 行ドラッグ抑制
    rowDragMultiRow: true, // 複数行ドラッグ
    paginationAutoPageSize: true,
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 20,
    suppressMovableColumns: true, // 列移動不可
    suppressMoveWhenColumnDragging: true, // 列移動抑制
    suppressDragLeaveHidesColumns: true, // 列削除無効
    enableCellSpan: true, // 同じ値を持つセルを結合する
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
  protected readonly rowsKey = computed(
    () => this.gridInput().rowsKey?.() ?? '',
  );
  protected readonly colDefs = computed(() => this.gridInput().colDefs());
  protected readonly rows = computed(() => this.gridInput().rows());
  protected readonly topOpt = computed(() => this.gridInput().topOpt?.());
  protected readonly btmOpt = computed(() => this.gridInput().btmOpt?.());
  protected readonly rowIdInput = computed(() => this.gridInput().rowId?.());
  protected readonly rowStyleInput = linkedSignal(() =>
    this.gridInput().rowStyle?.(),
  );
  protected readonly cellClickForbCols = computed(
    () => this.gridInput().cellClickForbCols?.() ?? [],
  );
  protected readonly rowId = computed(
    () =>
      this.rowIdInput() ??
      ((params: GetRowIdParams<Row>) => {
        const id = params.data[Const.CMN_COL.ID];
        if (!id || typeof id !== 'string') {
          return '';
        }
        return id;
      }),
  );
  protected readonly rowStyle = computed(
    () => (params: RowClassParams<Row>) => {
      const style: RowStyle = {};
      const mode = params.data?.[Const.CMN_COL.INPUT_MODE];

      if (mode === Const.INPUT_MODE.NONE) {
        // 空データ
        style['backgroundColor'] = Const.ROW_CLR.NONE;
      } else if (mode === Const.INPUT_MODE.SOME_REQ) {
        // エラーデーア
        style['backgroundColor'] = Const.ROW_CLR.ERROR;
      }
      return this.rowStyleInput()?.(params, style) ?? style;
    },
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
  protected readonly columnHeaderContextMenu =
    output<ColumnHeaderContextMenuEvent>();
  /** 行追加 */
  protected readonly rowAdd = output<void>();

  /********************
   * 変更検知用 Signal
   ********************/
  private readonly signalUpdRows = signal(false);
  private readonly signalChgSel = signal(false);
  private readonly signalChgFilterAndSort = signal(false);
  private readonly signalSearchVal = signal('');
  private readonly signalSearchCnt = (() => {
    const initCnt = { rowIdx: -1, row: {}, cnt: 0, max: 0 };
    const counter = signal({ ...initCnt });
    return Object.assign(counter.asReadonly(), {
      reset: () => counter.set({ ...initCnt }),
      setAll: (rowIdx: number, row: Row, cnt: number, max: number) =>
        counter.set({
          rowIdx,
          row,
          cnt,
          max,
        }),
      setIdxAndCnt: (rowIdx: number, row: Row, cnt: number) =>
        counter.update((inf) => ({ ...inf, rowIdx, row, cnt })),
    });
  })();

  /********************
   * Grid Common Option
   ********************/
  // 共通初期設定
  private readonly createGridOpt = <T = GridOptType>(
    optInput: GridOptInput<T> = {},
    optDef: GridOpt<T>,
  ): GridOpt<T> => {
    const retGridOpt = {} as GridOpt<T>;
    for (const _ in optDef) {
      const key = _ as GridOptKey<T>;
      retGridOpt[key] = {
        ...optDef[key],
        ...optInput[key],
      };
    }
    return { ...retGridOpt };
  };

  // 共通表示設定
  private readonly createGridOptDsp = <T = GridOptType>(
    opt: GridOpt<T>,
  ): GridOptDsp<T>[] =>
    Object.entries(opt)
      .map(([_key, _param]) => {
        const key = _key as GridOptKey<T>;
        const param = _param as GridOptParam;
        return {
          key,
          icon: param.iconList[param.sts],
          ...param,
        };
      })
      .sort((a, b) => a.dspOdr - b.dspOdr);

  /********************
   * Grid Top Option
   ********************/
  // デフォルト値
  private readonly gridTopOptParamDef = {
    selSts: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: [''],
      value: '',
      dspOdr: 0,
      detail: '',
      func: (_: any) => {},
    },
  } as const satisfies GridOpt<GridTop>;

  // 初期設定
  private readonly gridTopOpt = linkedSignal<GridOpt<GridTop>>(() =>
    this.createGridOpt(this.topOpt(), this.gridTopOptParamDef),
  );

  // 更新
  private readonly gridTopOptUpd = computed<GridOpt<GridTop>>(() => {
    // 行データ更新時
    this.signalUpdRows();
    // セル選択更新時
    this.signalChgSel();

    const gridOpt = this.gridTopOpt();
    const rows = this.gridApi?.getSelectedRows() ?? [];
    const colDefs = this.gridApi?.getColumnDefs() ?? [];

    return {
      ...gridOpt,
      selSts: {
        ...gridOpt.selSts,
        detail: gridOpt.selSts.func(rows, colDefs),
      },
    };
  });

  // 表示
  protected readonly gridTopOptDsp = computed<GridOptDsp<GridTop>[]>(() =>
    this.createGridOptDsp(this.gridTopOptUpd()),
  );

  /********************
   * Grid Btm Option
   ********************/
  private readonly updSts = (key: GridOptKey<GridBtm>, sts?: number): void => {
    this.gridBtmOpt.update((opt) => ({
      ...opt,
      [key]: {
        ...opt[key],
        sts:
          sts !== undefined
            ? sts
            : (opt[key].sts + 1) % opt[key].iconList.length,
      },
    }));
  };

  private readonly onAddRow = (_opt: GridOptDsp<GridBtm>): void => {
    this.rowAdd.emit();
  };
  private readonly onSort = (opt: GridOptDsp<GridBtm>): void => {
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
      Util.getRowEdtUpd(this.tbl(), updRows, undefined, false, this.rowsKey()),
      Util.getRowEdtDrg(
        this.tbl(),
        Util.getRowIds(updRows),
        addIds as ValType[],
        this.rowsKey(),
      ),
    );

    this.rowEdt.emit(edtInf);
  };
  private readonly onFltOff = (_opt: GridOptDsp<GridBtm>): void => {
    // フィルタ解除
    this.gridApi.setFilterModel(null);
    // ソート解除
    this.gridApi.applyColumnState({
      defaultState: { sort: null },
    });
    // クイックフィルタ解除
    this.gridApi.setGridOption('quickFilterText', '');
  };
  private readonly onChgFlt = (opt: GridOptDsp<GridBtm>): void => {
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
  private readonly onChgSel = (_opt: GridOptDsp<GridBtm>): void => {
    if (this.gridApi.getSelectedRows().length > 0) {
      // 選択行が1件以上の場合、選択解除
      this.gridApi.deselectAll();
    } else {
      // 選択行が0件の場合、全選択
      this.gridApi.selectAll('filtered');
    }
  };
  private readonly quickFlt = (opt: GridOptDsp<GridBtm>): void => {
    // ダイアログオープン
    const dialogRef = this.dialog.open<
      DialogFilterComponent,
      DialogFilterInput
    >(DialogFilterComponent, {
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
  private readonly onSearch = (opt: GridOptDsp<GridBtm>): void => {
    // ダイアログオープン
    const dialogRef = this.dialog.open<
      DialogSearchComponent,
      DialogSearchInput
    >(DialogSearchComponent, {
      data: {
        val: this.signalSearchVal() ?? '',
        searchInf: this.signalSearchCnt,
        opts: opt.detail(),
      },
    });
    // 検索値変更
    dialogRef.componentInstance.emitter.subscribe((res) => {
      res = res
        .replace(Const.INPUT_CHARS.AUTOCOMP_REPLACE, ' ')
        .replace(/\s+/g, ' ');
      this.signalSearchVal.set(res);
    });
    // 検索実行
    dialogRef.componentInstance.clickEmitter.subscribe((res) => {
      this.procSearch(this.signalSearchVal(), res);
    });
  };
  private readonly onJmpFirstCol = (_opt: GridOptDsp<GridBtm>): void => {
    Util.jumpCol(this.gridApi, 0);
  };
  private readonly onJmpLastCol = (_opt: GridOptDsp<GridBtm>): void => {
    Util.jumpCol(this.gridApi);
  };
  private readonly onJmpFirstRow = (_opt: GridOptDsp<GridBtm>): void => {
    if (!!this.signalSearchVal()) {
      // 検索値あり
      this.procSearch(this.signalSearchVal(), false);
    } else {
      // 検索値なし
      Util.jumpRow(this.gridApi, 0);
    }
  };
  private readonly onJmpLastRow = (_opt: GridOptDsp<GridBtm>): void => {
    if (!!this.signalSearchVal()) {
      // 検索値あり
      this.procSearch(this.signalSearchVal(), true);
    } else {
      // 検索値なし
      Util.jumpRow(this.gridApi);
    }
  };
  private readonly onClickMenu = (
    opt: GridOptDsp<GridBtm>,
    id: string,
  ): void => {
    (opt.detail as (MenuListData & { func: () => {} })[])
      .find((dt) => dt.id === id)
      ?.func();
  };
  private readonly onClickRowDrag = (_opt: GridOptDsp<GridBtm>): void => {
    this.gridApi.setGridOption(
      'suppressRowDrag',
      !this.gridApi.getGridOption('suppressRowDrag'),
    );
  };

  // デフォルト値
  private readonly gridBtmOptParamDef = {
    back: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['reply'],
      value: '',
      dspOdr: 0,
      detail: [],
      func: () => {},
    },
    addRow: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['add'],
      value: '',
      dspOdr: 0,
      detail: [],
      func: this.onAddRow,
    },
    sort: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['sort'],
      value: '',
      dspOdr: 0,
      detail: [],
      func: this.onSort,
    },
    fltOff: {
      valid: false,
      hide: false,
      disabled: true, // 始めは非活性
      sts: 0,
      iconList: ['filter_list_off'],
      value: '',
      dspOdr: 0,
      detail: [],
      func: this.onFltOff,
    },
    chgSel: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['select_all', 'deselect'],
      value: '',
      dspOdr: 0,
      detail: [],
      func: this.onChgSel,
    },
    quickFlt: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['filter_list'],
      value: '',
      dspOdr: 0,
      detail: () => [],
      func: this.quickFlt,
    },
    search: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['search'],
      value: '',
      dspOdr: 0,
      detail: () => [],
      func: this.onSearch,
    },
    chgFlt: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['warning', 'check_circle'],
      value: '',
      dspOdr: 0,
      detail: [],
      func: this.onChgFlt,
    },
    jmpFirstCol: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['arrow_left'],
      value: '',
      dspOdr: 0,
      detail: [],
      func: this.onJmpFirstCol,
    },
    jmpLastCol: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['arrow_right'],
      value: '',
      dspOdr: 0,
      detail: [],
      func: this.onJmpLastCol,
    },
    jmpFirstRow: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['arrow_drop_up'],
      value: '',
      dspOdr: 0,
      detail: [],
      func: this.onJmpFirstRow,
    },
    jmpLastRow: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['arrow_drop_down'],
      value: '',
      dspOdr: 0,
      detail: [],
      func: this.onJmpLastRow,
    },
    menuList: {
      valid: false,
      hide: false,
      disabled: true, // 始めは非活性
      sts: 0,
      iconList: ['more_vert'],
      value: '',
      dspOdr: 0,
      detail: [],
      func: this.onClickMenu,
    },
    rowDrg: {
      valid: false,
      hide: false,
      disabled: false,
      sts: 0,
      iconList: ['drag_handle'],
      value: '',
      dspOdr: 0,
      detail: [],
      func: this.onClickRowDrag,
    },
  } as const satisfies GridOpt<GridBtm>;

  // 初期設定
  private readonly gridBtmOpt = linkedSignal<GridOpt<GridBtm>>(() =>
    this.createGridOpt(this.btmOpt(), this.gridBtmOptParamDef),
  );

  // 更新
  private readonly gridBtmOptUpd = computed<GridOpt<GridBtm>>(() => {
    // 行データ更新時
    this.signalUpdRows();
    // セル選択更新時
    this.signalChgSel();
    // フィルタ・ソート更新時
    this.signalChgFilterAndSort();

    const gridOpt = this.gridBtmOpt();
    const rows = this.gridApi?.getSelectedRows() ?? [];

    return {
      ...gridOpt,
      chgSel: {
        ...gridOpt.chgSel,
        sts: rows.length === 0 ? 0 : 1,
      },
      menuList: {
        ...gridOpt.menuList,
        disabled: rows.length === 0,
      },
      fltOff: {
        ...gridOpt.fltOff,
        disabled:
          !this.gridApi?.isAnyFilterPresent() &&
          !this.gridApi?.getColumnState().some((col) => !!col.sort),
      },
    };
  });

  // 表示
  protected readonly gridBtmOptDsp = computed<GridOptDsp<GridBtm>[]>(() =>
    this.createGridOptDsp(this.gridBtmOptUpd()),
  );

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
    const rows = event.api.getSelectedRows() ?? [];
    this.gridApi.setGridOption('suppressRowDrag', rows.length === 0);

    this.signalChgSel.update((flg) => !flg);
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
    _event: RowDataUpdatedEvent<Row, ValType>,
  ): void => {
    this.signalUpdRows.update((flg) => !flg);
  };
  /**
   * モデル更新時
   * @param event
   */
  protected readonly onUpdateModel = (event: ModelUpdatedEvent): void => {
    // 行背景色を更新
    // event.api.redrawRows();
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
      Util.getRowEdtUpd(this.tbl(), updRows, undefined, true, this.rowsKey()),
      Util.getRowEdtDrg(
        this.tbl(),
        Util.getRowIds(updRows),
        addIds as ValType[],
        this.rowsKey(),
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
    _event: FilterChangedEvent | SortChangedEvent,
  ): void => {
    this.signalChgFilterAndSort.update((flg) => !flg);
  };
}
