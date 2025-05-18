import { ChangeDetectionStrategy, Component } from '@angular/core';
import * as Const from 'src/app/shared/constants/constants';
import { DialogInputData } from 'src/app/shared/dialog-input/dialog-input.component';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormClearButtonComponent } from 'src/app/shared/forms/form-clear-button/form-clear-button.component';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type FormColor = Pick<
  DialogInputData,
  'id' | 'label' | 'type' | 'readonly' | 'placeholder' | 'style'
>;

@Component({
  selector: 'app-form-color',
  imports: [SharedCommonModule, FormsCommonModule, FormClearButtonComponent],
  templateUrl: './form-color.component.html',
  styleUrl: '../forms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormColorComponent extends FormsComponent<FormColor> {
  protected override readonly defData: Required<FormColor> = {
    id: '',
    label: '',
    type: Const.INPUT_TYPE.COLOR,
    readonly: false,
    placeholder: '',
    style: {},
  };
}
