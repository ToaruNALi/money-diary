import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MenuListData } from 'src/app/shared/constants/types';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type MenuListInput = {
  icon?: string;
  menuList: MenuListData[];
};

@Component({
  selector: 'app-menu-list',
  imports: [SharedCommonModule, MatMenuModule],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
