import { Component } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { FormsCommonModule } from 'src/app/shared/forms-common.module';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import { FormBaseComponent } from 'src/app/shared/signal-form/form-base/form-base.component';

@Component({
  selector: 'app-form-select',
  imports: [SharedCommonModule, FormsCommonModule, Field],
  templateUrl: './form-select.component.html',
  styleUrl: '../form-base/form-base.component.scss',
})
export class FormSelectComponent extends FormBaseComponent {}
