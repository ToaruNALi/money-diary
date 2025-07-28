import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  Signal,
} from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Row } from 'src/app/domain/row-data';
import {
  FilterInputModel,
  RowEdt,
  Scr,
  Tbl,
  ValType,
} from 'src/app/shared/constants/types';

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

  /** 列定義 */
  protected abstract readonly colDefs: Signal<ColDef<Row, ValType>[]>;
  /** 行データ */
  protected abstract readonly rows: Signal<Row[]>;

  /** 初期表示フラグ */
  protected firstDsp = false;
}
