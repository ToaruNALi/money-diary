import {
  Component,
  computed,
  effect,
  inject,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import {
  FieldTree,
  form,
  SchemaPathTree,
  validate,
  ValidationError,
} from '@angular/forms/signals';
import { ThemePalette } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogCommonModule } from 'src/app/shared/dialog-common.module';
import { SharedCommonModule } from 'src/app/shared/shared-common.module';
import {
  createDefItem,
  FORM_INPUT_ITEM_DEF,
  FormEvent,
  FormInputItem,
  FormValType,
  SignalFormComponent,
} from 'src/app/shared/signal-form/signal-form.component';
import { equalObj } from 'src/app/shared/utils/util-general';
import { environment } from 'src/environments/environment';

/** 入力パラメータ */
export type DialogCustomInputData = WritableSignal<Record<string, FormValType>>;
export type DialogCustomInput = {
  /** データ */
  data: DialogCustomInputData;
  /** パラメータ */
  param: DialogCustomInputParam;
};

/** 入力パラメータ2 */
export type DialogCustomInputParam = {
  /** ヘッダパラメータ */
  header?: DialogCustomInputHeaderParam;
  /** ボディパラメータ */
  body: DialogCustomInputBodyParam;
  /** フッタパラメータ */
  footer?: DialogCustomInputFooterParam;
};

/** ヘッダパラメータ */
export type DialogCustomInputHeaderParam = {
  /** タイトル */
  title: string;
  /** サブタイトル */
  subTitle?: string;
};

/** ボディパラメータ */
export type InputItems = (InputItem | InputItem[])[];
export type DialogCustomInputBodyParam = {
  /** 表示項目 */
  items: InputItems;
  /** カスタムスキーマ */
  schema?: BodyParamSchema;
};
/** カスタムスキーマ */
export type BodyParamSchema = (
  tree: SchemaPathTree<Record<string, FormValType>>,
) => void;
/** 表示項目 */
export type InputItem = FormInputItem & {
  /** ID */
  id: string;
  /** Setter @default undefined */
  setter?: InputItemSetter;
  /** フォームスタイル @default {} */
  formStyle?: Record<string, string>;
  /** 結果を返却しない @default false */
  notReturn?: boolean;
};
/** Setterタイプ */
export type InputItemSetter = (data: {
  /** イベント */
  event: FormEvent;
  /** フォームデータ */
  form: FieldTree<Record<string, FormValType>>;
}) => void;
/** 入力項目 デフォルト値 */
const DIALOG_INPUT_ITEM_DEF = {
  ...FORM_INPUT_ITEM_DEF,
  id: '',
  setter: undefined as any,
  formStyle: {},
  notReturn: false,
} as const satisfies Required<InputItem>;

/** フッタパラメータ */
export type DialogCustomInputFooterParam = {
  /** ボタン */
  buttons: DialogButton;
  /** 未変更許容フラグ */
  allowUnchanged?: boolean;
};
/** ボタン */
export type DialogButton = Record<string, DialogButtonParam>;
/** ボタンパラメータ */
export type DialogButtonParam = {
  /** ラベル */
  label?: string;
  /** アイコン */
  icon?: string;
  /** 非表示フラグ */
  hide?: boolean;
  /** 非活性フラグ */
  disabled?: boolean | (() => boolean);
  /** カラー */
  color?: ThemePalette;
  /** ステータス */
  status?: string;
  /** 順序 */
  order?: number;
  /** イベントハンドラー */
  handleClick?: (...param: Parameters<BtnClickEventParam>) => void;
};
/** ボタンID */
export const DIALOG_BUTTON_ID = {
  DEL: 'del',
  ADD: 'add',
  CLEAR: 'clear',
  RESET: 'reset',
  OK: 'ok',
  CANCEL: 'cancel',
};
/** ボタンID */
export type DialogButtonId =
  (typeof DIALOG_BUTTON_ID)[keyof typeof DIALOG_BUTTON_ID];
/** ステータス */
export const DIALOG_OUTPUT_STATUS = {
  DEL: 'del',
  ADD: 'add',
  UPD: 'upd',
};
/** ステータス */
export type DialogOutputStatus =
  (typeof DIALOG_OUTPUT_STATUS)[keyof typeof DIALOG_OUTPUT_STATUS];
/** イベントハンドラーパラメータタイプ */
type BtnClickEventParam = (
  inputParam: Signal<Required<DialogCustomInputParam>>,
  dialogRef: MatDialogRef<DialogCustomInputComponent, DialogCustomOutput>,
) => void;
/** ボタンパラメータ デフォルト値 */
const DIALOG_BUTTON_PARAM_DEF = {
  label: '',
  icon: '',
  hide: false,
  disabled: false,
  color: 'primary',
  status: '',
  order: 0,
  handleClick: (): void => {
    throw new Error('Function not implemented.');
  },
} as const satisfies Required<DialogButtonParam>;

/** 出力パラメータ */
export type DialogCustomOutput = {
  status: string;
};

@Component({
  imports: [SharedCommonModule, DialogCommonModule, SignalFormComponent],
  templateUrl: './dialog-custom-input.component.html',
  styleUrl: './dialog-custom-input.component.scss',
})
export class DialogCustomInputComponent {
  protected readonly input = signal(inject<DialogCustomInput>(MAT_DIALOG_DATA));
  protected readonly dialogRef = inject(MatDialogRef);
  protected readonly inputData: FieldTree<Record<string, FormValType>>;
  protected readonly formEvent: Record<string, WritableSignal<FormEvent>> = {};
  private resetVal: Record<string, FormValType> = {};

  constructor() {
    // 入力データ不足項目追加
    this.initAddIncompData();
    // 入力データ
    this.inputData = this.initInputData();
    // 他データ
    this.initOtherData();
    // ログ出力
    this.outputLog();
  }

  readonly outputLog = () => {
    if (!!environment.logValid) {
      effect(() =>
        ((values) => {
          console.log('data: ');
          for (const [key, val] of Object.entries(values)) {
            if (!!val && typeof val === 'object') {
              console.log('　' + key + ': ');
              for (const [key2, val2] of Object.entries(val)) {
                console.log('　　' + key2 + ': ' + val2);
              }
            } else {
              console.log('　' + key + ': ' + val);
            }
          }
        })(this.inputData().value()),
      );
    }
  };

  /** フラット表示項目 */
  private readonly flatItems = computed(() =>
    this.inputParam().body.items.flat(),
  );

  /** 表示項目IDリスト */
  private readonly itemIds = computed(() =>
    this.flatItems().map((item) => item.id),
  );

  /**
   * 入力データ不足項目追加
   */
  private readonly initAddIncompData = () => {
    const addData = this.itemIds().reduce(
      (dt, id) => {
        if (!(id in this.input().data())) {
          const item = this.flatItems().find((item) => item.id === id);
          if (!!item) {
            dt[id] = item.defVal ?? null;
          }
        }
        return dt;
      },
      {} as Record<string, FormValType>,
    );
    this.input().data.update((data) => ({ ...data, ...addData }));
  };

  /**
   * 入力データ設定処理
   * @returns 入力データ
   */
  private readonly initInputData = (): FieldTree<
    Record<string, FormValType>
  > => {
    // INFO: formをダイアログ呼出元やcomputed内で宣言するとエラーになるため、constructorで宣言する
    return form(this.input().data, (tree) => {
      // カスタムスキーマ
      this.input().param.body?.schema?.(tree);

      validate(tree, ({ fieldTree, value }) => {
        const errKinds: ValidationError[] = [];

        // 入力誤りの項目が1つ以上ある場合、OK・ADDボタンを非活性化
        if (this.itemIds().some((id) => fieldTree[id]().invalid())) {
          errKinds.push(
            { kind: DIALOG_BUTTON_ID.OK },
            { kind: DIALOG_BUTTON_ID.ADD },
          );
        }

        const allReset = this.itemIds().every((id) =>
          equalObj(value()[id], this.resetVal[id]),
        );

        // 全入力値が未更新の場合、RESETボタンを非活性化
        if (allReset) {
          errKinds.push({ kind: DIALOG_BUTTON_ID.RESET });
        }

        // 未変更許容フラグがなく、全入力値が未更新の場合、OKボタンを非活性化
        if (!this.inputParam().footer.allowUnchanged && allReset) {
          errKinds.push({ kind: DIALOG_BUTTON_ID.OK });
        }

        const allCleared = this.itemIds().every(
          (id) =>
            fieldTree[id]().disabled() ||
            equalObj(
              value()[id] ?? '',
              this.flatItems().find((item) => item.id === id)?.defVal ?? '',
            ),
        );

        // 全入力値がデフォルト値の場合、CLEARボタンを非活性化
        if (allCleared) {
          errKinds.push({ kind: DIALOG_BUTTON_ID.CLEAR });
        }

        return errKinds;
      });
    });
  };

  /**
   * 他データ設定処理
   */
  private readonly initOtherData = () => {
    const initReset: Record<string, boolean> = {};
    for (const id of this.itemIds()) {
      // リセット値初期化フラグ
      initReset[id] = false;
      // FormEvent
      this.formEvent[id] = signal({ type: 'input' });

      const item = this.flatItems().find((item) => item.id === id);

      // Setter設定
      const setter = item?.setter;
      if (!!setter) {
        effect(() =>
          ((_val) => {
            untracked(() => {
              setter({ event: this.formEvent[id](), form: this.inputData });
              this.formEvent[id].set({ type: 'input' });
              if (!initReset[id]) {
                // setterを考慮したリセット値を設定
                this.resetVal = this.inputData().value();
                // リセット初期化フラグを立てる
                initReset[id] = true;
              }
            });
          })(this.inputData[id]().value()),
        );
      } else {
        // リセット値を設定
        this.resetVal = this.inputData().value();
        // リセット初期化フラグを立てる
        initReset[id] = true;
      }
    }
  };

  /** 入力パラメータ */
  protected readonly inputParam = computed<Required<DialogCustomInputParam>>(
    () => {
      const inParam = this.input().param;
      const param = {
        header: {
          title: '',
          subTitle: '',
          ...inParam.header,
        } satisfies Required<DialogCustomInputHeaderParam>,
        body: {
          schema: () => {},
          ...inParam.body,
          items: (inParam.body?.items ?? []).map((item) =>
            Array.isArray(item)
              ? item.map((item) => ({
                  ...DIALOG_INPUT_ITEM_DEF,
                  ...createDefItem(item),
                }))
              : { ...DIALOG_INPUT_ITEM_DEF, ...createDefItem(item) },
          ),
        } satisfies Required<DialogCustomInputBodyParam>,
        footer: {
          buttons: (() => {
            const customBtns = inParam.footer?.buttons ?? {};
            const defbtnIds = Object.values(DIALOG_BUTTON_ID);
            const retBtns = {
              [DIALOG_BUTTON_ID.DEL]: {
                ...DIALOG_BUTTON_PARAM_DEF,
                label: 'Delete',
                icon: 'delete',
                color: 'warn',
                status: DIALOG_OUTPUT_STATUS.DEL,
                order: 0,
                handleClick: this.closeDialog(DIALOG_BUTTON_ID.DEL),
                ...customBtns?.[DIALOG_BUTTON_ID.DEL],
              },
              [DIALOG_BUTTON_ID.ADD]: {
                ...DIALOG_BUTTON_PARAM_DEF,
                label: 'Add',
                icon: 'add',
                status: DIALOG_OUTPUT_STATUS.ADD,
                order: 1,
                handleClick: this.closeDialog(DIALOG_BUTTON_ID.ADD),
                ...customBtns?.[DIALOG_BUTTON_ID.ADD],
              },
              [DIALOG_BUTTON_ID.CLEAR]: {
                ...DIALOG_BUTTON_PARAM_DEF,
                label: 'Clear',
                icon: 'clear_all',
                order: 2,
                handleClick: this.btnClickEventForAllData(
                  (_, item) => item.defVal,
                ),
                ...customBtns?.[DIALOG_BUTTON_ID.CLEAR],
              },
              [DIALOG_BUTTON_ID.RESET]: {
                ...DIALOG_BUTTON_PARAM_DEF,
                label: 'Reset',
                icon: 'restart_alt',
                order: 3,
                handleClick: this.btnClickEventForAllData(
                  (_, item) => this.resetVal[item.id],
                ),
                ...customBtns?.[DIALOG_BUTTON_ID.RESET],
              },
              [DIALOG_BUTTON_ID.OK]: {
                ...DIALOG_BUTTON_PARAM_DEF,
                label: 'OK',
                icon: 'check',
                status: DIALOG_OUTPUT_STATUS.UPD,
                order: 4,
                handleClick: this.closeDialog(DIALOG_BUTTON_ID.OK),
                ...customBtns?.[DIALOG_BUTTON_ID.OK],
              },
              [DIALOG_BUTTON_ID.CANCEL]: {
                ...DIALOG_BUTTON_PARAM_DEF,
                label: 'Cancel',
                icon: 'close',
                color: undefined,
                order: 5,
                handleClick: () => this.dialogRef.close(),
                ...customBtns?.[DIALOG_BUTTON_ID.CANCEL],
              },
            } as Record<string, Required<DialogButtonParam>>;

            for (const [id, param] of Object.entries(customBtns)) {
              if (defbtnIds.includes(id)) {
                continue;
              }

              // 現時点の最大順序を求める
              const maxOrder = Object.values(retBtns).reduce(
                (maxOdr, { order }) => (order > maxOdr ? order : maxOdr),
                -1,
              );

              retBtns[id] = {
                ...DIALOG_BUTTON_PARAM_DEF,
                order: maxOrder,
                ...param,
              };
            }

            return { ...retBtns };
          })(),
          allowUnchanged: inParam.footer?.allowUnchanged ?? false,
        } satisfies Required<DialogCustomInputFooterParam>,
      };
      return param;
    },
  );

  /** 表示項目 */
  protected readonly dispItems = computed(() => {
    return this.inputParam().body.items.map((item) =>
      Array.isArray(item) ? item : [item],
    ) as Required<InputItem>[][];
  });

  /** ソート後ボタンリスト */
  private readonly sortedButtons = computed(() =>
    Object.entries(this.inputParam().footer.buttons)
      .map(([id, val]) => ({
        id,
        ...val,
      }))
      .toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  );

  /** 表示ボタンリスト */
  protected readonly dispButtons = computed(() => {
    const data = this.inputData;
    return this.sortedButtons().map((btn) => ({
      ...btn,
      disabled: btn.disabled || this.hasError(btn.id, data),
    }));
  });

  /**
   * エラーチェック
   * @param btnId
   * @param inputDataTree
   * @returns エラー有無
   */
  private readonly hasError = (
    btnId: string,
    inputDataTree: FieldTree<Record<string, FormValType>>,
  ): boolean =>
    inputDataTree()
      .errorSummary()
      .some(({ kind }) => kind === btnId);

  /**
   * ダイアログクローズ処理
   * @param btnId
   * @returns
   */
  private readonly closeDialog =
    (btnId: string): BtnClickEventParam =>
    (inputParam, dialogRef) => {
      dialogRef.close({
        status: inputParam().footer.buttons[btnId].status ?? '',
      });
    };

  /**
   * ボタンクリックイベント(全データ反映用)
   * @param procFn
   * @returns
   */
  private readonly btnClickEventForAllData =
    (
      procFn: (val: FormValType, item: Required<InputItem>) => FormValType,
    ): BtnClickEventParam =>
    (inputParam) => {
      for (const item of inputParam().body.items.flat() as Required<InputItem>[]) {
        const data = this.inputData[item.id]();
        if (data.disabled() || data.readonly()) {
          continue;
        }
        data.value.update((val) => procFn(val, item));
      }
    };
}
