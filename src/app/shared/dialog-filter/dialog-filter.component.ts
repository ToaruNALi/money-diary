import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  output,
} from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogCommonModule } from 'src/app/shared/dialog-common.module';
import { FormTextComponent } from 'src/app/shared/forms/form-text/form-text.component';
import {
  FormInputData,
  SelectOption,
} from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type DialogFilterInput = {
  val: string;
  opts: SelectOption[];
};

@Component({
  imports: [SharedCommonModule, DialogCommonModule, FormTextComponent],
  templateUrl: './dialog-filter.component.html',
  styleUrl: './dialog-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogFilterComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly dialogRef = inject(MatDialogRef<DialogFilterComponent>);
  readonly emitter = output<string>();

  protected readonly txtData: FormInputData = {
    autocomp: this.data.opts.length > 0,
    options: this.data.opts,
  };
  protected readonly txtForm: AbstractControl = this.fb.control(this.data.val);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private readonly data: DialogFilterInput,
  ) {}

  ngOnInit() {
    this.txtForm.valueChanges.subscribe((res) => this.emitter.emit(res ?? ''));
  }
}
