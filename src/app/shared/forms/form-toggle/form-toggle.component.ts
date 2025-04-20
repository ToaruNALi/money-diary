import { ChangeDetectionStrategy, Component } from '@angular/core';
import * as Const from 'src/app/shared/constants/constants';
import { DialogInputData } from 'src/app/shared/dialog-input/dialog-input.component';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type FormToggle = Pick<
  DialogInputData,
  'id' | 'label' | 'type' | 'style'
>;

@Component({
  selector: 'app-form-toggle',
  imports: [SharedCommonModule, FormsCommonModule],
  templateUrl: './form-toggle.component.html',
  styleUrl: '../forms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormToggleComponent extends FormsComponent<FormToggle> {
  protected override readonly defData: Required<FormToggle> = {
    id: '',
    label: '',
    type: Const.INPUT_TYPE.TOGGLE,
    style: {},
  };
}
