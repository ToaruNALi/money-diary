import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MemoContainerComponent } from 'src/app/features/money-diary/memo/memo.container';
import { MoneyDiaryInputContainerComponent } from 'src/app/features/money-diary/money-diary-input/money-diary-input.container';
import { ScheduleContainerComponent } from 'src/app/features/money-diary/schedule/schedule.container';
import { CreditContainerComponent } from 'src/app/features/money-diary/setting/credit/credit.container';
import { ItemContainerComponent } from 'src/app/features/money-diary/setting/item/item.container';
import { RemarkContainerComponent } from 'src/app/features/money-diary/setting/remark/remark.container';
import { StorageContainerComponent } from 'src/app/features/money-diary/setting/storage/storage.container';
import { SummaryContainerComponent } from 'src/app/features/money-diary/summary/summary.container';

@Component({
    selector: 'app-money-diary-page',
    imports: [
        MoneyDiaryInputContainerComponent,
        ScheduleContainerComponent,
        CreditContainerComponent,
        ItemContainerComponent,
        RemarkContainerComponent,
        StorageContainerComponent,
        SummaryContainerComponent,
        MemoContainerComponent,
    ],
    template: `
    <app-money-diary-input-container></app-money-diary-input-container>
    <app-schedule-container></app-schedule-container>
    <app-credit-container></app-credit-container>
    <app-item-container></app-item-container>
    <app-remark-container></app-remark-container>
    <app-storage-container></app-storage-container>
    <app-summary-container></app-summary-container>
    <app-memo-container></app-memo-container>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoneyDiaryPageComponent {}
