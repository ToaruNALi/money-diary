import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CellClickedEvent,
  CellContextMenuEvent,
  GridApi,
  GridReadyEvent,
  RowClassParams,
  RowStyle,
} from 'ag-grid-community';
import * as DateUtil from 'date-fns';
import { RowData } from 'src/app/domain/row-data';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import {
  INPUT_OPTION_TYPE,
  MoneyDiaryInputUsecase,
} from 'src/app/features/money-diary/money-diary-input/money-diary-input.usecase';
import * as Const from 'src/app/shared/constants/constants';
import {
  FilterInputModel,
  RowDataAdd,
  RowDataDel,
  RowDataUpd,
  ValueType,
} from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import {
  GridAboveContentOption,
  GridBelowContentOption,
  GridComponent,
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
  private readonly snackBar = inject(MatSnackBar);

  /** Other Row Datas */
  readonly storageDatas = input.required<RowData[]>();
  readonly creditDatas = input.required<RowData[]>();
  readonly itemDatas = input.required<RowData[]>();
  readonly remarkDatas = input.required<RowData[]>();
  /** フィルターモデル */
  readonly filterModel = input.required<FilterInputModel>();
  /** 過去データ編集可能フラグ */
  readonly editPastData = input.required<boolean>();

  /** 列定義 */
  protected override readonly colDefs = computed(() =>
    this.usecase.getColDefs(
      this.storageDatas(),
      this.creditDatas(),
      this.itemDatas(),
      this.remarkDatas(),
    ),
  );
  /** 行データ */
  protected override readonly rowDatas = computed(() => {
    const filter = this.filterModel();
    const display = this.display();

    if (filter !== 'none') {
      this.gridApi?.setFilterModel(null);
      this.gridApi?.setFilterModel(filter);
    }

    if (display === 'display' && !this.firstDisp) {
      setTimeout(() => {
        this.firstDisp = true;
        Util.jumpRow(this.gridApi);
      });
    }

    return this.usecase.getRowDatas(this.mainRowDatas(), this.creditDatas());
  });
  /** ステータスリスト */
  protected readonly statusList = computed(() =>
    this.usecase.calcStatusList(this.mainRowDatas(), this.creditDatas()),
  );
  /** 行スタイル */
  protected readonly rowStyleOption = computed(() => {
    const editPastData = this.editPastData();
    return {
      editPastData,
    };
  });
  protected readonly rowStyle = computed(() => {
    const rowStyleOption = this.rowStyleOption();
    setTimeout(() => {
      // スタイル描画
      this.gridApi?.redrawRows();
    });
    return (param: RowClassParams): RowStyle =>
      this.usecase.getRowStyle(param, rowStyleOption);
  });

  /** セルクリック禁止列 */
  protected readonly cellClickForbColumns = [
    Const.MONEY_DIARY_COL_ID.DATE,
  ] as const satisfies string[];
  /** グリッド上ボタンオプション */
  protected readonly aboveContentOption = computed<GridAboveContentOption>(
    () => ({
      calcSelectStatus: this.usecase.calcSelectStatus,
    }),
  );
  /** グリッド下ボタンオプション */
  protected readonly belowContentOption = computed<GridBelowContentOption>(
    () => ({
      addRow: () => this.mainRowDatas().length === 0,
      sort: [
        { col: Const.MONEY_DIARY_COL_ID.INPUT_MODE, asc: false },
        { col: Const.MONEY_DIARY_COL_ID.DATE },
      ],
      filterOff: true,
      changeFilter: true,
      changeSelection: true,
      quickFilter: true,
      jumpFirstRow: true,
      jumpLastRow: true,
    }),
  );
  /** 空行判定 */
  protected readonly emptyRowJudgeFn = (rowData: RowData): boolean =>
    rowData[Const.MONEY_DIARY_COL_ID.INPUT_MODE] === Const.INPUT_MODE.NONE;
  /** Grid Api */
  private gridApi!: GridApi<RowData>;
  /** コピー情報 */
  private readonly copyData = signal<RowData>({});

  /**
   * グリッド初期化処理
   * @param event
   */
  protected readonly onReadyGrid = (event: GridReadyEvent): void => {
    this.gridApi = event.api;

    // コンテキストメニューの削除
    document.body.addEventListener('click', () => {
      this.gridMenuDisp.set(false);
      this.gridMenuStyle.set({});
    });
  };

  /**
   * セルクリック時
   * @param event
   */
  protected readonly onClickCell = async (
    event: CellClickedEvent<RowData, ValueType>,
  ): Promise<void> => {
    // 入力チェック
    const check = this.usecase.checkInputData(event);
    if (!check) {
      return;
    }
    // ダイアログ入力データ作成
    const input = this.usecase.createInputData(
      [event.data!],
      this.rowDataKey(),
      [
        this.mainRowDatas(),
        this.storageDatas(),
        this.creditDatas(),
        this.itemDatas(),
        this.remarkDatas(),
      ],
      { editPastData: this.editPastData() },
    );
    // ダイアログオープン
    const output = await this.usecase.openDialog(input);
    if (!output) {
      return;
    }
    // 行編集Emitterデータ作成
    const result = this.usecase.createResultData(
      output,
      [event.data!],
      this.mainRowDatas(),
      this.rowDataKey(),
    );
    // Emit
    this.rowDataEdits.emit(result);
  };

  protected readonly gridMenuDisp = signal(false);
  protected readonly gridMenuStyle = signal({});
  protected readonly gridmenuItemDisabled = signal(false);

  /**
   * 長押し時
   * @param event
   */
  protected readonly onCellContextMenu = (
    event: CellContextMenuEvent,
  ): void => {
    if (
      (this.cellClickForbColumns as string[]).includes(event.column.getId())
    ) {
      // セルクリック禁止列の場合
      if (Util.checkInputMode(event.data, Const.INPUT_MODE.NONE)) {
        // 空行の場合
        if (!Util.equalObject(this.copyData(), {})) {
          // コピー情報が存在する場合、ペースト
          this.rowDataEdits.emit([
            {
              type: Const.ROW_DATA_EDIT_TYPE.UPD,
              event: {
                key: this.rowDataKey(),
                datas: [
                  {
                    ...this.copyData(),
                    [Const.ROW_DATA_COMMON_COL_ID.ID]:
                      event.data[Const.ROW_DATA_COMMON_COL_ID.ID],
                    [Const.ROW_DATA_COMMON_COL_ID.UPDATE]: true,
                  },
                ],
              } as RowDataUpd,
            },
            {
              type: Const.ROW_DATA_EDIT_TYPE.ADD,
              event: {
                key: this.rowDataKey(),
                datas: [
                  Util.getDefaultRowData(
                    this.rowDataKey(),
                    this.mainRowDatas(),
                  ),
                ],
                addIds: [null],
              } as RowDataAdd,
            },
          ]);
          // コピー情報初期化
          this.copyData.set({});
          // メッセージ表示
          this.snackBar.open('Pasted!');
          setTimeout(() => {
            this.snackBar.dismiss();
          }, 1000);
        }
      } else {
        // 空行以外の場合、コピー
        this.copyData.set(event.data);
        // メッセージ表示
        this.snackBar.open('Copied!');
        setTimeout(() => {
          this.snackBar.dismiss();
        }, 1000);
      }
    } else {
      // 上記以外
      const rowDatas = this.gridApi.getSelectedRows();
      if (rowDatas.length === 0) {
        return;
      }

      const today = DateUtil.format(new Date(), Const.DATE_FORMAT.YYYY_MM_DD);
      if (
        !this.editPastData() &&
        rowDatas.some((dt) => {
          const payDate = dt[Const.MONEY_DIARY_COL_ID.PAY_DATE];
          return !!payDate && payDate < today;
        })
      ) {
        // 過去データが編集可能でない かつ 支払日が過去のデータが含まれている場合
        this.gridmenuItemDisabled.set(true);
      } else {
        this.gridmenuItemDisabled.set(false);
      }

      this.gridMenuDisp.set(true);
      // const pointer = event.event as PointerEvent;
      // this.gridMenuStyle.set({
      //   left: `${pointer.clientX}px`,
      //   top: `${pointer.clientY}px`,
      // });
    }
  };

  /**
   * 削除時(コンテキストメニュー)
   */
  protected readonly onDelete = (): void => {
    const rowDatas = this.gridApi.getSelectedRows();
    this.rowDataEdits.emit([
      {
        type: Const.ROW_DATA_EDIT_TYPE.DEL,
        event: {
          key: this.rowDataKey(),
          datas: rowDatas,
        } as RowDataDel,
      },
    ]);
  };

  /**
   * 置換時(コンテキストメニュー)
   */
  protected readonly onReplace = async (): Promise<void> => {
    // ダイアログ入力データ作成
    const input = this.usecase.createInputData(
      this.gridApi.getSelectedRows(),
      this.rowDataKey(),
      [this.mainRowDatas()],
      { type: INPUT_OPTION_TYPE.REPLACE, editPastData: this.editPastData() },
    );
    // ダイアログオープン
    const output = await this.usecase.openDialog(input);
    if (!output) {
      return;
    }
    // 行編集Emitterデータ作成
    const result = this.usecase.createResultData(
      output,
      this.gridApi.getSelectedRows(),
      this.mainRowDatas(),
      this.rowDataKey(),
      INPUT_OPTION_TYPE.REPLACE,
    );
    // Emit
    this.rowDataEdits.emit(result);
  };

  /**
   * 連番付与(コンテキストメニュー)
   */
  protected readonly onSerialNumber = async (): Promise<void> => {
    // ダイアログ入力データ作成
    const input = this.usecase.createInputData(
      this.gridApi.getSelectedRows(),
      this.rowDataKey(),
      [this.mainRowDatas()],
      { type: INPUT_OPTION_TYPE.SERIAL_NUM, editPastData: this.editPastData() },
    );
    // ダイアログオープン
    const output = await this.usecase.openDialog(input);
    if (!output) {
      return;
    }
    // 行編集Emitterデータ作成
    const result = this.usecase.createResultData(
      output,
      this.gridApi.getSelectedRows(),
      this.mainRowDatas(),
      this.rowDataKey(),
      INPUT_OPTION_TYPE.SERIAL_NUM,
    );
    // Emit
    this.rowDataEdits.emit(result);
  };

  /**
   * まとめて更新(コンテキストメニュー)
   */
  protected readonly onUpdate = async (): Promise<void> => {
    // ダイアログ入力データ作成
    const input = this.usecase.createInputData(
      this.gridApi.getSelectedRows(),
      this.rowDataKey(),
      [
        this.mainRowDatas(),
        this.storageDatas(),
        this.creditDatas(),
        this.itemDatas(),
        this.remarkDatas(),
      ],
      { type: INPUT_OPTION_TYPE.UPDATE, editPastData: this.editPastData() },
    );
    // ダイアログオープン
    const output = await this.usecase.openDialog(input);
    if (!output) {
      return;
    }
    // 行編集Emitterデータ作成
    const result = this.usecase.createResultData(
      output,
      this.gridApi.getSelectedRows(),
      this.mainRowDatas(),
      this.rowDataKey(),
      INPUT_OPTION_TYPE.UPDATE,
    );
    // Emit
    this.rowDataEdits.emit(result);
  };

  /**
   * ステータスリスト押下時
   */
  protected readonly onClickStatusContent = (): void => {
    this.screenIdSet.emit(Const.SCREEN_ID.STORAGE);
  };
}
