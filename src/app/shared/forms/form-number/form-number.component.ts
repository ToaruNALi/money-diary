import { ChangeDetectionStrategy, Component } from '@angular/core';
import { of } from 'rxjs';
import * as Const from 'src/app/shared/constants/constants';
import { DialogInputData } from 'src/app/shared/dialog-input/dialog-input.component';
import { InputRestrictionsDirective } from 'src/app/shared/directives/input-restrictions.derective';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormClearButtonComponent } from 'src/app/shared/forms/form-clear-button/form-clear-button.component';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type FormNumber = Pick<
  DialogInputData,
  | 'id'
  | 'label'
  | 'type'
  | 'readonly'
  | 'placeholder'
  | 'min'
  | 'max'
  | 'forbiddenChars'
  | 'filteredOptions$'
  | 'style'
>;

@Component({
    selector: 'app-form-number',
    imports: [
        SharedCommonModule,
        FormsCommonModule,
        FormClearButtonComponent,
        InputRestrictionsDirective,
    ],
    templateUrl: './form-number.component.html',
    styleUrl: '../forms.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormNumberComponent extends FormsComponent<FormNumber> {
  protected override readonly defData: Required<FormNumber> = {
    id: '',
    label: '',
    type: Const.INPUT_TYPE.NUM,
    readonly: false,
    placeholder: '',
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    forbiddenChars: [],
    filteredOptions$: of([]),
    style: {},
  };
}
