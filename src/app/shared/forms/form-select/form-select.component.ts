import { ChangeDetectionStrategy, Component } from '@angular/core';
import * as Const from 'src/app/shared/constants/constants';
import { DialogInputData } from 'src/app/shared/dialog-input/dialog-input.component';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type FormSelect = Pick<
  DialogInputData,
  'id' | 'label' | 'type' | 'options' | 'style'
>;

@Component({
    selector: 'app-form-select',
    imports: [SharedCommonModule, FormsCommonModule],
    templateUrl: './form-select.component.html',
    styleUrl: '../forms.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSelectComponent extends FormsComponent<FormSelect> {
  protected override readonly defData: Required<FormSelect> = {
    id: '',
    label: '',
    type: Const.INPUT_TYPE.SELECT,
    options: [],
    style: {},
  };
}
