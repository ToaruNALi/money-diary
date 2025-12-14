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
      [tbl]="tbl"
      [tblMap]="usecase.storeTblInf.tblInf.rd()"
      [colData]="usecase.storeTblInf.tblInf.cd()"
      [filterModel]="usecase.storeTblInf.tblInf.fm()"
      (rowEdt)="usecase.edtRows($event)"
      (colChange)="usecase.updCol($event)"
      (filterModelChange)="usecase.updFilterModel($event)"
      (scrIdSet)="usecase.changeScr($event)"
    ></app-storage>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorageContainerComponent extends SettingContainerComponent {
  protected override readonly scrId = Const.SCR.STORAGE;
  protected override readonly tbl = Const.TBL.STORAGE;
}
