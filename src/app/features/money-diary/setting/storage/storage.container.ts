import { Component } from '@angular/core';
import { SettingContainerComponent } from 'src/app/features/money-diary/setting/setting.container';
import { StorageComponent } from 'src/app/features/money-diary/setting/storage/storage.component';
import { TBL } from 'src/app/shared/utils/util-row';
import { SCR } from 'src/app/shared/utils/util-screen';

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
})
export class StorageContainerComponent extends SettingContainerComponent {
  protected override readonly scrId = SCR.STORAGE;
  protected override readonly tbl = TBL.STORAGE;
}
