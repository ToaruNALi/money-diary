import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MoneyDiaryBaseContainerComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.container';
import { ScheduleComponent } from 'src/app/features/money-diary/schedule/schedule.component';
import * as Const from 'src/app/shared/constants/constants';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleContainerComponent extends MoneyDiaryBaseContainerComponent {
  protected override readonly scrId = Const.SCR.SCHEDULE;
  protected override readonly tbl = Const.TBL.SCHEDULE;
}
