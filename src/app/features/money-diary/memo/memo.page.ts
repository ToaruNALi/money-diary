import { Component } from '@angular/core';
import { MemoContainerComponent } from 'src/app/features/money-diary/memo/memo.container';

@Component({
  selector: 'app-memo-page',
  imports: [MemoContainerComponent],
  template: ` <app-memo-container></app-memo-container> `,
})
export class MemoPageComponent {}
