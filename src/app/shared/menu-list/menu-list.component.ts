import { Component, computed, input, output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { MenuListData } from 'src/app/shared/utils/util-screen';

export type MenuListInput = {
  icon?: string;
  menuList: MenuListData[];
};

@Component({
  selector: 'app-menu-list',
  imports: [SharedCommonModule, MatMenuModule],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss',
})
export class MenuListComponent {
  readonly menuInput = input.required<MenuListInput>();
  protected readonly menuClick = output<string>();

  protected readonly icon = computed(
    () => this.menuInput().icon ?? 'more_vert',
  );
  protected readonly menuList = computed(() => this.menuInput().menuList);

  protected readonly onClickMenu = (id: string): void => {
    this.menuClick.emit(id);
  };
}
