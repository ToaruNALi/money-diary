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
import { RowData } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import {
  RowDataEdit,
  RowDataKey,
  SortOption,
  ValueType,
} from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  MoneyStatus,
  MoneyStatusComponent,
} from 'src/app/shared/money-status/money-status.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type GridAboveContentOption = {
  calcSelectStatus?: (
    rowDatas: RowData[],
    colDefs: (ColDef<RowData, any> | ColGroupDef<RowData>)[],
  ) => MoneyStatus[];
};
export type GridBelowContentOption = {
  addRow?: boolean | (() => boolean);
  sort?: SortOption[];
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
  readonly rowDataKey = input.required<RowDataKey>();
  /** 列定義 */
  readonly columnDefs = input.required<ColDef<RowData, ValueType>[]>();
  /** 行データ */
  readonly rowDatas = input.required<RowData[]>();

  /********************
   * input
   ********************/
  /** 行スタイル */
  readonly rowStyle = input<{
    (params: RowClassParams): RowStyle;
  }>(() => ({}));
  /** Grid上ボタンオプション */
  readonly aboveContentOption = input<GridAboveContentOption>(); // HTMLが!!で判定しているため初期値不要
  /** Grid下ボタンオプション */
  readonly belowContentOption = input<GridBelowContentOption>(); // HTMLが!!で判定しているため初期値不要
  /** セルクリック禁止列 */
  readonly cellClickForbColumns = input<string[]>([]);
  /** 空行判定方法 */
  readonly emptyRowJudgeFn = input<(rowData: RowData) => boolean>(
    (rowData) => !rowData[Const.ROW_DATA_COMMON_COL_ID.LABEL],
  );

  /********************
   * output
   ********************/
  /** 行更新 Emitter */
  protected readonly rowDataEdits = output<RowDataEdit[]>();
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
      foregroundColor: Const.COLOR.FOREGROUND_COLOR,
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
  protected readonly gridOptions = signal<GridOptions<RowData>>({
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
        comparator: Util.amountComparator,
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
  protected readonly rowId = signal<GetRowIdFunc<RowData>>(
    (params: GetRowIdParams<RowData>) => {
      const id = params.data[Const.ROW_DATA_COMMON_COL_ID.ID];
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
  protected readonly statusDispList = computed(() => {
    // 行データ増減時にもステータスを更新
    this.rowDatas();
    this.changeStatus();
    // 選択行の取得
    const rowDatas = this.gridApi?.getSelectedRows() ?? [];
    // 列情報の取得
    const colDefs = this.gridApi?.getColumnDefs() ?? [];
    // 選択切替状態更新
    this.selectChangeState = rowDatas.length === 0;
    return this.aboveOpt().calcSelectStatus(rowDatas, colDefs);
  });
  /** Grid下ボタンオプション */
  protected readonly belowOpt = computed(() => {
    const inputOpt = this.belowContentOption() ?? {};
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
      changeFilter:
        !!inputOpt.changeFilter &&
        this.rowDataKey() === Const.ROW_DATA_KEY.MONEY_DIARY,
    };
    return retOpt;
  });
  /** 選択切替状態 */
  protected selectChangeState = true;
  /** フィルタ状態 */
  protected filterChangeState = true;
  /** Grid Api */
  private gridApi!: GridApi<RowData>;

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
    if (this.cellClickForbColumns().includes(event.column.getId())) {
      // セルクリック禁止列に該当する場合、Emit
      this.cellClick.emit(event);
    } else {
      // セルクリック禁止列に該当しない場合 かつ 空行でない場合、セル選択状態を切り替える
      if (!this.emptyRowJudgeFn()(event.data)) {
        event.node.setSelected(!event.node.isSelected());
      }
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
    event: RowDragEnterEvent<RowData, ValueType>,
  ): void => {
    this.beforeRowIdxes = event.nodes.map((node) => node.rowIndex);
  };
  /**
   * ドラッグ後
   * @param event
   */
  protected readonly onDragEndRow = (
    event: RowDragEndEvent<RowData, ValueType>,
  ): void => {
    const rowIdxes = event.nodes.map((node) => node.rowIndex);
    if (Util.equalObject(rowIdxes, this.beforeRowIdxes)) {
      return;
    }
    const targetIds = event.nodes.map((node) => node.id);
    const datas: RowData[] = [];
    const addIds: (string | undefined)[] = [];
    const editInfo: RowDataEdit[] = [];

    event.api.forEachNode(({ id, data }) => {
      if (targetIds.includes(id)) {
        datas.push({ ...data, [Const.ROW_DATA_COMMON_COL_ID.UPDATE]: true });
        addIds.push(undefined);
      } else {
        for (const [dragIdx, rowData] of datas.entries()) {
          if (rowData !== undefined && addIds[dragIdx] === undefined) {
            addIds[dragIdx] = id;
          }
        }
      }
    });

    editInfo.push(
      Util.getUpdEditData(this.rowDataKey(), datas),
      Util.getDragEditData(
        this.rowDataKey(),
        datas,
        addIds as (string | null)[],
      ),
    );

    this.rowDataEdits.emit(editInfo);
  };
  /**
   * 初期描画後
   */
  protected readonly onDispFirstData = (
    event: FirstDataRenderedEvent,
  ): void => {
    // 最終行にスクロール
    Util.jumpRow(event.api);
  };

  /**
   * 行追加
   */
  protected readonly onAddRow = (): void => {
    // TODO: 各画面事に行追加のコールバック関数を実装し、gridにわたす
    this.rowDataEdits.emit([
      Util.getAddDefaultEditData(this.rowDataKey(), this.rowDatas()),
    ]);
  };

  /**
   * ソート
   */
  protected readonly onSort = (): void => {
    const oldRowDatas = this.rowDatas();
    const newRowDatas = Util.sortRowDatas(
      oldRowDatas,
      this.belowContentOption()?.sort ?? [],
    );
    if (Util.equalObject(oldRowDatas, newRowDatas)) {
      // ソート前と順番が変わらない場合は、履歴に追加しない
      return;
    }

    const targetIds = oldRowDatas
      .filter((dt) => !!dt[Const.ROW_DATA_COMMON_COL_ID.UPDATE])
      .map((dt) => dt[Const.ROW_DATA_COMMON_COL_ID.ID]);
    const datas: RowData[] = [];
    const addIds: (string | undefined)[] = [];
    const editInfo: RowDataEdit[] = [];

    for (const data of newRowDatas) {
      const id = data[Const.ROW_DATA_COMMON_COL_ID.ID];
      if (targetIds.includes(id)) {
        datas.push({ ...data, [Const.ROW_DATA_COMMON_COL_ID.UPDATE]: false });
        addIds.push(undefined);
      } else {
        for (const [dragIdx, rowData] of datas.entries()) {
          if (rowData !== undefined && addIds[dragIdx] === undefined) {
            addIds[dragIdx] = id?.toString();
          }
        }
      }
    }

    editInfo.push(
      Util.getUpdEditData(this.rowDataKey(), datas),
      Util.getDragEditData(
        this.rowDataKey(),
        datas,
        addIds as (string | null)[],
      ),
    );

    this.rowDataEdits.emit(editInfo);
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
      [Const.MONEY_DIARY_COL_ID.INPUT_MODE]: {
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
