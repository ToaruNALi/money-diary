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
      [rowDataKey]="rowDataKey"
      [mainRowDatas]="remarkDatas()"
      [inputDatas]="inputDatas()"
      [creditDatas]="creditDatas()"
      (rowDataEdits)="onEditRowDatas($event)"
      (filterInputModelSet)="onSetFilterInputModel($event)"
      (screenIdSet)="onSetScreenId($event)"
    ></app-remark>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemarkContainerComponent extends SettingContainerComponent {
  protected override readonly screenId = Const.SCREEN_ID.REMARK;
  protected override readonly rowDataKey = Const.ROW_DATA_KEY.REMARK;
}
