import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { RowDataMap } from 'src/app/domain/row-data';
import { RowDataEditHistory } from 'src/app/domain/row-data-edit-history';
import { ScreenInfo } from 'src/app/domain/screen-info';
import { ChartComponent } from 'src/app/shared/chart/chart.component';
import * as Const from 'src/app/shared/constants/constants';
import { RowDataEdit, ScreenId } from 'src/app/shared/constants/types';
import { MenuComponent } from 'src/app/shared/menu/menu.component';
import { RedoComponent } from 'src/app/shared/redo/redo.component';
import { ScreenTransitionComponent } from 'src/app/shared/screen-transition/screen-transition.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { UndoComponent } from 'src/app/shared/undo/undo.component';
import { HistoryResetComponent } from '../../shared/history-reset/history-reset.component';

@Component({
  selector: 'app-footer',
  imports: [
    SharedCommonModule,
    MenuComponent,
    HistoryResetComponent,
    ScreenTransitionComponent,
    UndoComponent,
    RedoComponent,
    HistoryResetComponent,
    ChartComponent,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly mapDisp = model.required<boolean>();
  readonly rowDataMap = model.required<RowDataMap>();
  readonly screenInfo = input.required<ScreenInfo>();
  readonly history = input.required<RowDataEditHistory>();

  protected readonly inputDatas = computed(
    () => this.rowDataMap()[Const.ROW_DATA_KEY.MONEY_DIARY],
  );

  protected readonly historyReset = output<void>();
  protected readonly screenIdChange = output<ScreenId | undefined>();
  protected readonly rowDataEdits = output<RowDataEdit[]>();
  protected readonly undoRedo = output<boolean>();
}
