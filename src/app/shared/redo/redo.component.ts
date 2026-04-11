import { Component, computed, input, output } from '@angular/core';
import { Hist } from 'src/app/domain/row-data-edit-history';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-redo',
  imports: [SharedCommonModule],
  templateUrl: './redo.component.html',
  styleUrl: './redo.component.scss',
})
export class RedoComponent {
  readonly hist = input.required<Hist>();
  protected readonly redo = output<void>();

  protected readonly disabled = computed(
    () => this.hist().ix >= this.hist().rd.length,
  );
  protected readonly count = computed(
    // () => this.hist().rd.length - this.hist().ix,
    () => '',
  );
}
