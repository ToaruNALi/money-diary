import { Component } from '@angular/core';
import { CreditContainerComponent } from 'src/app/features/money-diary/setting/credit/credit.container';

@Component({
  selector: 'app-credit-page',
  imports: [CreditContainerComponent],
  template: ` <app-credit-container></app-credit-container> `,
})
export class CreditPageComponent {}
