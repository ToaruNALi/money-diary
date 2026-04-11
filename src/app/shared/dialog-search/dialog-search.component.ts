import { Component, inject, Inject, output, Signal } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogCommonModule } from 'src/app/shared/dialog-common.module';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import {
  FormInputItem,
  SelectOption,
} from 'src/app/shared/signal-form/signal-form.component';

export type DialogSearchInput = {
  val: string;
  searchInf: Signal<{ rowIdx: number; cnt: number; max: number }>;
  opts: SelectOption[];
};

@Component({
  imports: [SharedCommonModule, DialogCommonModule],
  templateUrl: './dialog-search.component.html',
  styleUrl: './dialog-search.component.scss',
})
export class DialogSearchComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly dialogRef = inject(MatDialogRef<DialogSearchComponent>);
  readonly emitter = output<string>();
  readonly clickEmitter = output<boolean>();

  protected readonly txtData: FormInputItem = {
    options: this.data.opts,
  };
  protected readonly txtForm: AbstractControl = this.fb.control(this.data.val);
  protected readonly searchInf = this.data.searchInf;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private readonly data: DialogSearchInput,
  ) {}

  // TODO: Form -> SignalForm用の入力フォームに切り替える
  ngOnInit() {
    this.txtForm.valueChanges.subscribe((res) => this.emitter.emit(res ?? ''));
  }

  protected readonly onClick = (dir: boolean): void => {
    this.clickEmitter.emit(dir);
  };
}
