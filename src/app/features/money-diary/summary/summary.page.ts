import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SummaryContainerComponent } from 'src/app/features/money-diary/summary/summary.container';

@Component({
  selector: 'app-summary-page',
  imports: [SummaryContainerComponent],
  template: ` <app-summary-container></app-summary-container> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryPageComponent {}
