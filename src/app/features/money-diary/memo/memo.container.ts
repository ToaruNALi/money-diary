import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MemoComponent } from 'src/app/features/money-diary/memo/memo.component';
import { MoneyDiaryBaseContainerComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.container';
import * as Const from 'src/app/shared/constants/constants';

@Component({
  selector: 'app-memo-container',
  imports: [MemoComponent],
  template: `
    <app-memo
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [tbl]="tbl"
      [mainRows]="memRows()"
      (rowEdt)="onEdtRows($event)"
    ></app-memo>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoContainerComponent extends MoneyDiaryBaseContainerComponent {
  protected override readonly scrId = Const.SCR.MEMO;
  protected override readonly tbl = Const.TBL.MEMO;
}
