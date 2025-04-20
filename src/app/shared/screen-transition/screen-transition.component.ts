import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { ScreenData } from 'src/app/domain/screen-info';
import * as Const from 'src/app/shared/constants/constants';
import { ScreenId } from 'src/app/shared/constants/types';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { SwipeComponent } from 'src/app/shared/swipe/swipe.component';

@Component({
    selector: 'app-screen-transition',
    imports: [SharedCommonModule, SwipeComponent],
    templateUrl: './screen-transition.component.html',
    styleUrl: './screen-transition.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenTransitionComponent {
  readonly mapDisp = model.required<boolean>();
  readonly screenId = input.required<ScreenId>();
  readonly screenDatas = input.required<ScreenData[]>();

  readonly swipeReverse = input<boolean>(true);

  protected readonly screenIdChange = output<ScreenId | undefined>();

  private readonly threshold = 30 as const;
  private readonly swipeDirection = computed(() =>
    this.swipeReverse() ? -1 : 1,
  );

  /**
   * スワイプ時
   * @param distance
   */
  protected readonly onSwipe = (distance: { x: number; y: number }): void => {
    const screenId = this.screenId();
    const datas = this.screenDatas();

    // スワイプ距離がしきい値より大きい場合、画面遷移する
    const disX = distance.x;
    const disY = distance.y;

    const moveX = this.moveDirection(disX);
    const moveY = this.moveDirection(disY);

    const screenNow = datas.find((data) => data.id === screenId);

    if (!screenNow) {
      return;
    }

    const initX = this.movedPos(screenNow.px, moveX);
    const initY = this.movedPos(screenNow.py, moveY);

    if (moveX !== 0 && moveY !== 0) {
      // X,Y方向
      if (this.matchPos(initX, initY)) {
        return;
      }
    } else if (moveX !== 0) {
      // X方向
      for (let px = initX; px !== screenNow.px; px = this.movedPos(px, moveX)) {
        if (this.matchPos(px, initY)) {
          return;
        }
      }
    } else if (moveY !== 0) {
      // Y方向
      for (let py = initY; py !== screenNow.py; py = this.movedPos(py, moveY)) {
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
    this.screenIdChange.emit(undefined);
  };

  /**
   * 移動先の方向を返却する
   * @param distance
   * @returns
   */
  private readonly moveDirection = (distance: number): number => {
    if (distance < -this.threshold) {
      return this.swipeDirection();
    } else if (distance > this.threshold) {
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
      return Const.MAX_LEN.SCREEN_TRANS_MAP - 1;
    } else if (direction > 0 && posNow === Const.MAX_LEN.SCREEN_TRANS_MAP - 1) {
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
    for (const screen of this.screenDatas()) {
      if (screen.px === px && screen.py === py) {
        this.screenIdChange.emit(screen.id);
        return true;
      }
    }
    return false;
  };

  /**
   * タッチ開始時
   */
  protected readonly onTouchStart = (): void => {
    this.mapDisp.set(true);
  };

  /**
   * タッチ終了時
   */
  protected readonly onTouchEnd = (): void => {
    this.mapDisp.set(false);
  };
}
