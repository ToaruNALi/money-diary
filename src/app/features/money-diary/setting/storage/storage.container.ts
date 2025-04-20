import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingContainerComponent } from 'src/app/features/money-diary/setting/setting.container';
import { StorageComponent } from 'src/app/features/money-diary/setting/storage/storage.component';
import * as Const from 'src/app/shared/constants/constants';

@Component({
    selector: 'app-storage-container',
    imports: [StorageComponent],
    template: `
    <app-storage
      [style]="displayOpt().beforeStyle"
      [@display]="displayOpt().afterClass"
      [rowDataKey]="rowDataKey"
      [mainRowDatas]="storageDatas()"
      [inputDatas]="inputDatas()"
      [creditDatas]="creditDatas()"
      (rowDataEdits)="onEditRowDatas($event)"
      (filterInputModelSet)="onSetFilterInputModel($event)"
      (screenIdSet)="onSetScreenId($event)"
    ></app-storage>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StorageContainerComponent extends SettingContainerComponent {
  protected override readonly screenId = Const.SCREEN_ID.STORAGE;
  protected override readonly rowDataKey = Const.ROW_DATA_KEY.STORAGE;
}
