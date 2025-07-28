import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import Fuse from 'fuse.js';
import * as Const from 'src/app/shared/constants/constants';
import { FormCtrl, InputType, ValType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DIALOG_BUTTON,
  DialogInput,
  DialogInputData,
  DialogOption,
  DialogOutputData,
} from 'src/app/shared/dialog-input/dialog-input.component';

@Injectable({
  providedIn: 'root',
})
export class DialogInputUsecase {
  private readonly fb = inject(FormBuilder);

  /**
   * オートコンプリートリストを返却する
   * @param options 検索対象リスト
   * @param value 検索文字列
   * @returns
   */
  readonly getFilterOptions = (
    options: DialogOption[],
    value: ValType,
  ): DialogOption[] => {
    if (value === null || value === '') {
      return options;
    }
    const fuseOptions = {
      keys: ['value'],
      includeScore: true,
      threshold: 0.4,
      shouldSort: true,
    };
    const fuse = new Fuse(options, fuseOptions);
    return fuse.search(value.toString()).map((fuse) => fuse.item);
  };

  /**
   * チェックボックス項目用カスタムバリデーター
   * @param control
   * @returns
   */
  readonly validatorFnCheckbox = (
    control: AbstractControl,
  ): ValidationErrors => {
    const value = control.value;
    let check = false;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      check = Object.values(value).some((chk) => !!chk);
    }
    return check ? {} : { required: true };
  };

  /**
   * カスタムバリデーター
   * @param input
   * @returns
   */
  readonly validatorFn =
    (input: Required<DialogInput>): ValidatorFn =>
    (control: AbstractControl): ValidationErrors => {
      let errors: ValidationErrors = {};
      const checkInvalid = (data: DialogInputData) =>
        !data.hide && control.get(data.id)?.invalid;

      if (
        input.datas.some((data) =>
          Array.isArray(data) ? data.some(checkInvalid) : checkInvalid(data),
        )
      ) {
        // 表示状態 かつ 入力誤り の項目が１つ以上ある場合
        errors[DIALOG_BUTTON.OK] = true;
        errors[DIALOG_BUTTON.ADD] = true;
      }

      const isSameData = (data: DialogInputData): boolean => {
        return Util.equalObject(
          data.value,
          this.cvtFormValueToValue(control.get(data.id)?.value, data.type),
        );
      };

      if (
        !input.option.sameDataOk &&
        input.datas.every((data) =>
          Array.isArray(data) ? data.every(isSameData) : isSameData(data),
        )
      ) {
        // 更新前後の全入力内容が一致している場合
        errors[DIALOG_BUTTON.RESET] = true;
        errors[DIALOG_BUTTON.OK] = true;
      }

      if (!!input.validatorFn) {
        // 画面ごとのカスタムバリデーションと結合
        errors = {
          ...errors,
          ...input.validatorFn(control, input.datas),
        };
      }

      return errors;
    };

  /**
   * 返却値を作成する
   * @param form
   * @param input
   * @returns
   */
  readonly createOutputDatas = (
    form: FormGroup,
    input: Required<DialogInput>,
  ): DialogOutputData[] => {
    const result: DialogOutputData[] = [];
    const setResult = (data: DialogInputData) => {
      if (data.notReturn) {
        // 返却対象外
        return;
      }

      let value = this.cvtFormValueToValue(form.get(data.id)?.value, data.type);
      if (typeof value === 'string') {
        // 半角カナと全角英数の禁止
        value = Util.convertToZKAndToHE(value);
      }

      result.push({ id: data.id, value });
    };

    for (const data of input.datas) {
      if (Array.isArray(data)) {
        for (const child of data) {
          setResult(child);
        }
      } else {
        setResult(data);
      }
    }

    return result;
  };

  /**
   * ダイアログオープン前の入力値をFormControl用に変換する
   * @param value
   * @param type
   * @param options
   * @returns
   */
  readonly cvtValueToFormCtrl = (
    value: ValType = null,
    type: InputType | undefined,
    options: DialogOption[] = [],
  ): FormCtrl => {
    if (type === Const.INPUT_TYPE.CHECK) {
      // Checkbox
      const record = this.fb.record<FormControl<ValType>>({});
      for (const opt of options) {
        record.addControl(
          opt.id.toString(),
          this.fb.control<ValType>(
            Array.isArray(value) && value.includes(opt.id),
          ),
        );
      }
      return record;
    }

    // Checkbox 以外
    return this.fb.control<ValType>(Array.isArray(value) ? null : value);
  };

  /**
   * 入力値をFormControl用に変換する
   * @param value
   * @param type
   * @param options
   * @returns
   */
  readonly cvtValueToFormValue = (
    value: ValType = null,
    type: InputType | undefined,
    options: DialogOption[] = [],
  ): ValType | Record<string, ValType> => {
    if (type === Const.INPUT_TYPE.CHECK) {
      // Checkbox
      const record: Record<string, ValType> = {};
      for (const opt of options) {
        record[opt.id.toString()] =
          Array.isArray(value) && value.includes(opt.id);
      }
      return record;
    }

    // Checkbox 以外
    return Array.isArray(value) ? null : value;
  };

  /**
   * FormControl用の入力値を返却用に変換する
   * @param value
   * @param type
   * @returns
   */
  readonly cvtFormValueToValue = (
    value: ValType | Record<string, ValType> = null,
    type: InputType | undefined,
  ): ValType => {
    if (type === Const.INPUT_TYPE.CHECK) {
      // Checkbox
      const ret: ValType = [];
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // null・配列以外のObjectを抽出
        const entries = Object.entries(value);
        for (const [key, check] of entries) {
          if (!!check) {
            ret.push(key);
          }
        }
      }
      return ret;
    }

    // Checkbox 以外
    if (typeof value === 'object') {
      // Objectを抽出
      return null;
    }
    return value;
  };
}
