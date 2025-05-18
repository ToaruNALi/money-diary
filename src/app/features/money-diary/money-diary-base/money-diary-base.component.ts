import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  Signal,
} from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { RowData } from 'src/app/domain/row-data';
import {
  FilterInputModel,
  RowDataEdit,
  RowDataKey,
  ScreenId,
  ValueType,
} from 'src/app/shared/constants/types';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class MoneyDiaryBaseComponent {
  /** 行データMap Main */
  readonly mainRowDatas = input.required<RowData[]>();
  /** 行データKey */
  readonly rowDataKey = input.required<RowDataKey>();
  /** 表示区分 */
  readonly display = input<string>();

  /** フィルターモデル */
  protected readonly filterInputModelSet = output<FilterInputModel>();
  /** 画面ID */
  protected readonly screenIdSet = output<ScreenId>();
  /** 行データ更新 */
  readonly rowDataEdits = output<RowDataEdit[]>();

  /** 列定義 */
  protected abstract readonly colDefs: Signal<ColDef<RowData, ValueType>[]>;
  /** 行データ */
  protected abstract readonly rowDatas: Signal<RowData[]>;

  /** 初期表示フラグ */
  protected firstDisp = false;
}
