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
  selector: 'app-undo',
  imports: [SharedCommonModule],
  templateUrl: './undo.component.html',
  styleUrl: './undo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UndoComponent {
  readonly history = input.required<RowDataEditHistory>();
  protected readonly undo = output<void>();

  protected readonly disabled = computed(() => this.history().ix <= 0);
  protected readonly count = computed(
    () =>
      // this.history().ix
      this.history().ix - this.history().ud.length || '',
  );
}
