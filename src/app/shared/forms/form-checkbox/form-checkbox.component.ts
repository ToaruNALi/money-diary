import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormControl, FormRecord } from '@angular/forms';
import * as Const from 'src/app/shared/constants/constants';
import { ValueType } from 'src/app/shared/constants/types';
import { DialogInputData } from 'src/app/shared/dialog-input/dialog-input.component';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type FormCheckbox = Pick<
  DialogInputData,
  'id' | 'label' | 'type' | 'options' | 'style'
>;

@Component({
  selector: 'app-form-checkbox',
  imports: [SharedCommonModule, FormsCommonModule],
  templateUrl: './form-checkbox.component.html',
  styleUrl: '../forms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCheckboxComponent extends FormsComponent<FormCheckbox> {
  protected override readonly defData: Required<FormCheckbox> = {
    id: '',
    label: '',
    type: Const.INPUT_TYPE.CHECK,
    options: [],
    style: {},
  };

  protected readonly group = computed(
    () => this.form() as FormRecord<FormControl<ValueType>>,
  );
}
