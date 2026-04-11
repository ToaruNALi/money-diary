import { Component, computed, input, model, output } from '@angular/core';
import { TblMap } from 'src/app/domain/row-data';
import { Hist } from 'src/app/domain/row-data-edit-history';
import { ScrInf } from 'src/app/domain/screen-info';
import { ChartComponent } from 'src/app/shared/chart/chart.component';
import { MenuComponent } from 'src/app/shared/menu/menu.component';
import { RedoComponent } from 'src/app/shared/redo/redo.component';
import { ScreenTransitionComponent } from 'src/app/shared/screen-transition/screen-transition.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { UndoComponent } from 'src/app/shared/undo/undo.component';
import { RowEdt, TBL } from 'src/app/shared/utils/util-row';
import { Scr } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-footer',
  imports: [
    SharedCommonModule,
    MenuComponent,
    ScreenTransitionComponent,
    UndoComponent,
    RedoComponent,
    ChartComponent,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly mapDsp = model.required<boolean>();
  readonly nextScrId = model.required<Scr | null>();
  readonly tblMap = model.required<TblMap>();
  readonly scrInf = input.required<ScrInf>();
  readonly hist = input.required<Hist>();

  protected readonly mainRows = computed(() => this.tblMap()[TBL.MAIN]);

  protected readonly histReset = output<void>();
  protected readonly scrIdChange = output<Scr | undefined>();
  protected readonly rowEdt = output<RowEdt[]>();
  protected readonly undoRedo = output<boolean>();
}
