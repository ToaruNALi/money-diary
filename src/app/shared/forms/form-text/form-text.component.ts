import { ChangeDetectionStrategy, Component } from '@angular/core';
import { of } from 'rxjs';
import * as Const from 'src/app/shared/constants/constants';
import { DialogInputData } from 'src/app/shared/dialog-input/dialog-input.component';
import { InputRestrictionsDirective } from 'src/app/shared/directives/input-restrictions.derective';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormClearButtonComponent } from 'src/app/shared/forms/form-clear-button/form-clear-button.component';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type FormText = Pick<
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
    selector: 'app-form-text',
    imports: [
        SharedCommonModule,
        FormsCommonModule,
        FormClearButtonComponent,
        InputRestrictionsDirective,
    ],
    templateUrl: './form-text.component.html',
    styleUrl: '../forms.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormTextComponent extends FormsComponent<FormText> {
  protected override readonly defData: Required<FormText> = {
    id: '',
    label: '',
    type: Const.INPUT_TYPE.TEXT,
    readonly: false,
    placeholder: '',
    forbiddenChars: [],
    filteredOptions$: of([]),
    style: {},
  };
}
