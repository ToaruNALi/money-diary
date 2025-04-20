import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemComponent } from 'src/app/features/money-diary/setting/item/item.component';
import { SettingContainerComponent } from 'src/app/features/money-diary/setting/setting.container';
import * as Const from 'src/app/shared/constants/constants';

@Component({
    selector: 'app-item-container',
    imports: [ItemComponent],
    template: `
    <app-item
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [rowDataKey]="rowDataKey"
      [mainRowDatas]="itemDatas()"
      [inputDatas]="inputDatas()"
      [creditDatas]="creditDatas()"
      (rowDataEdits)="onEditRowDatas($event)"
      (filterInputModelSet)="onSetFilterInputModel($event)"
      (screenIdSet)="onSetScreenId($event)"
    ></app-item>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemContainerComponent extends SettingContainerComponent {
  protected override readonly screenId = Const.SCREEN_ID.ITEM;
  protected override readonly rowDataKey = Const.ROW_DATA_KEY.ITEM;
}
