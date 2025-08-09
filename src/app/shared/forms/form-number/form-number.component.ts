import { ChangeDetectionStrategy, Component } from '@angular/core';
import * as Const from 'src/app/shared/constants/constants';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormClearButtonComponent } from 'src/app/shared/forms/form-clear-button/form-clear-button.component';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-form-number',
  imports: [SharedCommonModule, FormsCommonModule, FormClearButtonComponent],
  templateUrl: './form-number.component.html',
  styleUrl: '../forms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormNumberComponent extends FormsComponent {
  protected override readonly type = Const.INPUT_TYPE.NUM;
}
