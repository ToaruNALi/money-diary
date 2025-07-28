import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { Hist } from 'src/app/domain/row-data-edit-history';
import { MESSAGE } from 'src/app/shared/constants/messages';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-history-reset',
  imports: [SharedCommonModule],
  templateUrl: './history-reset.component.html',
  styleUrl: './history-reset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryResetComponent {
  readonly hist = input.required<Hist>();
  protected readonly histReset = output<void>();

  protected readonly onResetHist = (): void => {
    if (confirm(MESSAGE.CONFIRM.HISTORY_RESET)) {
      this.histReset.emit();
    }
  };
}
