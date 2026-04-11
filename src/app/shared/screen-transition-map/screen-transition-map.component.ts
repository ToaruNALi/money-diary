import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ScrData } from 'src/app/domain/screen-info';
import { Scr, SCR_INF } from 'src/app/shared/utils/util-screen';

@Component({
  selector: 'app-screen-transition-map',
  imports: [MatIconModule],
  templateUrl: './screen-transition-map.component.html',
  styleUrl: './screen-transition-map.component.scss',
})
export class ScreenTransitionMapComponent {
  readonly display = input.required<boolean>();
  readonly scrId = input.required<Scr>();
  readonly nextScrId = input.required<Scr | null>();
  readonly scrData = input.required<Record<Scr, ScrData>>();

  protected readonly map = computed(() => {
    const id = this.scrId();
    const nextId = this.nextScrId();
    const datas = this.scrData();

    let xSize = 0;
    let ySize = 0;

    // X,Y軸方向の最大サイズを求める
    for (const data of Object.values(datas)) {
      const x = data.px + 1;
      const y = data.py + 1;

      if (x > xSize) {
        xSize = x;
      }
      if (y > ySize) {
        ySize = y;
      }
    }

    const retMap = [...new Array(ySize)].map((_) =>
      [...new Array(xSize)].fill({
        id: '',
        select: false,
        nextSelect: false,
        icon: '',
      }),
    );

    for (const [scr, data] of Object.entries(datas)) {
      const info = SCR_INF[scr as Scr];
      retMap[data.py][data.px] = {
        id: scr,
        select: scr === id,
        nextSelect: scr === nextId,
        icon: info.ic,
      };
    }

    return retMap;
  });
}
