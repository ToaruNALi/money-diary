import { Component, inject } from '@angular/core';
import { FooterComponent } from 'src/app/core/footer/footer.component';
import { StoreUsecase } from 'src/app/usecase/store.usecase';

@Component({
  selector: 'app-footer-container',
  imports: [FooterComponent],
  template: `
    <app-footer
      [mapDsp]="usecase.mapDsp()"
      [nextScrId]="usecase.storeTmp.nextScrId()"
      [tblMap]="usecase.storeTblInf.tblInf.rd()"
      [scrInf]="usecase.storeScr.scrInf()"
      [hist]="usecase.storeHist.hist()"
      (mapDspChange)="usecase.changeMapDsp($event)"
      (nextScrIdChange)="usecase.storeTmp.setNextScrId($event)"
      (histReset)="usecase.resetHist()"
      (scrIdChange)="usecase.changeScr($event)"
      (rowEdt)="usecase.edtRows($event)"
      (undoRedo)="usecase.undoRedo($event)"
    ></app-footer>
  `,
})
export class FooterContainerComponent {
  protected readonly usecase = inject(StoreUsecase);
}
