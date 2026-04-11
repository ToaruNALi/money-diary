import { Component } from '@angular/core';
import { MoneyDiaryInputContainerComponent } from 'src/app/features/money-diary/money-diary-input/money-diary-input.container';

@Component({
  selector: 'app-money-diary-input-page',
  imports: [MoneyDiaryInputContainerComponent],
  template: `
    <app-money-diary-input-container></app-money-diary-input-container>
  `,
})
export class MoneyDiaryInputPageComponent {}
