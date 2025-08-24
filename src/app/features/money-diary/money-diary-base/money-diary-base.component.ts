import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  Signal,
} from '@angular/core';
import { GridApi } from 'ag-grid-community';
import { Row, TblMap } from 'src/app/domain/row-data';
import * as Const from 'src/app/shared/constants/constants';
import {
  FilterEdt,
  FilterInputModel,
  RowEdt,
  Scr,
  Tbl,
} from 'src/app/shared/constants/types';
import { GridInput } from 'src/app/shared/grid/grid.component';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class MoneyDiaryBaseComponent {
  /** 全行データ */
  readonly tblMap = input.required<TblMap>();
  /** 行データKey */
  readonly tbl = input.required<Tbl>();
  /** フィルターモデル */
  readonly filterModel = input<Record<Tbl, FilterInputModel>>();
  /** 表示区分 */
  readonly display = input<string>();
  /** フィルタKey */
  readonly fltKey = model<string>('');

  /** フィルターモデル */
  protected readonly filterEdt = output<FilterEdt>();
  /** 画面ID */
  protected readonly scrIdSet = output<Scr>();
  /** 行データ更新 */
  readonly rowEdt = output<RowEdt[]>();

  /** グリッド入力データ */
  protected abstract readonly gridInput: Signal<GridInput>;

  /** 初期表示フラグ */
  protected firstDsp = false;
  /** Grid Api */
  protected gridApi!: GridApi<Row>;

  protected readonly mainRows = computed(() => this.tblMap()[this.tbl()]);
  protected readonly inputRows = computed(() => this.tblMap()[Const.TBL.MAIN]);
  protected readonly stgRows = computed(() => this.tblMap()[Const.TBL.STORAGE]);
  protected readonly crdRows = computed(() => this.tblMap()[Const.TBL.CREDIT]);
  protected readonly itmRows = computed(() => this.tblMap()[Const.TBL.ITEM]);
  protected readonly rmkRows = computed(() => this.tblMap()[Const.TBL.REMARK]);
  protected readonly smrRows = computed(() => this.tblMap()[Const.TBL.SUMMARY]);
  protected readonly scdRows = computed(
    () => this.tblMap()[Const.TBL.SCHEDULE],
  );
  protected readonly memRows = computed(() => this.tblMap()[Const.TBL.MEMO]);

  protected readonly filter = computed(
    () => this.filterModel()?.[this.tbl()] ?? 'none',
  );
}
