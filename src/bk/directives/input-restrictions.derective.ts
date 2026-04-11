import { Directive, ElementRef, inject, input, model } from '@angular/core';
import { NgControl } from '@angular/forms';
import {
  InputRestrictions,
  RESERVED_WORD,
} from 'src/app/shared/signal-form/signal-form-value.derective';

@Directive({
  selector: '[appInputRestrictions2]',
  host: { '(input)': 'onInput()' },
})
export class InputRestrictionsDirective2 {
  readonly forbiddenChars = input<InputRestrictions[]>([]);
  readonly invalidReservedWord = input<boolean>(false);
  readonly value = model.required<any>();
  readonly elemRef = inject(ElementRef<HTMLInputElement>);

  readonly onInput = (): void => {
    let retVal = this.elemRef.nativeElement.value;

    for (const { searchVal, replaceVal } of this.forbiddenChars()) {
      retVal = retVal.replace(searchVal, replaceVal);
    }

    if (!this.invalidReservedWord()) {
      // 予約語が有効の場合
      retVal = retVal.replace(RESERVED_WORD, '');
    }

    this.elemRef.nativeElement.value = retVal;
  };
}

@Directive({
  selector: '[appInputRestrictions]',
  host: { '(input)': 'onInput()' },
})
export class InputRestrictionsDirective {
  readonly inputRestrictions = input<InputRestrictions[]>([]);
  readonly invalidReservedWord = input<boolean | undefined>(false);
  private readonly ngControl = inject(NgControl);

  readonly onInput = (): void => {
    let retVal: string = this.ngControl.control?.value ?? '';
    for (const { searchVal, replaceVal } of this.inputRestrictions()) {
      retVal = retVal.replace(searchVal, replaceVal);
    }

    if (!this.invalidReservedWord()) {
      // 予約語が有効の場合
      retVal = retVal.replace(RESERVED_WORD, '');
    }

    this.ngControl.control?.setValue(retVal);
  };
}
