import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MoneyDiaryBaseContainerComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.container';
import { MoneyDiaryInputComponent } from 'src/app/features/money-diary/money-diary-input/money-diary-input.component';
import * as Const from 'src/app/shared/constants/constants';

@Component({
  selector: 'app-money-diary-input-container',
  imports: [MoneyDiaryInputComponent],
  template: `
    <app-money-diary-input
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [display]="displayOpt().afterClass"
      [rowDataKey]="rowDataKey"
      [mainRowDatas]="inputDatas()"
      [storageDatas]="storageDatas()"
      [creditDatas]="creditDatas()"
      [itemDatas]="itemDatas()"
      [remarkDatas]="remarkDatas()"
      [filterModel]="usecase.storeTemp.filterInputModel()"
      [editPastData]="usecase.storeTemp.editPastData()"
      (rowDataEdits)="onEditRowDatas($event)"
      (screenIdSet)="onSetScreenId($event)"
    ></app-money-diary-input>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoneyDiaryInputContainerComponent extends MoneyDiaryBaseContainerComponent {
  protected override readonly screenId = Const.SCREEN_ID.MONEY_DIARY;
  protected override readonly rowDataKey = Const.ROW_DATA_KEY.MONEY_DIARY;
}
