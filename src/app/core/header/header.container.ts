import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderComponent } from 'src/app/core/header/header.component';
import { StoreUsecase } from 'src/app/usecase/store.usecase';

@Component({
  selector: 'app-header-container',
  imports: [HeaderComponent],
  template: `
    <app-header
      [scrData]="usecase.scrDatas()"
      [data]="usecase.allData()"
      [hist]="usecase.storeHist.hist()"
      [edtPastData]="usecase.storeTmp.edtPastData()"
      (histReset)="usecase.resetHist()"
      (dataChange)="usecase.setAllData($event)"
      (edtPastDataChange)="usecase.storeTmp.setEdtPastData($event)"
    ></app-header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderContainerComponent {
  protected readonly usecase = inject(StoreUsecase);
}
