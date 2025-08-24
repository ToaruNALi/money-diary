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
      [tbl]="tbl"
      [tblMap]="usecase.storeTblInf.tblMap()"
      (rowEdt)="onEdtRows($event)"
      (filterEdt)="onEdtFilter($event)"
      (scrIdSet)="onSetScrId($event)"
    ></app-item>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemContainerComponent extends SettingContainerComponent {
  protected override readonly scrId = Const.SCR.ITEM;
  protected override readonly tbl = Const.TBL.ITEM;
}
