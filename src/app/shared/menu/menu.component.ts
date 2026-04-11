import { Component, model } from '@angular/core';
import {
  MenuListComponent,
  MenuListInput,
} from 'src/app/shared/menu-list/menu-list.component';
import { Scr, getMenuList } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-menu',
  imports: [MenuListComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  readonly scrId = model.required<Scr>();

  protected readonly menuInput: MenuListInput = {
    menuList: getMenuList(),
  };

  protected readonly onClickMenu = (id: string): void => {
    this.scrId.set(id as Scr);
  };
}
