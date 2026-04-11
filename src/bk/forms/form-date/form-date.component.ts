import { Component } from '@angular/core';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormClearButtonComponent } from 'src/app/shared/forms/form-clear-button/form-clear-button.component';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-form-date',
  imports: [SharedCommonModule, FormsCommonModule, FormClearButtonComponent],
  templateUrl: './form-date.component.html',
  styleUrl: '../forms.component.scss',
})
export class FormDateComponent extends FormsComponent {
  protected override readonly type = 'date';
}
