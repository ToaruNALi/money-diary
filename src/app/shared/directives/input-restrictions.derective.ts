import { Directive, HostListener, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';
import * as Const from 'src/app/shared/constants/constants';

@Directive({
  selector: '[appInputRestrictions]',
})
export class InputRestrictionsDirective {
  readonly forbiddenChars = input<(string | RegExp)[]>([]);
  readonly invalidReservedWord = input<boolean | undefined>(false);
  private readonly ngControl = inject(NgControl);

  @HostListener('input')
  readonly onInput = (): void => {
    let replaceValue: string = this.ngControl.control?.value ?? '';
    for (const value of this.forbiddenChars()) {
      replaceValue = replaceValue.replace(value, ''); // 入力可能な文字を制限
      // .replace(/((?<=[+\-*/])[+\-*/])/g, '') // 符号の連続は禁止
      // .replace(/(^|(?<=[^0-9]))0(?=[0-9])/g, ''); // 0始まりの数字は禁止
    }

    if (!this.invalidReservedWord()) {
      // 予約語が有効の場合
      replaceValue = replaceValue.replace(Const.RESERVED_WORD, '');
    }

    this.ngControl.control?.setValue(replaceValue);
  };
}
