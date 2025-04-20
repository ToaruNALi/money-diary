import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
    selector: 'app-swipe',
    imports: [SharedCommonModule],
    templateUrl: './swipe.component.html',
    styleUrl: './swipe.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
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
  protected readonly swipe = output<{ x: number; y: number }>();
  protected readonly click = output<void>();
  protected readonly touchStart = output<void>();
  protected readonly touchEnd = output<void>();

  // private minimumDistance = 30;
  // スワイプ開始時の座標
  private readonly startX = signal<number>(0);
  private readonly startY = signal<number>(0);
  // スワイプ終了時の座標
  private readonly endX = signal<number>(0);
  private readonly endY = signal<number>(0);

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
  };

  protected readonly onTouchEnd = (_e: TouchEvent): void => {
    const distanceX = this.endX() - this.startX();
    const distanceY = this.endY() - this.startY();

    let swipeFlg = false;

    if (
      this.startX() < this.endX() &&
      Math.abs(distanceX) > this.minDistanceX()
    ) {
      console.log('Swipe Right');
      swipeFlg = true;
      this.swipeRight.emit();
    }

    if (
      this.startX() > this.endX() &&
      Math.abs(distanceX) > this.minDistanceX()
    ) {
      console.log('Swipe Left');
      swipeFlg = true;
      this.swipeLeft.emit();
    }

    if (
      this.startY() < this.endY() &&
      Math.abs(distanceY) > this.minDistanceY()
    ) {
      console.log('Swipe Down');
      swipeFlg = true;
      this.swipeDown.emit();
    }

    if (
      this.startY() > this.endY() &&
      Math.abs(distanceY) > this.minDistanceY()
    ) {
      console.log('Swipe Up');
      swipeFlg = true;
      this.swipeUp.emit();
    }

    if (swipeFlg) {
      this.swipe.emit({ x: distanceX, y: distanceY });
    }

    this.touchEnd.emit();
  };

  protected readonly onClick = (_e: Event): void => {
    this.click.emit();
  };

  protected readonly onPointerDown = (e: PointerEvent): void => {
    this.touchStart.emit();
  };

  protected readonly onPointerMove = (e: PointerEvent): void => {};

  protected readonly onPointerUp = (_e: PointerEvent): void => {
    this.touchEnd.emit();
  };

  protected readonly onContextMenu = (_e: Event): void => {
    // this.touchEnd.emit();
  };
}
