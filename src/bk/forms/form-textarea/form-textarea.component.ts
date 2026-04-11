import { Component } from '@angular/core';
import { InputRestrictionsDirective } from 'src/app/shared/directives/input-restrictions.derective';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormClearButtonComponent } from 'src/app/shared/forms/form-clear-button/form-clear-button.component';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-form-textarea',
  imports: [
    SharedCommonModule,
    FormsCommonModule,
    FormClearButtonComponent,
    InputRestrictionsDirective,
  ],
  templateUrl: './form-textarea.component.html',
  styleUrl: '../forms.component.scss',
})
export class FormTextareaComponent extends FormsComponent {
  protected override readonly type = 'textarea';
}
