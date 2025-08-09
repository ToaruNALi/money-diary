import { ChangeDetectionStrategy, Component } from '@angular/core';
import * as Const from 'src/app/shared/constants/constants';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-form-select',
  imports: [SharedCommonModule, FormsCommonModule],
  templateUrl: './form-select.component.html',
  styleUrl: '../forms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSelectComponent extends FormsComponent {
  protected override readonly type = Const.INPUT_TYPE.SELECT;
}
