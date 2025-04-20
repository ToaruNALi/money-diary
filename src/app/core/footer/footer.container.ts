import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FooterComponent } from 'src/app/core/footer/footer.component';
import { StoreUsecase } from 'src/app/usecase/store.usecase';

@Component({
    selector: 'app-footer-container',
    imports: [FooterComponent],
    template: `
    <app-footer
      [mapDisp]="usecase.mapDisp()"
      [rowDataMap]="usecase.storeRowData.rowDataMap()"
      [screenInfo]="usecase.storeScreen.screenInfo()"
      [history]="usecase.storeHistory.history()"
      (mapDispChange)="usecase.changeMapDisp($event)"
      (historyReset)="usecase.resetHistory()"
      (screenIdChange)="usecase.changeScreen($event)"
      (rowDataEdits)="usecase.editRowData($event)"
      (undoRedo)="usecase.undoRedo($event)"
    ></app-footer>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterContainerComponent {
  protected readonly usecase = inject(StoreUsecase);
}
