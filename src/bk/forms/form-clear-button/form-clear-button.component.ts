import { Component, input, output } from '@angular/core';
import { ValType } from 'src/app/shared/constants/types';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-form-clear-button',
  imports: [SharedCommonModule],
  templateUrl: './form-clear-button.component.html',
})
export class FormClearButtonComponent {
  readonly disabled = input.required<boolean>();
  readonly value = input.required<ValType>();
  protected readonly clearBtnClick = output<void>();
}
