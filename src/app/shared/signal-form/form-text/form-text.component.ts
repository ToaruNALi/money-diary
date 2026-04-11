import { Component } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { FormBaseComponent } from 'src/app/shared/signal-form/form-base/form-base.component';
import { FormClearButtonComponent } from 'src/app/shared/signal-form/form-clear-button/form-clear-button.component';
import { SignalFormValueDirective } from 'src/app/shared/signal-form/signal-form-value.derective';

@Component({
  selector: 'app-form-text',
  imports: [
    SharedCommonModule,
    FormsCommonModule,
    FormClearButtonComponent,
    SignalFormValueDirective,
    Field,
  ],
  templateUrl: './form-text.component.html',
  styleUrl: '../form-base/form-base.component.scss',
})
export class FormTextComponent extends FormBaseComponent {}
