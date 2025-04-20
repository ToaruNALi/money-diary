import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-progress-spinner',
    imports: [MatProgressSpinnerModule],
    templateUrl: './progress-spinner.component.html',
    styleUrl: './progress-spinner.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressSpinnerComponent {
  readonly loading = input.required<boolean>();
}
