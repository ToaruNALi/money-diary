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
} from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import { MoneyDiaryBaseComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.component';
import {
  INPUT_OPTION_TYPE,
  MoneyDiaryInputUsecase,
} from 'src/app/features/money-diary/money-diary-input/money-diary-input.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { FilterInputModel, ValType } from 'src/app/shared/constants/types';
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
  readonly stgRows = input.required<Row[]>();
  readonly crdRows = input.required<Row[]>();
  readonly itmRows = input.required<Row[]>();
  readonly rmkRows = input.required<Row[]>();
  /** フィルターモデル */
  readonly filterModel = input.required<FilterInputModel>();
  /** 過去データ編集可能フラグ */
  readonly edtPastData = input.required<boolean>();
  /** 列定義 */
  protected override readonly colDefs = computed(() =>
    this.usecase.getColDefs(
      this.stgRows(),
      this.crdRows(),
      this.itmRows(),
      this.rmkRows(),
    ),
  );
  /** 行データ */
  protected override readonly rows = computed(() => {
    const filter = this.filterModel();
    const display = this.display();

    if (filter !== 'none') {
      this.gridApi?.setFilterModel(null);
      this.gridApi?.setFilterModel(filter);
    }

    if (display === 'display' && !this.firstDsp) {
      setTimeout(() => {
        this.firstDsp = true;
        Util.jumpRow(this.gridApi);
      });
    }

    return this.usecase.getRows(this.mainRows(), this.crdRows());
  });
  /** ステータスリスト */
  protected readonly statusList = computed(() =>
    this.usecase.calcStatusList(this.mainRows(), this.crdRows()),
  );
  /** 行スタイル */
  protected readonly rowStyleOption = computed(() => {
    const edtPastData = this.edtPastData();
    return {
      edtPastData,
    };
  });
  /** セルクリック禁止列 */
  protected readonly cellClickForbColumns = [
    Const.MAIN_COL.DATE,
  ] as const satisfies string[];
  /** グリッド上ボタンオプション */
  protected readonly aboveContentOption = computed<GridAboveContentOption>(
    () => ({
      calcSelectStatus: this.usecase.calcSelStatus,
    }),
  );
  /** グリッド下ボタンオプション */
  protected readonly belowContentOption = computed<GridBelowContentOption>(
    () => ({
      addRow: () => this.mainRows().length === 0,
      sort: [
        { col: Const.MAIN_COL.INPUT_MODE, asc: false },
        { col: Const.MAIN_COL.DATE },
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
  protected readonly emptyRowJudgeFn = (row: Row): boolean =>
    row[Const.MAIN_COL.INPUT_MODE] === Const.INPUT_MODE.NONE;
  /** Grid Api */
  private gridApi!: GridApi<Row>;
  /** コピー情報 */
  private readonly copyData = signal<Row>({});

  /**
   * グリッド初期化処理
   * @param event
   */
  protected readonly onReadyGrid = (event: GridReadyEvent): void => {
    this.gridApi = event.api;

    // コンテキストメニューの削除
    document.body.addEventListener('click', () => {
      this.gridMenuDsp.set(false);
      this.gridMenuStyle.set({});
    });
  };

  /**
   * セルクリック時
   * @param event
   */
  protected readonly onClickCell = async (
    event: CellClickedEvent<Row, ValType>,
  ): Promise<void> => {
    // 入力チェック
    const check = this.usecase.checkInputData(event);
    if (!check) {
      return;
    }
    // ダイアログ入力データ作成
    const input = this.usecase.createInputData(
      [event.data!],
      this.tbl(),
      [
        this.mainRows(),
        this.stgRows(),
        this.crdRows(),
        this.itmRows(),
        this.rmkRows(),
      ],
      { edtPastData: this.edtPastData() },
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
      this.mainRows(),
      this.tbl(),
    );
    // Emit
    this.rowEdt.emit(result);
  };

  protected readonly gridMenuDsp = signal(false);
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
          const date = Util.getDate();
          this.rowEdt.emit([
            Util.getRowEdtAdd(
              this.tbl(),
              [
                {
                  ...this.copyData(),
                  [Const.CMN_COL.ID]: event.data[Const.CMN_COL.ID],
                  [Const.MAIN_COL.DATE]: date,
                  [Const.MAIN_COL.USE_DATE]: date,
                },
              ],
              [],
              Util.getRowIdsSet(this.mainRows()),
            ),
          ]);
          // // コピー情報初期化
          // this.copyData.set({});
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
      const rows = this.gridApi.getSelectedRows();
      if (rows.length === 0) {
        return;
      }

      const today = Util.getDate();
      if (
        !this.edtPastData() &&
        rows.some((dt) => {
          const payDate = dt[Const.MAIN_COL.PAY_DATE];
          return !!payDate && payDate < today;
        })
      ) {
        // 過去データが編集可能でない かつ 支払日が過去のデータが含まれている場合
        this.gridmenuItemDisabled.set(true);
      } else {
        this.gridmenuItemDisabled.set(false);
      }

      this.gridMenuDsp.set(true);
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
  protected readonly onReplace = async (): Promise<void> => {
    // ダイアログ入力データ作成
    const input = this.usecase.createInputData(
      this.gridApi.getSelectedRows(),
      this.tbl(),
      [this.mainRows()],
      { type: INPUT_OPTION_TYPE.REPLACE, edtPastData: this.edtPastData() },
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
      this.mainRows(),
      this.tbl(),
      INPUT_OPTION_TYPE.REPLACE,
    );
    // Emit
    this.rowEdt.emit(result);
  };

  /**
   * 連番付与(コンテキストメニュー)
   */
  protected readonly onSerialNumber = async (): Promise<void> => {
    // ダイアログ入力データ作成
    const input = this.usecase.createInputData(
      this.gridApi.getSelectedRows(),
      this.tbl(),
      [this.mainRows()],
      { type: INPUT_OPTION_TYPE.SERIAL_NUM, edtPastData: this.edtPastData() },
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
      this.mainRows(),
      this.tbl(),
      INPUT_OPTION_TYPE.SERIAL_NUM,
    );
    // Emit
    this.rowEdt.emit(result);
  };

  /**
   * まとめて更新(コンテキストメニュー)
   */
  protected readonly onUpdate = async (): Promise<void> => {
    // ダイアログ入力データ作成
    const input = this.usecase.createInputData(
      this.gridApi.getSelectedRows(),
      this.tbl(),
      [
        this.mainRows(),
        this.stgRows(),
        this.crdRows(),
        this.itmRows(),
        this.rmkRows(),
      ],
      { type: INPUT_OPTION_TYPE.UPDATE, edtPastData: this.edtPastData() },
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
      this.mainRows(),
      this.tbl(),
      INPUT_OPTION_TYPE.UPDATE,
    );
    // Emit
    this.rowEdt.emit(result);
  };

  /**
   * ステータスリスト押下時
   */
  protected readonly onClickStatusContent = (): void => {
    this.scrIdSet.emit(Const.SCR.STORAGE);
  };
}
