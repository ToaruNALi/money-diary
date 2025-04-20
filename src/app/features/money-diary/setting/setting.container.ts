import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MoneyDiaryBaseContainerComponent } from 'src/app/features/money-diary/money-diary-base/money-diary-base.container';

@Component({
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class SettingContainerComponent extends MoneyDiaryBaseContainerComponent {}
