import { Component, computed, input, model } from '@angular/core';
import { MaybeFieldTree } from '@angular/forms/signals';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {
  FormEvent,
  FormInputItem,
  FormValType,
} from 'src/app/shared/signal-form/signal-form.component';

export const createAutocompleteValue = (
  searchValue: string,
  regularExpression = true,
) => {
  return searchValue.replace(
    /[\s.*+?^${}()|[\]\\]/g,
    regularExpression ? '(.*)' : ' ',
  );
};

@Component({
  template: '',
})
export abstract class FormBaseComponent {
  readonly data = input.required<MaybeFieldTree<FormValType>>();
  readonly item = input.required<Required<FormInputItem>>();
  readonly formEvent = model<FormEvent>();

  /** 入力最小値 */
  protected readonly min = computed(() => this.data()().min?.());
  /** 入力最大値 */
  protected readonly max = computed(() => this.data()().max?.());
  /** 入力最大文字数 */
  protected readonly maxLen = computed(() => {
    return this.data()().maxLength?.() ?? 99999; //TODO: 入力最大文字数;
  });
  /** 非活性フラグ */
  protected readonly disabled = computed(() => this.data()().disabled());
  /** 読取専用フラグ */
  protected readonly readonly = computed(() => this.data()().readonly());

  /**
   * 表示オプション(オートコンプリート)
   */
  protected readonly dispOptions = computed(() => {
    const val = this.data()().value();
    const options = this.item().options;

    const searchValue = new RegExp(
      createAutocompleteValue(val?.toString().toLowerCase() ?? ''),
    );
    const filter = options.filter((opt) =>
      searchValue.test(opt.value.toString().toLowerCase()),
    );
    return filter;
  });

  /**
   * テキスト入力時(禁止文字がある入力フォームの場合、必ずこのメソッドを呼び出す)
   * @param value
   */
  protected readonly handleInput = (value: FormValType) => {
    this.data()().value.set(value);
  };

  /**
   * オートコンプリート項目選択時
   * @param event
   */
  protected readonly handleAutocomp = (event: MatAutocompleteSelectedEvent) => {
    const value = event.option.viewValue;
    const options = this.dispOptions();
    const selectOption = options.find(
      (opt) => opt.label.toString() === value?.toString(),
    );
    if (!selectOption) {
      return;
    }
    this.formEvent.set({ type: 'autocomp', option: selectOption });
  };
}
