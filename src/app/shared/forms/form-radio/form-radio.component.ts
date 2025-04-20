import { ChangeDetectionStrategy, Component } from '@angular/core';
import * as Const from 'src/app/shared/constants/constants';
import { DialogInputData } from 'src/app/shared/dialog-input/dialog-input.component';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type FormRadio = Pick<
  DialogInputData,
  'id' | 'label' | 'type' | 'options' | 'style'
>;

@Component({
    selector: 'app-form-radio',
    imports: [SharedCommonModule, FormsCommonModule],
    templateUrl: './form-radio.component.html',
    styleUrl: '../forms.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormRadioComponent extends FormsComponent<FormRadio> {
  protected override readonly defData: Required<FormRadio> = {
    id: '',
    label: '',
    type: Const.INPUT_TYPE.RADIO,
    options: [],
    style: {},
  };
}
