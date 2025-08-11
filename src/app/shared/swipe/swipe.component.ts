import {
  ChangeDetectionStrategy,
  Component,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type SwipeOutput = {
  /** スワイプ距離X軸 */
  disX: number;
  /** スワイプ距離Y軸 */
  disY: number;
  /** スワイプ */
  swiped: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
};

@Component({
  selector: 'app-swipe',
  imports: [SharedCommonModule],
  templateUrl: './swipe.component.html',
  styleUrl: './swipe.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwipeComponent {
  /** タップ時の誤動作を防ぐためのスワイプ時の処理を実行しない最小距離X */
  readonly minDistanceX = input<number>(0);
  /** タップ時の誤動作を防ぐためのスワイプ時の処理を実行しない最小距離Y */
  readonly minDistanceY = input<number>(0);

  protected readonly swipeLeft = output<void>();
  protected readonly swipeRight = output<void>();
  protected readonly swipeUp = output<void>();
  protected readonly swipeDown = output<void>();
  protected readonly swipe = output<SwipeOutput>();
  protected readonly click = output<void>();
  protected readonly touchStart = output<void>();
  protected readonly touchEnd = output<void>();
  protected readonly touchMove = output<SwipeOutput>();

  // スワイプ開始時の座標
  private readonly startX = signal<number>(0);
  private readonly startY = signal<number>(0);
  // スワイプ終了時の座標
  private readonly endX = signal<number>(0);
  private readonly endY = signal<number>(0);
  // スワイプ中かどうか
  protected readonly swiping = linkedSignal(() => ({
    up:
      this.startY() > this.endY() &&
      Math.abs(this.endY() - this.startY()) > this.minDistanceY(),
    down:
      this.startY() < this.endY() &&
      Math.abs(this.endY() - this.startY()) > this.minDistanceY(),
    left:
      this.startX() > this.endX() &&
      Math.abs(this.endX() - this.startX()) > this.minDistanceX(),
    right:
      this.startX() < this.endX() &&
      Math.abs(this.endX() - this.startX()) > this.minDistanceX(),
  }));

  protected readonly onTouchStart = (e: TouchEvent): void => {
    this.startX.set(e.touches[0].pageX);
    this.startY.set(e.touches[0].pageY);
    this.endX.set(e.touches[0].pageX);
    this.endY.set(e.touches[0].pageY);

    this.touchStart.emit();
  };

  protected readonly onTouchMove = (e: TouchEvent): void => {
    this.endX.set(e.changedTouches[0].pageX);
    this.endY.set(e.changedTouches[0].pageY);
    this.touchMove.emit({
      disX: this.endX() - this.startX(),
      disY: this.endY() - this.startY(),
      swiped: {
        ...this.swiping(),
      },
    });
  };

  protected readonly onTouchEnd = (_e: TouchEvent): void => {
    let swipeFlg = false;

    if (this.swiping().up) {
      swipeFlg = true;
      this.swipeUp.emit();
    }
    if (this.swiping().down) {
      swipeFlg = true;
      this.swipeDown.emit();
    }
    if (this.swiping().left) {
      swipeFlg = true;
      this.swipeLeft.emit();
    }
    if (this.swiping().right) {
      swipeFlg = true;
      this.swipeRight.emit();
    }
    if (swipeFlg) {
      this.swipe.emit({
        disX: this.endX() - this.startX(),
        disY: this.endY() - this.startY(),
        swiped: {
          ...this.swiping(),
        },
      });
    }
    this.touchEnd.emit();
    // スワイプ中フラグをリセット
    this.swiping.set({ up: false, down: false, left: false, right: false });
  };

  protected readonly onClick = (_: Event): void => {
    this.click.emit();
  };

  protected readonly onPointerDown = (_: PointerEvent): void => {
    this.touchStart.emit();
  };

  protected readonly onPointerUp = (_: PointerEvent): void => {
    this.touchEnd.emit();
  };
}
