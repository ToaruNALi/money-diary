import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import * as Const from 'src/app/shared/constants/constants';
import { ScreenId } from 'src/app/shared/constants/types';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
    selector: 'app-menu',
    imports: [SharedCommonModule, MatMenuModule],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {
  readonly screenId = model.required<ScreenId>();

  protected readonly menuList = Const.SCREEN_INFO;

  protected readonly onClickMenu = (id: ScreenId): void => {
    this.screenId.set(id);
  };
}
