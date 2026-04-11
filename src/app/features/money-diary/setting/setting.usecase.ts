import { Injectable, signal } from '@angular/core';
import {
  disabled,
  required,
  validate,
  ValidationError,
} from '@angular/forms/signals';
import { Row } from 'src/app/domain/row-data';
import {
  DialogCustomInputExt,
  MoneyDiaryBaseUsecase,
  OpenDialogProcInput,
} from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import {
  BodyParamSchema,
  DIALOG_BUTTON_ID,
  DialogButton,
  DialogCustomInputData,
  InputItems,
} from 'src/app/shared/dialog-custom-input/dialog-custom-input.component';
import {
  FormValType,
  NO_SELECT_VAL,
} from 'src/app/shared/signal-form/signal-form.component';
import {
  CMN_COL,
  getColValsByTblAndCustomId,
  TBL,
} from 'src/app/shared/utils/util-row';

@Injectable()
export abstract class SettingUsecase extends MoneyDiaryBaseUsecase {
  /**
   * 行データ取得
   * @param rows
   * @param inputDatas
   * @param credit
   * @return 行データ
   */
  readonly getRows = (rows: Row[], _inputDatas: Row[], _credit: Row[]) =>
    this.getRowsCmn(rows);

  protected readonly getRowsCmn = (rows: Row[]): Row[] => {
    return structuredClone(rows).filter(
      (data) => data[CMN_COL.ID] !== NO_SELECT_VAL.ID,
    );
  };

  /**
   * ダイアログ入力データ作成
   * @param procInput
   * @return 入力データ
   */
  override readonly createDialogInputData = (
    procInput: OpenDialogProcInput,
  ): DialogCustomInputExt => {
    const { tbl, selectedRows } = procInput;
    const [selectedRow] = selectedRows;

    const defRow = getColValsByTblAndCustomId(tbl);
    // 入力データ
    const data = this.getDialogInputData(selectedRow);
    // 表示項目
    const items = this.getDialogInputItems(defRow);
    // スキーマ
    const schema = this.getDialogSchema(procInput);
    // ボタン
    const buttons = this.getDialogButtons(procInput);
    // ダイアログパラメータ
    const input: DialogCustomInputExt = {
      data,
      param: {
        header: {
          title: 'Money Diary',
        },
        body: {
          items,
          schema,
        },
        footer: {
          buttons,
        },
      },
    };
    return input;
  };

  /**
   * ダイアログ入力データ返却
   * @param row
   * @returns 入力データ
   */
  private readonly getDialogInputData = (row: Row): DialogCustomInputData => {
    return signal(
      Object.entries(row).reduce(
        (rec, [key, value]) => {
          return { ...rec, [key]: value };
        },
        {} as Record<string, FormValType>,
      ),
    );
  };

  /**
   * ダイアログ表示項目返却
   * @param defRow
   * @returns 表示項目
   */
  private readonly getDialogInputItems = (defRow: Row): InputItems => [
    {
      id: CMN_COL.LABEL,
      label: 'Label',
    },
    ...this.getDialogInputItemsCustom(defRow),
    {
      id: CMN_COL.VALID,
      label: 'Valid',
      type: 'toggle',
    },
    {
      id: CMN_COL.UPD_DATE_TIME,
      label: 'Upd Date',
    },
  ];

  /**
   * ダイアログ表示項目返却(custom)
   * @param defRow
   * @returns 表示項目
   */
  protected abstract readonly getDialogInputItemsCustom: (
    defRow: Row,
  ) => InputItems;

  /**
   * ダイアログスキーマ返却
   * @param tree
   */
  private readonly getDialogSchema = (
    procInput: OpenDialogProcInput,
  ): BodyParamSchema => {
    const { tbl, allTblRows, selectedRows } = procInput;
    const [selectedRow] = selectedRows;
    const labelList = allTblRows[tbl]
      .filter(
        (row) =>
          row[CMN_COL.ID] !== selectedRow[CMN_COL.ID] && !!row[CMN_COL.LABEL],
      )
      .map((row) => row[CMN_COL.LABEL]?.toString() ?? '');

    return (tree) => {
      required(tree[CMN_COL.LABEL]);
      disabled(tree[CMN_COL.UPD_DATE_TIME]);
      validate(tree, ({ value }) => {
        const label = value()[CMN_COL.LABEL]?.toString() ?? '';
        let errors: ValidationError[] = [];
        if (labelList.includes(label)) {
          errors = [
            ...errors,
            { kind: DIALOG_BUTTON_ID.OK },
            { kind: DIALOG_BUTTON_ID.ADD },
          ];
        }

        if (label === selectedRow[CMN_COL.LABEL]) {
          errors = [...errors, { kind: DIALOG_BUTTON_ID.ADD }];
        }
        return errors;
      });
      this.getDialogSchemaCustom?.(tree);
    };
  };

  /**
   * ダイアログスキーマ返却(custom)
   * @param tree
   * @returns ダイアログスキーマ
   */
  protected abstract readonly getDialogSchemaCustom?: BodyParamSchema;

  /**
   * ダイアログボタン設定返却
   * @param procInput
   * @returns ボタン設定
   */
  private readonly getDialogButtons = (
    procInput: OpenDialogProcInput,
  ): DialogButton => {
    const { tbl, allTblRows, selectedRows } = procInput;
    const [selectedRow] = selectedRows;

    // MoneyDiary で使用中の場合、Delボタン非活性
    return {
      [DIALOG_BUTTON_ID.DEL]: {
        disabled: allTblRows[TBL.MAIN].some(
          (row) => row[tbl] === selectedRow[CMN_COL.ID],
        ),
      },
    };
  };

  /**
   * 未選択用データがあるかどうか(行編集Emitterデータ作成)
   * @param rows
   * @returns チェック結果
   */
  protected override readonly checkNoSelData = (rows: Row[]): boolean => {
    return rows.some((row) => row[CMN_COL.ID] === NO_SELECT_VAL.ID);
  };
}
