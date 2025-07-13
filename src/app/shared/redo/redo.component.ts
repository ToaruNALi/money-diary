import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { RowDataEditHistory } from 'src/app/domain/row-data-edit-history';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-redo',
  imports: [SharedCommonModule],
  templateUrl: './redo.component.html',
  styleUrl: './redo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedoComponent {
  readonly history = input.required<RowDataEditHistory>();
  protected readonly redo = output<void>();

  protected readonly disabled = computed(
    () => this.history().ix >= this.history().rd.length,
  );
  protected readonly count = computed(
    () =>
      // this.history().rd.length - this.history().ix,
      '',
  );
}
