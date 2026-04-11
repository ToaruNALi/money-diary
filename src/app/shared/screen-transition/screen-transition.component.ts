import { Component, computed, input, model, output } from '@angular/core';
import { ScrData } from 'src/app/domain/screen-info';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { SwipeComponent } from 'src/app/shared/swipe/swipe.component';
import { Scr } from 'src/app/shared/utils/util-screen';
import { SwipeOutput } from './../swipe/swipe.component';

/** 最大値 */
const MAX_LEN = {
  SCR_TRANS_MAP: 5,
} as const;

@Component({
  selector: 'app-screen-transition',
  imports: [SharedCommonModule, SwipeComponent],
  templateUrl: './screen-transition.component.html',
  styleUrl: './screen-transition.component.scss',
})
export class ScreenTransitionComponent {
  readonly mapDsp = model.required<boolean>();
  readonly nextScrId = model.required<Scr | null>();
  readonly scrId = input.required<Scr>();
  readonly scrData = input.required<Record<Scr, ScrData>>();

  readonly swipeReverse = input<boolean>(true);

  protected readonly scrIdChange = output<Scr | undefined>();

  protected readonly threshold = 30 as const;
  private readonly swipeDirection = computed(() =>
    this.swipeReverse() ? -1 : 1,
  );

  /**
   * スワイプ時
   * @param event
   */
  protected readonly onSwipe = (event: SwipeOutput): void => {
    const nextScrId = this.getNextScrId(event.disX, event.disY);
    if (!!nextScrId) {
      this.scrIdChange.emit(nextScrId as Scr);
    }
  };

  private readonly getNextScrId = (
    disX: number,
    disY: number,
  ): string | null => {
    // スワイプ距離がしきい値より大きい場合、画面遷移する
    const moveX = this.moveDirection(disX);
    const moveY = this.moveDirection(disY);

    const scrNow = this.scrData()[this.scrId()];

    const initX = this.movedPos(scrNow.px, moveX);
    const initY = this.movedPos(scrNow.py, moveY);

    if (moveX !== 0 && moveY !== 0) {
      // X,Y方向
      return this.getMatchScrId(initX, initY);
    } else if (moveX !== 0) {
      // X方向
      for (let px = initX; px !== scrNow.px; px = this.movedPos(px, moveX)) {
        const scr = this.getMatchScrId(px, initY);
        if (!!scr) {
          return scr;
        }
      }
    } else if (moveY !== 0) {
      // Y方向
      for (let py = initY; py !== scrNow.py; py = this.movedPos(py, moveY)) {
        const scr = this.getMatchScrId(initX, py);
        if (!!scr) {
          return scr;
        }
      }
    }

    return null;
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
      return MAX_LEN.SCR_TRANS_MAP - 1;
    } else if (direction > 0 && posNow === MAX_LEN.SCR_TRANS_MAP - 1) {
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
  private readonly getMatchScrId = (px: number, py: number): string | null => {
    return (
      Object.entries(this.scrData()).find(
        ([_, data]) => data.px === px && data.py === py,
      )?.[0] ?? null
    );
  };

  /**
   * クリック時
   */
  protected readonly onClick = (): void => {
    // 前画面に遷移
    this.scrIdChange.emit(undefined);
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

  /**
   * タッチ移動時
   */
  protected readonly onTouchMove = (event: SwipeOutput): void => {
    this.mapDsp.set(true);
    this.nextScrId.set(this.getNextScrId(event.disX, event.disY) as Scr | null);
  };
}
