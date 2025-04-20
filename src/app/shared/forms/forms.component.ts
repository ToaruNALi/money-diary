import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { take } from 'rxjs';
import * as Const from 'src/app/shared/constants/constants';
import { ValueType } from 'src/app/shared/constants/types';
import {
  DialogInputData,
  DialogOption,
} from 'src/app/shared/dialog-input/dialog-input.component';

export type FormOption = {
  // 予約後入力不可フラグ
  invalidReservedWord?: boolean;
};

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class FormsComponent<T extends Pick<DialogInputData, 'type'>> {
  readonly data = input.required<Partial<T>>();
  readonly form = model.required<AbstractControl | null>();
  readonly option = input<FormOption>({});
  readonly selectAutoComp = output<DialogOption>();

  protected abstract readonly defData: Required<T>;
  protected readonly reqData = computed(() => {
    const data = {
      ...this.defData,
      ...this.data(),
    };
    return {
      initValue: Const.INPUT_FORM[data.type!].INIT_VAL,
      ...data,
    };
  });
  protected readonly control = computed(
    () => this.form() as FormControl<ValueType>,
  );

  /**
   * クリアボタン押下時
   */
  protected readonly onClickClearBtn = (): void => {
    this.form()?.setValue(this.reqData().initValue ?? null);
  };

  /**
   * オートコンプリート項目選択時
   * @param event
   */
  protected readonly onSelectAutoComp = async (
    event: MatAutocompleteSelectedEvent,
  ): Promise<void> => {
    const data = this.reqData() as Pick<DialogInputData, 'filteredOptions$'>;

    if (!data.filteredOptions$) {
      return;
    }

    data.filteredOptions$.pipe(take(1)).subscribe((res) => {
      const opt = res.find((opt) => opt.label === event.option.viewValue);
      if (!opt) {
        return;
      }

      this.selectAutoComp.emit(opt);
    });
  };
}
