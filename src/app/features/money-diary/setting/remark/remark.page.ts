import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemarkContainerComponent } from 'src/app/features/money-diary/setting/remark/remark.container';

@Component({
  selector: 'app-remark-page',
  imports: [RemarkContainerComponent],
  template: ` <app-remark-container></app-remark-container> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemarkPageComponent {}
