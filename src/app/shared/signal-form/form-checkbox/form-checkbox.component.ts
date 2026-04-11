import { Component } from '@angular/core';
import { Field, MaybeFieldTree } from '@angular/forms/signals';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { FormBaseComponent } from 'src/app/shared/signal-form/form-base/form-base.component';

@Component({
  selector: 'app-form-checkbox',
  imports: [SharedCommonModule, FormsCommonModule, Field],
  templateUrl: './form-checkbox.component.html',
  styleUrl: '../form-base/form-base.component.scss',
})
export class FormCheckboxComponent extends FormBaseComponent {
  field = (optVal: string | number) =>
    (this.data() as MaybeFieldTree<Record<string | number, boolean>>)[optVal];
}
