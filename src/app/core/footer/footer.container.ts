import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FooterComponent } from 'src/app/core/footer/footer.component';
import { StoreUsecase } from 'src/app/usecase/store.usecase';

@Component({
  selector: 'app-footer-container',
  imports: [FooterComponent],
  template: `
    <app-footer
      [mapDsp]="usecase.mapDsp()"
      [tblMap]="usecase.storeTblInf.tblMap()"
      [scrInf]="usecase.storeScr.scrInf()"
      [hist]="usecase.storeHist.hist()"
      (mapDspChange)="usecase.changeMapDsp($event)"
      (histReset)="usecase.resetHist()"
      (scrIdChange)="usecase.changeScr($event)"
      (rowEdt)="usecase.edtRows($event)"
      (undoRedo)="usecase.undoRedo($event)"
    ></app-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterContainerComponent {
  protected readonly usecase = inject(StoreUsecase);
}
