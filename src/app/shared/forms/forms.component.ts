import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, Observable, of, startWith, take } from 'rxjs';
import * as Const from 'src/app/shared/constants/constants';
import {
  InputRestrictions,
  InputType,
  ValType,
} from 'src/app/shared/constants/types';

/** FormComponent 入力タイプ */
export type FormInputData = Partial<{
  /** ラベル @default '' */
  label: string;
  /** 入力欄初期値(クリア時データ) @default '' */
  initValue: ValType;
  /** プレースホルダー @default '' */
  placeholder: string;
  /** 入力タイプ @default Const.INPUT_TYPE.TEXT */
  type: InputType;
  /** 読取専用フラグ(trueの場合Validationチェックが無効化されない) @default false */
  readonly: boolean;
  /** オートコンプリートフラグ @default false */
  autocomp: boolean;
  /** プルダウンリスト @default [] */
  options: SelectOption[];
  /** 最小値 @default Number.MIN_SAFE_INTEGER */
  min: number;
  /** 最大値 @default Number.MAX_SAFE_INTEGER */
  max: number;
  /** 入力禁止文字 @default [] */
  forbiddenChars: InputRestrictions[];
  /** オートコンプリート用内部項目 @default of([]) */
  filteredOptions$: Observable<SelectOption[]>;
  /** コンポーネント内スタイル @default {} */
  style: Record<string, string>;
}>;

/** セレクトボックス入力タイプ */
export type SelectOption = {
  /** ID */
  id: string | number;
  /** ラベル */
  lb: string;
  /** autocompleteの場合、IDの代わりにこちらを値として使用 */
  value?: string;
};

/** FormComponent 入力オプション */
export type FormOption = {
  // 予約後入力不可フラグ
  invalidReservedWord?: boolean;
};

/** FormComponent 入力データデフォルト値 */
export const FORM_INPUT_DEF_DATA = {
  label: '',
  initValue: '',
  placeholder: '',
  type: Const.INPUT_TYPE.TEXT,
  readonly: false,
  autocomp: false,
  options: [],
  min: Number.MIN_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER,
  forbiddenChars: [],
  filteredOptions$: of([]),
  style: {},
} as const satisfies Required<FormInputData>;

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class FormsComponent {
  readonly form = input.required<AbstractControl | null>();
  readonly data = input<FormInputData>({});
  readonly option = input<FormOption>({});
  readonly selectAutoComp = output<SelectOption>();

  protected abstract readonly type: InputType;

  protected readonly reqData = linkedSignal<Required<FormInputData>>(() => ({
    ...FORM_INPUT_DEF_DATA,
    initValue: Const.INPUT_FORM[this.type].initVal,
    ...this.data(),
    type: this.type,
  }));
  protected readonly control = computed(
    () => this.form() as FormControl<ValType>,
  );

  ngOnInit() {
    if (!this.reqData().autocomp || !this.reqData().options) {
      return;
    }

    // オートコンプリート
    this.reqData.update((dt) => ({
      ...dt,
      filteredOptions$: this.control().valueChanges.pipe(
        startWith(this.control().value),
        map((value) => {
          const search = value?.toString() ?? '';
          const escapeRegExp = (str: string) =>
            str
              .replace(Const.INPUT_CHARS.AUTOCOMP_REPLACE, '\\$&')
              .replace(/\s+/g, '(.*)');
          const regExp = new RegExp(escapeRegExp(search), 'g');
          return dt.options.filter((opt) => regExp.test(opt.value!)) ?? [];
        }),
      ),
    }));
  }

  /**
   * クリアボタン押下時
   */
  protected readonly onClickClearBtn = (): void => {
    this.form()?.setValue(this.reqData().initValue);
  };

  /**
   * オートコンプリート項目選択時
   * @param event
   */
  protected readonly onSelectAutoComp = async (
    event: MatAutocompleteSelectedEvent,
  ): Promise<void> => {
    if (!this.reqData().filteredOptions$) {
      return;
    }

    this.reqData()
      .filteredOptions$.pipe(take(1))
      .subscribe((res) => {
        const opt = res.find((opt) => opt.lb === event.option.viewValue);
        if (!opt) {
          return;
        }

        this.selectAutoComp.emit(opt);
      });
  };
}
