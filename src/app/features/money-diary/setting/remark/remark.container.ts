import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemarkComponent } from 'src/app/features/money-diary/setting/remark/remark.component';
import { SettingContainerComponent } from 'src/app/features/money-diary/setting/setting.container';
import * as Const from 'src/app/shared/constants/constants';

@Component({
  selector: 'app-remark-container',
  imports: [RemarkComponent],
  template: `
    <app-remark
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [tbl]="tbl"
      [tblMap]="usecase.storeTblInf.tblMap()"
      (rowEdt)="onEdtRows($event)"
      (filterEdt)="onEdtFilter($event)"
      (scrIdSet)="onSetScrId($event)"
    ></app-remark>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemarkContainerComponent extends SettingContainerComponent {
  protected override readonly scrId = Const.SCR.REMARK;
  protected override readonly tbl = Const.TBL.REMARK;
}
