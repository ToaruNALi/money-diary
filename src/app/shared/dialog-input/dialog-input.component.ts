import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormRecord,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as Const from 'src/app/shared/constants/constants';
import { FormCtrl, ValType } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import { DialogCommonModule } from 'src/app/shared/dialog-common.module';
import { DialogInputUsecase } from 'src/app/shared/dialog-input/dialog-input.usecase';
import { FormCheckboxComponent } from 'src/app/shared/forms/form-checkbox/form-checkbox.component';
import { FormColorComponent } from 'src/app/shared/forms/form-color/form-color.component';
import { FormDateComponent } from 'src/app/shared/forms/form-date/form-date.component';
import { FormNumberComponent } from 'src/app/shared/forms/form-number/form-number.component';
import { FormRadioComponent } from 'src/app/shared/forms/form-radio/form-radio.component';
import { FormSelectComponent } from 'src/app/shared/forms/form-select/form-select.component';
import { FormTelComponent } from 'src/app/shared/forms/form-tel/form-tel.component';
import { FormTextComponent } from 'src/app/shared/forms/form-text/form-text.component';
import { FormTextareaComponent } from 'src/app/shared/forms/form-textarea/form-textarea.component';
import { FormToggleComponent } from 'src/app/shared/forms/form-toggle/form-toggle.component';
import {
  FORM_INPUT_DEF_DATA,
  FormInputData,
  SelectOption,
} from 'src/app/shared/forms/forms.component';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';

export type DialogInput = {
  title: string;
  datas: DialogInputDatas;
  buttonOptions?: DialogInputButtonOption[];
  validatorFn?:
    | ((control: AbstractControl, datas: DialogInputDatas) => ValidationErrors)
    | null;
  style?: Record<string, string>;
  option?: DialogInputOption;
  invalidReservedWord?: boolean;
};

export type DialogInputDatas = (DialogInputData | DialogInputData[])[];

export type DialogInputData = FormInputData &
  Required<{
    /** ID ※必須 */
    id: string;
    /** 入力値(リセット時データ) ※必須 */
    value: ValType;
  }> &
  Partial<{
    /** Setter @default null */
    setter:
      | ((
          form: FormRecord<FormCtrl>,
          input: Required<DialogInput>,
          options?: { type: SetType; option: SelectOption },
        ) => void)
      | null;
    /** Getter @default null */
    getter:
      | ((form: FormRecord<FormCtrl>, input: Required<DialogInput>) => ValType)
      | null;
    /** 必須フラグ @default false */
    required: boolean;
    /** 非活性フラグ(trueの場合Validationチェックが無効化される) @default false */
    disabled: boolean;
    /** 非表示フラグ @default false */
    hide: boolean;
    /** 結果を返却しないフラグ @default false */
    notReturn: boolean;
    /** フォームスタイル @default {} */
    formStyle: Record<string, string>;
  }>;

export type DialogInputOption = {
  sameDataOk?: boolean;
};

export type SetType = 'select' | 'clear';

export type DialogInputButtonOption = {
  id: string;
  label?: string;
  icon?: string;
  hide?: boolean;
  disabled?: boolean;
  color?: string;
  status?: string;
  clickEvent?: (
    form: FormGroup,
    input: Required<DialogInput>,
    dialogRef: MatDialogRef<DialogInputComponent, DialogOutput>,
  ) => void;
};

export const DIALOG_BUTTON = {
  DEL: 'del',
  ADD: 'add',
  CLEAR: 'clear',
  RESET: 'reset',
  OK: 'ok',
  CANCEL: 'cancel',
};
export type DialogButton = (typeof DIALOG_BUTTON)[keyof typeof DIALOG_BUTTON];

export const DIALOG_STATUS = {
  DEL: 'del',
  ADD: 'add',
  UPD: 'upd',
};
export type DialogStatus = (typeof DIALOG_STATUS)[keyof typeof DIALOG_STATUS];

export type DialogOutput = {
  datas: DialogOutputData[];
  status: string;
};
export type DialogOutputData = {
  id: string;
  value: ValType;
};

@Component({
  imports: [
    SharedCommonModule,
    DialogCommonModule,
    FormCheckboxComponent,
    FormColorComponent,
    FormDateComponent,
    FormNumberComponent,
    FormRadioComponent,
    FormSelectComponent,
    FormTextComponent,
    FormTextareaComponent,
    FormToggleComponent,
    FormTelComponent,
  ],
  templateUrl: './dialog-input.component.html',
  styleUrl: './dialog-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogInputComponent {
  protected readonly dialogRef = inject(
    MatDialogRef<DialogInputComponent, DialogOutput>,
  );
  private readonly fb = inject(FormBuilder);
  private readonly usecase = inject(DialogInputUsecase);
  private readonly dialogData: Required<DialogInputData> = {
    ...FORM_INPUT_DEF_DATA,
    id: '',
    value: '',
    setter: null,
    getter: null,
    required: false,
    disabled: false,
    hide: false,
    notReturn: false,
    formStyle: {},
  } as const;
  private readonly btnOptData: Required<DialogInputButtonOption> = {
    id: '',
    label: '',
    icon: '',
    hide: false,
    disabled: false,
    color: 'primary',
    status: '',
    clickEvent: (): void => {
      throw new Error('Function not implemented.');
    },
  } as const;

  private readonly buttonOptions = (): DialogInputButtonOption[] => [
    {
      id: DIALOG_BUTTON.DEL,
      label: 'Del',
      icon: 'delete',
      color: 'warn',
      status: DIALOG_STATUS.DEL,
      clickEvent: this.onBtnDelClick,
    },
    {
      id: DIALOG_BUTTON.ADD,
      label: 'Add',
      icon: 'add',
      status: DIALOG_STATUS.ADD,
      clickEvent: this.onBtnAddClick,
    },
    {
      id: DIALOG_BUTTON.CLEAR,
      label: 'Clear',
      icon: 'clear_all',
      clickEvent: this.onBtnAllClearClick,
    },
    {
      id: DIALOG_BUTTON.RESET,
      label: 'Reset',
      icon: 'restart_alt',
      clickEvent: this.onBtnResetClick,
    },
    {
      id: DIALOG_BUTTON.OK,
      label: 'OK',
      icon: 'check',
      status: DIALOG_STATUS.UPD,
      clickEvent: this.onBtnOKClick,
    },
    {
      id: DIALOG_BUTTON.CANCEL,
      label: 'Cancel',
      icon: 'close',
      color: '',
      clickEvent: () => this.dialogRef.close(),
    },
  ];

  protected inputData: Required<DialogInput>;
  protected readonly form = this.fb.record<FormCtrl>({});

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private readonly data: DialogInput,
  ) {
    const btnOptCustom = (this.data.buttonOptions ?? []).map((opt) => ({
      ...this.btnOptData,
      ...(this.buttonOptions()?.find((opt2) => opt2.id === opt.id) ?? {}),
      ...opt,
    }));
    const btnOptCustomIds = btnOptCustom.map((opt) => opt.id);
    const btnOptNotCustom = this.buttonOptions()
      .filter((opt) => !btnOptCustomIds.includes(opt.id))
      .map((opt) => ({
        ...this.btnOptData,
        ...opt,
      }));

    this.inputData = {
      title: this.data.title,
      datas: this.data.datas.map((data) =>
        Array.isArray(data)
          ? data.map((child) => ({
              ...this.dialogData,
              ...child,
            }))
          : {
              ...this.dialogData,
              ...data,
            },
      ),
      buttonOptions: [...btnOptCustom, ...btnOptNotCustom],
      validatorFn: this.data.validatorFn ?? null,
      style: this.data.style ?? {},
      option: {
        sameDataOk: this.data.option?.sameDataOk ?? false,
      },
      invalidReservedWord: this.data.invalidReservedWord ?? false,
    };
  }

  ngOnInit(): void {
    const setFormData = (data: DialogInputData) => {
      // Control 追加
      this.form.addControl(
        data.id,
        this.usecase.cvtValueToFormCtrl(data.value, data.type, data.options),
      );

      if (data.required) {
        // 必須
        if (data.type === Const.INPUT_TYPE.CHECK) {
          this.form
            .get(data.id)
            ?.addValidators(this.usecase.validatorFnCheckbox);
        } else {
          this.form.get(data.id)?.addValidators(Validators.required);
        }
      }

      if (!!data.min) {
        // 最小値
        this.form.get(data.id)?.addValidators(Validators.min(data.min));
      }

      if (!!data.max) {
        // 最大値
        this.form.get(data.id)?.addValidators(Validators.max(data.max));
      }

      if (data.disabled) {
        // 非活性
        this.form.get(data.id)?.disable();
      }
    };

    const setValue = (data: DialogInputData) => {
      // setter
      this.setValueSetter(data, this.inputData);
      // getter
      this.setValueGetter(data, this.inputData);
    };

    // formGroupの作成
    for (const data of this.inputData.datas) {
      if (Array.isArray(data)) {
        for (const child of data) {
          setFormData(child);
        }
      } else {
        setFormData(data);
      }
    }

    // Setter/Getterの作成
    for (const data of this.inputData.datas) {
      if (Array.isArray(data)) {
        for (const child of data) {
          setValue(child);
        }
      } else {
        setValue(data);
      }
    }
    // バリデーション
    this.form.addValidators(this.usecase.validatorFn(this.inputData));
  }

  /**
   * ValueSetterを設定する
   * @param data
   * @param input
   */
  private readonly setValueSetter = (
    data: DialogInputData,
    input: Required<DialogInput>,
  ): void => {
    const setter = data.setter;
    if (data.type === Const.INPUT_TYPE.DATE || !!setter) {
      const callSetter = () => {
        if (!!setter) {
          // 初期値設定
          setter(this.form as FormRecord<FormCtrl>, input);
        }
      };

      callSetter();

      // 値変更時にSetterを呼び出す
      this.form.get(data.id)?.valueChanges.subscribe((value) => {
        if (data.type === Const.INPUT_TYPE.DATE) {
          // 日付の場合、文字列に変換
          if (!!value && typeof value !== 'string') {
            this.form
              .get(data.id)
              ?.setValue(Util.getDate(new Date(value)), { emitEvent: false });
          }
        }
        callSetter();
      });
    }
  };

  /**
   * ValueGetterを設定する
   * @param data
   * @param input
   */
  private readonly setValueGetter = (
    data: DialogInputData,
    input: Required<DialogInput>,
  ): void => {
    const getter = data.getter;
    if (!!getter) {
      // 初期値設定
      this.form
        .get(data.id)
        ?.setValue(
          data.value ?? getter(this.form as FormRecord<FormCtrl>, input),
          {
            emitEvent: false,
          },
        );

      // 全値変更時にGetterを呼び出す
      this.form.valueChanges.subscribe(() => {
        this.form
          .get(data.id)
          ?.setValue(getter(this.form as FormRecord<FormCtrl>, input), {
            emitEvent: false,
          });
      });
    }
  };

  /**
   * 入力時イベント
   * @param type
   * @param data
   * @param option
   */
  protected readonly onInput = (
    type: SetType,
    data: DialogInputData,
    option: SelectOption,
  ): void => {
    const setter = data.setter;
    if (!!setter) {
      setter(this.form as FormRecord<FormCtrl>, this.inputData, {
        type,
        option,
      });
    }
  };

  /**
   * Deleteボタン押下時
   */
  protected readonly onBtnDelClick = (): void => {
    this.onBtnAllClearClick();
    const value: DialogOutput = {
      datas: this.usecase.createOutputDatas(this.form, this.inputData),
      status:
        this.inputData.buttonOptions.find((opt) => opt.id === DIALOG_BUTTON.DEL)
          ?.status ?? DIALOG_STATUS.DEL,
    };
    this.dialogRef.close(value);
  };

  /**
   * Addボタン押下時
   */
  protected readonly onBtnAddClick = (): void => {
    const value: DialogOutput = {
      datas: this.usecase.createOutputDatas(this.form, this.inputData),
      status:
        this.inputData.buttonOptions.find((opt) => opt.id === DIALOG_BUTTON.ADD)
          ?.status ?? DIALOG_STATUS.ADD,
    };
    this.dialogRef.close(value);
  };

  /**
   * Clearボタン押下時
   */
  protected readonly onBtnAllClearClick = (): void => {
    const value: Record<string, ValType | Record<string, ValType>> = {};
    const setValue = (data: DialogInputData) => {
      if (this.form.get(data.id)?.disabled || data.readonly) {
        // 非活性 または 読取専用の場合、初期値を設定しない
        return;
      }

      value[data.id] = this.usecase.cvtValueToFormValue(
        data.initValue === undefined
          ? Const.INPUT_FORM[data.type!].initVal
          : data.initValue,
        data.type,
        data.options,
      );
    };

    for (const data of this.inputData.datas) {
      if (Array.isArray(data)) {
        for (const child of data) {
          setValue(child);
        }
      } else {
        setValue(data);
      }
    }
    this.form.patchValue(value);
  };

  /**
   * Resetボタン押下時
   */
  protected readonly onBtnResetClick = (): void => {
    const value: Record<string, ValType | Record<string, ValType>> = {};
    const setValue = (data: DialogInputData) => {
      if (this.form.get(data.id)?.disabled || data.readonly) {
        // 非活性 または 読取専用の場合、初期値を設定しない
        return;
      }

      value[data.id] = this.usecase.cvtValueToFormValue(
        data.value,
        data.type,
        data.options,
      );
    };

    for (const data of this.inputData.datas) {
      if (Array.isArray(data)) {
        for (const child of data) {
          setValue(child);
        }
      } else {
        setValue(data);
      }
    }
    this.form.patchValue(value);
  };

  /**
   * OKボタン押下時
   */
  protected readonly onBtnOKClick = (): void => {
    const value: DialogOutput = {
      datas: this.usecase.createOutputDatas(this.form, this.inputData),
      status:
        this.inputData.buttonOptions.find((opt) => opt.id === DIALOG_BUTTON.OK)
          ?.status ?? DIALOG_STATUS.UPD,
    };
    this.dialogRef.close(value);
  };

  protected readonly isArray = (data: any) => Array.isArray(data);
}
