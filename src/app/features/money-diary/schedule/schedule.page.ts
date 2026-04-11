import { Component } from '@angular/core';
import { ScheduleContainerComponent } from 'src/app/features/money-diary/schedule/schedule.container';

@Component({
  selector: 'app-schedule-page',
  imports: [ScheduleContainerComponent],
  template: ` <app-schedule-container></app-schedule-container> `,
})
export class SchedulePageComponent {}
