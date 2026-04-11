import { Component, computed } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-notification',
  imports: [SharedCommonModule, MatBadgeModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent {
  protected readonly infCnt = computed(() => 15);
}
