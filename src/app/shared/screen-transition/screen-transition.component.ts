import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { ScrData } from 'src/app/domain/screen-info';
import * as Const from 'src/app/shared/constants/constants';
import { Scr } from 'src/app/shared/constants/types';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { SwipeComponent } from 'src/app/shared/swipe/swipe.component';

@Component({
  selector: 'app-screen-transition',
  imports: [SharedCommonModule, SwipeComponent],
  templateUrl: './screen-transition.component.html',
  styleUrl: './screen-transition.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenTransitionComponent {
  readonly mapDsp = model.required<boolean>();
  readonly scrId = input.required<Scr>();
  readonly scrData = input.required<Record<Scr, ScrData>>();

  readonly swipeReverse = input<boolean>(true);

  protected readonly scrIdChange = output<Scr | undefined>();

  private readonly threshold = 30 as const;
  private readonly swipeDirection = computed(() =>
    this.swipeReverse() ? -1 : 1,
  );

  /**
   * スワイプ時
   * @param dis
   */
  protected readonly onSwipe = (dis: { x: number; y: number }): void => {
    // スワイプ距離がしきい値より大きい場合、画面遷移する
    const moveX = this.moveDirection(dis.x);
    const moveY = this.moveDirection(dis.y);

    const scrNow = this.scrData()[this.scrId()];

    const initX = this.movedPos(scrNow.px, moveX);
    const initY = this.movedPos(scrNow.py, moveY);

    if (moveX !== 0 && moveY !== 0) {
      // X,Y方向
      if (this.matchPos(initX, initY)) {
        return;
      }
    } else if (moveX !== 0) {
      // X方向
      for (let px = initX; px !== scrNow.px; px = this.movedPos(px, moveX)) {
        if (this.matchPos(px, initY)) {
          return;
        }
      }
    } else if (moveY !== 0) {
      // Y方向
      for (let py = initY; py !== scrNow.py; py = this.movedPos(py, moveY)) {
        if (this.matchPos(initX, py)) {
          return;
        }
      }
    }
  };

  /**
   * クリック時
   */
  protected readonly onClick = (): void => {
    // 前画面に遷移
    this.scrIdChange.emit(undefined);
  };

  /**
   * 移動先の方向を返却する
   * @param dis
   * @returns
   */
  private readonly moveDirection = (dis: number): number => {
    if (dis < -this.threshold) {
      return this.swipeDirection();
    } else if (dis > this.threshold) {
      return -this.swipeDirection();
    }
    return 0;
  };

  /**
   * 移動先を返却する
   * @param posNow
   * @param direction
   * @returns
   */
  private readonly movedPos = (posNow: number, direction: number): number => {
    if (direction < 0 && posNow === 0) {
      return Const.MAX_LEN.SCR_TRANS_MAP - 1;
    } else if (direction > 0 && posNow === Const.MAX_LEN.SCR_TRANS_MAP - 1) {
      return 0;
    }
    return posNow + direction;
  };

  /**
   * スワイプ方向に画面がある場合、画面IDを更新する
   * @param px
   * @param py
   * @returns
   */
  private readonly matchPos = (px: number, py: number): boolean => {
    for (const [scr, data] of Object.entries(this.scrData())) {
      if (data.px === px && data.py === py) {
        this.scrIdChange.emit(scr as Scr);
        return true;
      }
    }
    return false;
  };

  /**
   * タッチ開始時
   */
  protected readonly onTouchStart = (): void => {
    this.mapDsp.set(true);
  };

  /**
   * タッチ終了時
   */
  protected readonly onTouchEnd = (): void => {
    this.mapDsp.set(false);
  };
}
