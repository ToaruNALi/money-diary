import { Component } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { FormBaseComponent } from 'src/app/shared/signal-form/form-base/form-base.component';
import { FormClearButtonComponent } from 'src/app/shared/signal-form/form-clear-button/form-clear-button.component';
import { SignalFormValueDirective } from 'src/app/shared/signal-form/signal-form-value.derective';

@Component({
  selector: 'app-form-textarea',
  imports: [
    SharedCommonModule,
    FormsCommonModule,
    FormClearButtonComponent,
    SignalFormValueDirective,
    Field,
  ],
  templateUrl: './form-textarea.component.html',
  styleUrl: '../form-base/form-base.component.scss',
})
export class FormTextareaComponent extends FormBaseComponent {
  /**
   * テキスト入力時(禁止文字がある入力フォームの場合、必ずこのメソッドを呼び出す)
   * @param event
   */
  protected readonly handleInputTextarea = (event: Event) => {
    this.data()().value.set((event.target as HTMLInputElement).value);
  };
}
