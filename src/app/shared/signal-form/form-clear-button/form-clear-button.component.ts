import { Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { FormValType } from 'src/app/shared/signal-form/signal-form.component';

@Component({
  selector: 'app-form-clear-button',
  imports: [SharedCommonModule],
  templateUrl: './form-clear-button.component.html',
})
export class FormClearButtonComponent implements FormValueControl<FormValType> {
  readonly value = model.required<FormValType>();
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly defVal = input<FormValType>('');
}
