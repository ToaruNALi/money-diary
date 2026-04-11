import { Component, computed, input, model } from '@angular/core';
import { MaybeFieldTree } from '@angular/forms/signals';
import { FormCheckboxComponent } from 'src/app/shared/signal-form/form-checkbox/form-checkbox.component';
import { FormDateComponent } from 'src/app/shared/signal-form/form-date/form-date.component';
import { FormRadioComponent } from 'src/app/shared/signal-form/form-radio/form-radio.component';
import { FormSelectComponent } from 'src/app/shared/signal-form/form-select/form-select.component';
import { FormTextareaComponent } from 'src/app/shared/signal-form/form-textarea/form-textarea.component';
import { FormToggleComponent } from 'src/app/shared/signal-form/form-toggle/form-toggle.component';
import { InputRestrictions } from 'src/app/shared/signal-form/signal-form-value.derective';
import { FormTextComponent } from './form-text/form-text.component';

/** FormComponent 入力タイプ */
export type FormInputItem = {
  /** ラベル @default '' */
  label?: string;
  /** デフォルト値(クリア時データ) @default '' */
  defVal?: FormValType;
  /** プレースホルダー @default '' */
  placeholder?: string;
  /** 入力タイプ @default 'text' */
  type?: InputType;
  /** プルダウンリスト @default [] */
  options?: SelectOption[];
  /** 入力禁止文字 @default [] */
  forbiddenChars?: InputRestrictions[];
  /** 予約後禁止フラグ @default false */
  invalidReservedWord?: boolean;
  /** コンポーネント内スタイル @default {} */
  style?: Record<string, string>;
};
/** 汎用値タイプ */
export type ValType = string | number | boolean | null | ValType[];
/** フォーム値タイプ */
export type FormValType = ValType | Record<string | number, boolean>;
/** 入力タイプ */
export type InputType =
  | 'text'
  | 'number'
  | 'date'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'toggle'
  | 'tel'
  | 'label';
/** セレクトボックス入力タイプ */
export type SelectOption = {
  /** 値 */
  value: string | number;
  /** ラベル */
  label: string;
  /** autocompleteの場合、ユニークなIDを設定する */
  id?: string;
};
/** FormComponent 入力データデフォルト値 */
export const FORM_INPUT_ITEM_DEF = {
  label: '',
  defVal: '',
  placeholder: '',
  type: 'text',
  options: [],
  forbiddenChars: [],
  invalidReservedWord: false,
  style: {},
} as const satisfies Required<FormInputItem>;

export const NO_SELECT_VAL = {
  ID: '0',
  LABEL: '-',
} as const;

/** 入力フォーム */
export const FORM_DEF_VAL = {
  text: '',
  number: Number.NaN,
  date: null,
  textarea: '',
  checkbox: {},
  radio: '',
  select: NO_SELECT_VAL.ID,
  toggle: false,
  tel: '',
  label: '',
} as const satisfies Record<InputType, FormValType>;

export type FormEvent =
  | {
      type: 'input';
    }
  | { type: 'autocomp'; option: SelectOption };
/** Form Event Type */
export type FormEventType = 'input' | 'autocomp';

/**
 * 入力項目デフォルト値作成
 * @param item
 * @returns
 */
export const createDefItem = (item: FormInputItem): Required<FormInputItem> => {
  const type = item.type ?? 'text';
  let defVal: FormValType = FORM_DEF_VAL[type];
  if (type === 'checkbox') {
    defVal = (item.options ?? []).reduce((val, opt) => {
      if (!!val && typeof val === 'object') {
        val[opt.value] = false;
      }
      return val;
    }, defVal);
  }
  return {
    ...FORM_INPUT_ITEM_DEF,
    type,
    defVal,
    ...item,
  };
};

@Component({
  selector: 'signal-form',
  templateUrl: './signal-form.component.html',
  imports: [
    FormTextComponent,
    FormDateComponent,
    FormTextareaComponent,
    FormSelectComponent,
    FormToggleComponent,
    FormRadioComponent,
    FormCheckboxComponent,
  ],
})
export class SignalFormComponent {
  readonly data = input.required<MaybeFieldTree<FormValType>>();
  readonly item = input.required<FormInputItem>();
  readonly formEvent = model<FormEvent>();

  /**
   * 表示項目
   */
  protected readonly dispItem = computed<Required<FormInputItem>>(() => {
    return createDefItem(this.item());
  });
}
