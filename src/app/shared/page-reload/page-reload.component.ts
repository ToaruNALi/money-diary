import { Component } from '@angular/core';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-page-reload',
  imports: [SharedCommonModule],
  templateUrl: './page-reload.component.html',
  styleUrl: './page-reload.component.scss',
})
export class PageReloadComponent {
  protected readonly onBtnReload = (): void => {
    location.reload();
  };
}
