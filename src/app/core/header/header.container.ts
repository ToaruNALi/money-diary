import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderComponent } from 'src/app/core/header/header.component';
import { StoreUsecase } from 'src/app/usecase/store.usecase';

@Component({
  selector: 'app-header-container',
  imports: [HeaderComponent],
  template: `
    <app-header
      [screenDatas]="usecase.screenDatas()"
      [data]="usecase.allData()"
      [history]="usecase.storeHistory.history()"
      [editPastData]="usecase.storeTemp.editPastData()"
      (historyReset)="usecase.resetHistory()"
      (dataChange)="usecase.setAllData($event)"
      (editPastDataChange)="usecase.storeTemp.setEditPastData($event)"
    ></app-header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderContainerComponent {
  protected readonly usecase = inject(StoreUsecase);
}
