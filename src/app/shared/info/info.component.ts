import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
    selector: 'app-info',
    imports: [SharedCommonModule, MatBadgeModule],
    templateUrl: './info.component.html',
    styleUrl: './info.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoComponent {
  // TODO: 予定通知機能
  protected readonly infoCnt = computed(() => undefined);
}
