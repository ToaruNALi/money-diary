import { Component, input, output } from '@angular/core';

export type MoneyStatus = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-money-status',
  templateUrl: './money-status.component.html',
  styleUrl: './money-status.component.scss',
  //  // 選択時のステータスが反映されないため、コメント化
})
export class MoneyStatusComponent {
  readonly list = input.required<MoneyStatus[]>();
  protected readonly click = output<void>();
}
