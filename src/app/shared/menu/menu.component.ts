import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { Scr } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-menu',
  imports: [SharedCommonModule, MatMenuModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  readonly scrId = model.required<Scr>();

  protected readonly menuList = Util.getMenuList();

  protected readonly onClickMenu = (id: Scr): void => {
    this.scrId.set(id);
  };
}
