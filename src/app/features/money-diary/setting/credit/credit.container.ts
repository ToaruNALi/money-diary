import { Component } from '@angular/core';
import { CreditComponent } from 'src/app/features/money-diary/setting/credit/credit.component';
import { SettingContainerComponent } from 'src/app/features/money-diary/setting/setting.container';
import { TBL } from 'src/app/shared/utils/util-row';
import { SCR } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-credit-container',
  imports: [CreditComponent],
  template: `
    <app-credit
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
    ></app-credit>
  `,
})
export class CreditContainerComponent extends SettingContainerComponent {
  protected override readonly scrId = SCR.CREDIT;
  protected override readonly tbl = TBL.CREDIT;
}
