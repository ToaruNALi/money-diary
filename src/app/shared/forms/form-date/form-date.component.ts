import { ChangeDetectionStrategy, Component } from '@angular/core';
import * as Const from 'src/app/shared/constants/constants';
import { DialogInputData } from 'src/app/shared/dialog-input/dialog-input.component';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormClearButtonComponent } from 'src/app/shared/forms/form-clear-button/form-clear-button.component';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type FormDate = Pick<
  DialogInputData,
  'id' | 'label' | 'type' | 'readonly' | 'placeholder' | 'style'
>;

@Component({
    selector: 'app-form-date',
    imports: [SharedCommonModule, FormsCommonModule, FormClearButtonComponent],
    templateUrl: './form-date.component.html',
    styleUrl: '../forms.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormDateComponent extends FormsComponent<FormDate> {
  protected override readonly defData: Required<FormDate> = {
    id: '',
    label: '',
    type: Const.INPUT_TYPE.DATE,
    readonly: false,
    placeholder: '',
    style: {},
  };
}
