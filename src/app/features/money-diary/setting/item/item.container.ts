import { Component } from '@angular/core';
import { ItemComponent } from 'src/app/features/money-diary/setting/item/item.component';
import { SettingContainerComponent } from 'src/app/features/money-diary/setting/setting.container';
import { TBL } from 'src/app/shared/utils/util-row';
import { SCR } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-item-container',
  imports: [ItemComponent],
  template: `
    <app-item
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [tbl]="tbl"
      [tblMap]="usecase.storeTblInf.tblInf.rd()"
      [colData]="usecase.storeTblInf.tblInf.cd()"
      [filterModel]="usecase.storeTblInf.tblInf.fm()"
      (rowEdt)="usecase.edtRows($event)"
      (colChange)="usecase.updCol($event)"
      (filterModelChange)="usecase.updFilterModel($event)"
      (scrIdSet)="usecase.changeScr($event)"
    ></app-item>
  `,
})
export class ItemContainerComponent extends SettingContainerComponent {
  protected override readonly scrId = SCR.ITEM;
  protected override readonly tbl = TBL.ITEM;
}
