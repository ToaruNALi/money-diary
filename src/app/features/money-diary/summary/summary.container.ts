import { Component } from '@angular/core';
import { MoneyDiaryBaseContainerComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.container';
import { SummaryComponent } from 'src/app/features/money-diary/summary/summary.component';
import { TBL } from 'src/app/shared/utils/util-row';
import { SCR } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-summary-container',
  imports: [SummaryComponent],
  template: `
    <!-- <app-summary
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [tbl]="tbl"
      [tblMap]="usecase.storeTblInf.tblInf.rd()"
      (rowEdt)="usecase.edtRows($event)"
    ></app-summary> -->
  `,
})
export class SummaryContainerComponent extends MoneyDiaryBaseContainerComponent {
  protected override readonly scrId = SCR.SUMMARY;
  protected override readonly tbl = TBL.SUMMARY;
}
