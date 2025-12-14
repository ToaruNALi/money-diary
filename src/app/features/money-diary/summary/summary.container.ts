import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MoneyDiaryBaseContainerComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.container';
import { SummaryComponent } from 'src/app/features/money-diary/summary/summary.component';
import * as Const from 'src/app/shared/constants/constants';

@Component({
  selector: 'app-summary-container',
  imports: [SummaryComponent],
  template: `
    <app-summary
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [tbl]="tbl"
      [tblMap]="usecase.storeTblInf.tblInf.rd()"
      (rowEdt)="usecase.edtRows($event)"
    ></app-summary>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryContainerComponent extends MoneyDiaryBaseContainerComponent {
  protected override readonly scrId = Const.SCR.SUMMARY;
  protected override readonly tbl = Const.TBL.SUMMARY;
}
