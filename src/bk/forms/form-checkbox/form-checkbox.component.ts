import { Component, computed } from '@angular/core';
import { FormControl, FormRecord } from '@angular/forms';
import { ValType } from 'src/app/shared/constants/types';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-form-checkbox',
  imports: [SharedCommonModule, FormsCommonModule],
  templateUrl: './form-checkbox.component.html',
  styleUrl: '../forms.component.scss',
})
export class FormCheckboxComponent extends FormsComponent {
  protected override readonly type = 'check';

  protected readonly group = computed(
    () => this.form() as FormRecord<FormControl<ValType>>,
  );
}
