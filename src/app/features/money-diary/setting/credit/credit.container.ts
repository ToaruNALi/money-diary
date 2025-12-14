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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditContainerComponent extends SettingContainerComponent {
  protected override readonly scrId = Const.SCR.CREDIT;
  protected override readonly tbl = Const.TBL.CREDIT;
}
