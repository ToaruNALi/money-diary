import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { Scr } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  MenuListComponent,
  MenuListInput,
} from 'src/app/shared/menu-list/menu-list.component';

@Component({
  selector: 'app-menu',
  imports: [MenuListComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  readonly scrId = model.required<Scr>();

  protected readonly menuInput: MenuListInput = {
    menuList: Util.getMenuList(),
  };

  protected readonly onClickMenu = (id: string): void => {
    this.scrId.set(id as Scr);
  };
}
