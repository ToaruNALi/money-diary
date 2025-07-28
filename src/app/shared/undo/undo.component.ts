import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Hist } from 'src/app/domain/row-data-edit-history';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-undo',
  imports: [SharedCommonModule],
  templateUrl: './undo.component.html',
  styleUrl: './undo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UndoComponent {
  readonly hist = input.required<Hist>();
  protected readonly undo = output<void>();

  protected readonly disabled = computed(() => this.hist().ix <= 0);
  protected readonly count = computed(
    // () => this.hist().ix,
    () => this.hist().ix - this.hist().ud.length || '',
  );
}
