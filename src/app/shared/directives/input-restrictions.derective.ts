import { Directive, HostListener, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';
import * as Const from 'src/app/shared/constants/constants';
import { InputRestrictions } from 'src/app/shared/constants/types';

@Directive({
  selector: '[appInputRestrictions]',
})
export class InputRestrictionsDirective {
  readonly inputRestrictions = input<InputRestrictions[]>([]);
  readonly invalidReservedWord = input<boolean | undefined>(false);
  private readonly ngControl = inject(NgControl);

  @HostListener('input')
  readonly onInput = (): void => {
    let retVal: string = this.ngControl.control?.value ?? '';
    for (const { searchVal, replaceVal } of this.inputRestrictions()) {
      retVal = retVal.replace(searchVal, replaceVal);
    }

    if (!this.invalidReservedWord()) {
      // 予約語が有効の場合
      retVal = retVal.replace(Const.RESERVED_WORD, '');
    }

    this.ngControl.control?.setValue(retVal);
  };
}
