import { Component } from '@angular/core';
import { MoneyDiaryBaseContainerComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.container';
import { MoneyDiaryInputComponent } from 'src/app/features/money-diary/money-diary-input/money-diary-input.component';
import { TBL } from 'src/app/shared/utils/util-row';
import { SCR } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-money-diary-input-container',
  imports: [MoneyDiaryInputComponent],
  template: `
    <app-money-diary-input
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [tbl]="tbl"
      [tblMap]="usecase.storeTblInf.tblInf.rd()"
      [colData]="usecase.storeTblInf.tblInf.cd()"
      [filterModel]="usecase.storeTblInf.tblInf.fm()"
      [display]="displayOpt().afterClass"
      (rowEdt)="usecase.edtRows($event)"
      (colChange)="usecase.updCol($event)"
      (scrIdSet)="usecase.changeScr($event)"
    ></app-money-diary-input>
  `,
})
export class MoneyDiaryInputContainerComponent extends MoneyDiaryBaseContainerComponent {
  protected override readonly scrId = SCR.MAIN;
  protected override readonly tbl = TBL.MAIN;
}
