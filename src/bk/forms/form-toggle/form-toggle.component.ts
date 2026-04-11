import { Component } from '@angular/core';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-form-toggle',
  imports: [SharedCommonModule, FormsCommonModule],
  templateUrl: './form-toggle.component.html',
  styleUrl: '../forms.component.scss',
})
export class FormToggleComponent extends FormsComponent {
  protected override readonly type = INPUT_TYPE.TOGGLE;
}
