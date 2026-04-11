import { Component, inject, Inject, output } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogCommonModule } from 'src/app/shared/dialog-common.module';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import {
  FormInputItem,
  SelectOption,
} from 'src/app/shared/signal-form/signal-form.component';

export type DialogFilterInput = {
  val: string;
  opts: SelectOption[];
};

@Component({
  imports: [SharedCommonModule, DialogCommonModule],
  templateUrl: './dialog-filter.component.html',
  styleUrl: './dialog-filter.component.scss',
})
export class DialogFilterComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly dialogRef = inject(MatDialogRef<DialogFilterComponent>);
  readonly emitter = output<string>();

  protected readonly txtData: FormInputItem = {
    options: this.data.opts,
  };
  protected readonly txtForm: AbstractControl = this.fb.control(this.data.val);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private readonly data: DialogFilterInput,
  ) {}

  // TODO: Form -> SignalForm用の入力フォームに切り替える
  ngOnInit() {
    this.txtForm.valueChanges.subscribe((res) => this.emitter.emit(res ?? ''));
  }
}
