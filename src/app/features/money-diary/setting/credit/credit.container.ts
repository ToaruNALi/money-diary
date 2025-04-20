import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CreditComponent } from 'src/app/features/money-diary/setting/credit/credit.component';
import { SettingContainerComponent } from 'src/app/features/money-diary/setting/setting.container';
import * as Const from 'src/app/shared/constants/constants';

@Component({
    selector: 'app-credit-container',
    imports: [CreditComponent],
    template: `
    <app-credit
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [rowDataKey]="rowDataKey"
      [mainRowDatas]="creditDatas()"
      [inputDatas]="inputDatas()"
      [creditDatas]="creditDatas()"
      (rowDataEdits)="onEditRowDatas($event)"
      (filterInputModelSet)="onSetFilterInputModel($event)"
      (screenIdSet)="onSetScreenId($event)"
    ></app-credit>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditContainerComponent extends SettingContainerComponent {
  protected override readonly screenId = Const.SCREEN_ID.CREDIT;
  protected override readonly rowDataKey = Const.ROW_DATA_KEY.CREDIT;
}
