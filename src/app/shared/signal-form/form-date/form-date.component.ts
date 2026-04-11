import { Component } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { FormBaseComponent } from 'src/app/shared/signal-form/form-base/form-base.component';
import { FormClearButtonComponent } from 'src/app/shared/signal-form/form-clear-button/form-clear-button.component';
import { FormValType } from 'src/app/shared/signal-form/signal-form.component';
import * as UtilDate from 'src/app/shared/utils/util-row';

@Component({
  selector: 'app-form-date',
  imports: [
    SharedCommonModule,
    FormsCommonModule,
    FormClearButtonComponent,
    Field,
  ],
  templateUrl: './form-date.component.html',
  styleUrl: '../form-base/form-base.component.scss',
})
export class FormDateComponent extends FormBaseComponent {
  /**
   * 日付入力時
   * @param value
   */
  protected readonly setDateStr = (value: FormValType) => {
    if (!!value) {
      value = UtilDate.cvtDateToStr(new Date(value as unknown as Date));
    }
    this.data()().value.set(value);
  };
}
