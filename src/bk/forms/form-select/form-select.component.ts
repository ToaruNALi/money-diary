import { Component } from '@angular/core';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { FormsComponent } from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

@Component({
  selector: 'app-form-select',
  imports: [SharedCommonModule, FormsCommonModule],
  templateUrl: './form-select.component.html',
  styleUrl: '../forms.component.scss',
})
export class FormSelectComponent extends FormsComponent {
  protected override readonly type = 'select';
}
