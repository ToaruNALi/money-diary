import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ScreenData } from 'src/app/domain/screen-info';
import * as Const from 'src/app/shared/constants/constants';
import { ScreenId } from 'src/app/shared/constants/types';

@Component({
  selector: 'app-screen-transition-map',
  imports: [MatIconModule],
  templateUrl: './screen-transition-map.component.html',
  styleUrl: './screen-transition-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenTransitionMapComponent {
  readonly display = input.required<boolean>();
  readonly screenId = input.required<ScreenId>();
  readonly screenDatas = input.required<ScreenData[]>();

  protected readonly map = computed(() => {
    const id = this.screenId();

    let xSize = 0;
    let ySize = 0;

    const datas = this.screenDatas();
    for (const data of datas) {
      const x = data.px + 1;
      const y = data.py + 1;

      if (x > xSize) {
        xSize = x;
      }
      if (y > ySize) {
        ySize = y;
      }
    }

    const map = [...new Array(ySize)].map((_) =>
      [...new Array(xSize)].fill({
        id: '',
        select: false,
        icon: '',
      }),
    );

    for (const data of datas) {
      const info = Const.SCREEN_INFO.find((info) => info.id === data.id)!;
      map[data.py][data.px] = {
        id: info.id,
        select: data.id === id,
        icon: info.icon,
      };
    }

    // // Y方向の空行削除
    // const delListY = [];
    // for (const [idx, datas] of map.entries()) {
    //   if (!datas.some((data) => !!data.id)) {
    //     delListY.push(idx);
    //   }
    // }
    // delListY.reverse();
    // for (const y of delListY) {
    //   map.splice(y, 1);
    // }

    // // X方向の空行削除
    // const delListX = [];
    // for (let idx = 0; idx < Const.MAX_LEN.SCREEN_TRANS_MAP; idx++) {
    //   if (!map.some((datas) => !!datas[idx].id)) {
    //     delListX.push(idx);
    //   }
    // }
    // delListX.reverse();
    // for (const x of delListX) {
    //   for (const data of map) {
    //     data.splice(x, 1);
    //   }
    // }

    return map;
  });
}
