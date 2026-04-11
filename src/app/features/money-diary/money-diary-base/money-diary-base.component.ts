import {
  Component,
  computed,
  effect,
  input,
  output,
  Signal,
} from '@angular/core';
import {
  ColumnHeaderContextMenuEvent,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { Row, TblMap } from 'src/app/domain/row-data';
import { MoneyDiaryBaseUsecase } from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import { GridInput } from 'src/app/shared/grid/grid.component';
import {
  ColEdt,
  FilterEdt,
  FilterInputModel,
  RowEdt,
  RowsKeyEdt,
  TBL,
  Tbl,
} from 'src/app/shared/utils/util-row';
import { Scr } from 'src/app/shared/utils/util-screen';

@Component({
  template: '',
})
export abstract class MoneyDiaryBaseComponent {
  constructor(protected readonly usecase: MoneyDiaryBaseUsecase) {
    /** フィルターエフェクト */
    effect(() =>
      ((filter) => {
        if (filter !== 'none') {
          this.gridApi?.setFilterModel(filter);
        }
      })(this.filter()),
    );
  }

  /********************
   * Input
   ********************/
  /** 行データKey */
  readonly tbl = input.required<Tbl>();
  /** 全行データ */
  readonly tblMap = input.required<TblMap>();
  /** 全列データ */
  readonly colData = input<TblMap>();
  /** データKey */
  readonly rowsKeyList = input<Record<Tbl, string>>();
  /** フィルターモデル */
  readonly filterModel = input<Record<Tbl, FilterInputModel>>();
  /** 表示区分 */
  readonly display = input<string>();

  /********************
   * Output
   ********************/
  /** 行データ更新 */
  readonly rowEdt = output<RowEdt[]>();
  /** 列データ更新 */
  readonly colChange = output<ColEdt>();
  /** データKey更新 */
  readonly rowsKeyChange = output<RowsKeyEdt>();
  /** フィルターモデル更新 */
  readonly filterModelChange = output<FilterEdt>();
  /** 画面ID設定 */
  protected readonly scrIdSet = output<Scr>();

  /********************
   * 各データ抽出
   ********************/
  /** 各行データ */
  protected readonly mainRows = computed(() => this.tblMap()[this.tbl()]);
  protected readonly inputRows = computed(() => this.tblMap()[TBL.MAIN]);
  protected readonly stgRows = computed(() => this.tblMap()[TBL.STORAGE]);
  protected readonly crdRows = computed(() => this.tblMap()[TBL.CREDIT]);
  protected readonly itmRows = computed(() => this.tblMap()[TBL.ITEM]);
  protected readonly rmkRows = computed(() => this.tblMap()[TBL.REMARK]);
  protected readonly smrRows = computed(() => this.tblMap()[TBL.SUMMARY]);
  protected readonly scdRows = computed(() => this.tblMap()[TBL.SCHEDULE]);
  protected readonly memRows = computed(() => this.tblMap()[TBL.MEMO]);
  /** 列データ */
  protected readonly cols = computed(() => {
    const input = this.colData();
    const tbl = this.tbl();
    if (!!input) {
      return input[tbl];
    }
    return [];
  });
  /** データKey */
  protected readonly rowsKey = computed(() => {
    const input = this.rowsKeyList();
    const tbl = this.tbl();
    if (!!input) {
      return input[tbl];
    }
    return '';
  });
  /** フィルタモデルデータ */
  private readonly filter = computed(() => {
    const input = this.filterModel();
    const tbl = this.tbl();
    if (input !== undefined) {
      return input[tbl];
    }
    return 'none';
  });

  /********************
   * Method
   ********************/
  /**
   * グリッド初期化処理
   * @param event
   */
  protected readonly onReadyGrid = (event: GridReadyEvent): void => {
    this.gridApi = event.api;
  };
  /**
   * ヘッダ長押し時
   * @param event
   */
  protected readonly onColumnHeaderContextMenu = async (
    _event: ColumnHeaderContextMenuEvent,
  ): Promise<void> => {
    // TODO: 列データ編集処理
    // const edtInf = await this.usecase.procEditCol(this.cols());
    // if (!!edtInf) {
    //   this.colChange.emit({ tbl: this.tbl(), cols: edtInf });
    // }
  };
  /** データKey編集 */
  protected readonly edtRowsKey = (key: string, tbl = this.tbl()): void => {
    if (!!tbl) {
      this.rowsKeyChange.emit({ tbl, key });
    }
  };

  /********************
   * 個別データ
   ********************/
  /** グリッド入力データ */
  protected abstract readonly gridInput: Signal<GridInput>;
  /** 初期表示フラグ */
  protected firstDsp = false;
  /** Grid Api */
  protected gridApi!: GridApi<Row>;
}
