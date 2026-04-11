import { Component } from '@angular/core';
import { InputRestrictionsDirective } from 'src/app/shared/directives/input-restrictions.derective';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormClearButtonComponent } from 'src/app/shared/forms/form-clear-button/form-clear-button.component';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-form-text',
  imports: [
    SharedCommonModule,
    FormsCommonModule,
    FormClearButtonComponent,
    InputRestrictionsDirective,
  ],
  templateUrl: './form-text.component.html',
  styleUrl: '../forms.component.scss',
})
export class FormTextComponent extends FormsComponent {
  protected override readonly type = INPUT_TYPE.TEXT;
}
