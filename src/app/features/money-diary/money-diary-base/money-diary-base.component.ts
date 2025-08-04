import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  Signal,
} from '@angular/core';
import { GridApi } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import {
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
  /** 行データMap Main */
  readonly mainRows = input.required<Row[]>();
  /** 行データKey */
  readonly tbl = input.required<Tbl>();
  /** 表示区分 */
  readonly display = input<string>();

  /** フィルターモデル */
  protected readonly filterInputModelSet = output<FilterInputModel>();
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
}
