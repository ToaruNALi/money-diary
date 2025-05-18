import { ChangeDetectionStrategy, Component } from '@angular/core';
import { of } from 'rxjs';
import * as Const from 'src/app/shared/constants/constants';
import { DialogInputData } from 'src/app/shared/dialog-input/dialog-input.component';
import { InputRestrictionsDirective } from 'src/app/shared/directives/input-restrictions.derective';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormClearButtonComponent } from 'src/app/shared/forms/form-clear-button/form-clear-button.component';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type FormTextarea = Pick<
  DialogInputData,
  | 'id'
  | 'label'
  | 'type'
  | 'readonly'
  | 'placeholder'
  | 'forbiddenChars'
  | 'filteredOptions$'
  | 'style'
>;

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormTextareaComponent extends FormsComponent<FormTextarea> {
  protected override readonly defData: Required<FormTextarea> = {
    id: '',
    label: '',
    type: Const.INPUT_TYPE.TEXTAREA,
    readonly: false,
    placeholder: '',
    forbiddenChars: [],
    filteredOptions$: of([]),
    style: {},
  };
}
