import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import moji from 'moji';
import { FormValType } from 'src/app/shared/signal-form/signal-form.component';

/** 入力制限 */
export type InputRestrictions = {
  searchVal: string | RegExp;
  replaceVal: string;
};

/** 入力制限 */
export const INPUT_RESTRICTIONS = {
  AMT: [
    { searchVal: /[^0-9+\-*/()]+/g, replaceVal: '' }, // 数値と符号以外禁止
    { searchVal: /((?<=[+\-*/])[+\-*/])/g, replaceVal: '' }, // 符号の連続は禁止
    { searchVal: /(^|(?<=[^0-9]))0(?=[0-9])/g, replaceVal: '' }, // 0始まりの数字は禁止
  ],
} as const satisfies Record<string, InputRestrictions[]>;

/** 予約語 */
export const RESERVED_WORD = /@+/g;

@Directive({
  selector: '[appSignalFormValue]',
  host: { '(input)': 'onInput()' },
})
export class SignalFormValueDirective {
  readonly forbiddenChars = input<InputRestrictions[]>([]);
  readonly invalidReservedWord = input<boolean>(false);
  readonly elemRef = inject(ElementRef<HTMLInputElement>);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly onInput = (): void => {
    let retVal: string = this.elemRef.nativeElement.value;

    for (const { searchVal, replaceVal } of this.forbiddenChars()) {
      retVal = retVal.replace(searchVal, replaceVal);
    }

    if (!this.invalidReservedWord()) {
      // 予約語が有効の場合
      retVal = retVal.replace(RESERVED_WORD, '');
    }

    // // 半角カナと全角英数の禁止
    retVal = this.cvtMoji(retVal);

    this.elemRef.nativeElement.value = retVal;
    // 更新後の値をformに反映させるための設定
    this.cdr.detectChanges();
  };

  /**
   * 文字を変換する
   * @param value
   * @returns 変換後文字
   */
  private readonly cvtMoji = (value?: FormValType): string =>
    moji(value?.toString() ?? '')
      .convert('HK', 'ZK') // 半角カタカナ → 全角カタカナ
      // .convert('ZE', 'HE') // 全角英数 → 半角英数
      .toString();
}
