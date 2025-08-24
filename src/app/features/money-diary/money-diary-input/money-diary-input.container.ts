import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MoneyDiaryBaseContainerComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.container';
import { MoneyDiaryInputComponent } from 'src/app/features/money-diary/money-diary-input/money-diary-input.component';
import * as Const from 'src/app/shared/constants/constants';

@Component({
  selector: 'app-money-diary-input-container',
  imports: [MoneyDiaryInputComponent],
  template: `
    <app-money-diary-input
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [display]="displayOpt().afterClass"
      [tbl]="tbl"
      [tblMap]="usecase.storeTblInf.tblMap()"
      [filterModel]="usecase.storeTmp.filterModel()"
      [edtPastData]="usecase.storeTmp.edtPastData()"
      (rowEdt)="onEdtRows($event)"
      (scrIdSet)="onSetScrId($event)"
    ></app-money-diary-input>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoneyDiaryInputContainerComponent extends MoneyDiaryBaseContainerComponent {
  protected override readonly scrId = Const.SCR.MAIN;
  protected override readonly tbl = Const.TBL.MAIN;
}
