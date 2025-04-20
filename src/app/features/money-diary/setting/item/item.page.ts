import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemContainerComponent } from 'src/app/features/money-diary/setting/item/item.container';

@Component({
  selector: 'app-item-page',
  imports: [ItemContainerComponent],
  template: ` <app-item-container></app-item-container> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemPageComponent {}
