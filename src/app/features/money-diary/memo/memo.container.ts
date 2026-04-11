import { Component } from '@angular/core';
import { MemoComponent } from 'src/app/features/money-diary/memo/memo.component';
import { MoneyDiaryBaseContainerComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.container';
import { TBL } from 'src/app/shared/utils/util-row';
import { SCR } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-memo-container',
  imports: [MemoComponent],
  template: `
    <app-memo
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [tbl]="tbl"
      [tblMap]="usecase.storeTblInf.tblInf.rd()"
      [colData]="usecase.storeTblInf.tblInf.cd()"
      [rowsKeyList]="usecase.storeTblInf.tblInf.rk()"
      (rowEdt)="usecase.edtRows($event)"
      (colChange)="usecase.updCol($event)"
      (rowsKeyChange)="usecase.updRowsKey($event)"
    ></app-memo>
  `,
})
export class MemoContainerComponent extends MoneyDiaryBaseContainerComponent {
  protected override readonly scrId = SCR.MEMO;
  protected override readonly tbl = TBL.MEMO;
}
