import { Component } from '@angular/core';
import { MoneyDiaryBaseContainerComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.container';
import { ScheduleComponent } from 'src/app/features/money-diary/schedule/schedule.component';
import { TBL } from 'src/app/shared/utils/util-row';
import { SCR } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-schedule-container',
  imports: [ScheduleComponent],
  template: `
    <app-schedule
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [tbl]="tbl"
      [tblMap]="usecase.storeTblInf.tblInf.rd()"
      (rowEdt)="usecase.edtRows($event)"
    ></app-schedule>
  `,
})
export class ScheduleContainerComponent extends MoneyDiaryBaseContainerComponent {
  protected override readonly scrId = SCR.SCHEDULE;
  protected override readonly tbl = TBL.SCHEDULE;
}
