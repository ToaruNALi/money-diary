import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Row, TblMap } from 'src/app/domain/row-data';
import { MoneyDiaryBaseUsecase } from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import * as Const from 'src/app/shared/constants/constants';
import { Tbl } from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DIALOG_BUTTON,
  DialogInput,
  DialogInputDatas,
} from 'src/app/shared/dialog-input/dialog-input.component';
import { DialogInputButtonOption } from '../../../shared/dialog-input/dialog-input.component';

@Injectable()
export abstract class SettingUsecase extends MoneyDiaryBaseUsecase {
  /**
   * 行データ取得
   * @param rows
   * @param inputDatas
   * @param credit
   */
  readonly getRows = (rows: Row[], _inputDatas: Row[], _credit: Row[]) =>
    structuredClone(rows);

  /**
   * ダイアログ入力データ作成
   * @param edtRows
   * @param tbl
   * @param tblMap
   * @param inputColId
   * @returns 入力データ
   */
  override readonly createInputData = <MoneyDiaryColId>(
    edtRows: Row[],
    tbl: Tbl,
    tblMap: TblMap,
    inputColId: MoneyDiaryColId,
  ): DialogInput => {
    // 初期データ
    const edtRow = structuredClone(edtRows[0]);
    const tblDefRow = Util.getTblDefRow(tbl);
    const datas: DialogInputDatas = this.getDialogInputData(edtRow, tblDefRow);

    // MoneyDiary で使用中の場合、Delボタン非活性
    const id = edtRow[Const.CMN_COL.ID];
    const inUseFlg = tblMap[Const.TBL.MAIN].some(
      (row) => row[inputColId as string] === id,
    );
    const buttonOptions: DialogInputButtonOption[] = [
      {
        id: DIALOG_BUTTON.DEL,
        disabled: inUseFlg,
      },
    ];

    // 非選択行、かつ有効なデータを取得
    const labelList = tblMap[tbl]
      .filter(
        (row) => row[Const.CMN_COL.ID] !== id && !!row[Const.CMN_COL.LABEL],
      )
      .map((row) => row[Const.CMN_COL.LABEL]);

    // バリデーションチェック用コールバック関数
    const validatorFn = (control: AbstractControl): ValidationErrors => {
      const errors: ValidationErrors = {};
      const label = control.get(Const.CMN_COL.LABEL)?.value;

      // 他データのラベルと重複している場合、OK/Addボタン非活性
      if (labelList.includes(label)) {
        errors[DIALOG_BUTTON.OK] = true;
        errors[DIALOG_BUTTON.ADD] = true;
      }

      // 選択行のラベルと同じ場合、Addボタン非活性
      if (label === edtRow[Const.CMN_COL.LABEL]) {
        errors[DIALOG_BUTTON.ADD] = true;
      }

      return errors;
    };

    return {
      title: Util.getTblName(tbl),
      datas,
      buttonOptions,
      validatorFn,
    };
  };

  /**
   * ダイアログ入力データ返却
   * @param row
   * @param initValues
   */
  protected readonly getDialogInputData = (
    row: Row,
    initValues: Row,
  ): DialogInputDatas => [
    {
      id: Const.CMN_COL.LABEL,
      label: 'Label',
      value: row[Const.CMN_COL.LABEL],
      required: true,
      initValue: initValues[Const.CMN_COL.LABEL],
    },
    ...this.getDialogInputDataCustom(row, initValues),
    {
      id: Const.CMN_COL.VALID,
      label: 'Valid',
      value: row[Const.CMN_COL.VALID],
      type: Const.INPUT_TYPE.TOGGLE,
      initValue: initValues[Const.CMN_COL.VALID],
    },
    {
      id: Const.CMN_COL.UPD_DATE_TIME,
      label: 'Upd Date',
      value: row[Const.CMN_COL.UPD_DATE_TIME],
      disabled: true,
      initValue: initValues[Const.CMN_COL.UPD_DATE_TIME],
    },
  ];

  /**
   * ダイアログ入力データ返却(custom)
   * @param row
   * @param initValues
   */
  protected abstract readonly getDialogInputDataCustom: (
    row: Row,
    initValues: Row,
  ) => DialogInputDatas;

  /**
   * 未選択用データがあるかどうか(行編集Emitterデータ作成)
   * @param rows
   * @returns チェック結果
   */
  protected override readonly checkNoSelData = (rows: Row[]): boolean => {
    return rows.some(
      (row) => row[Const.CMN_COL.ID] === Const.MARK.NO_SELECT.id,
    );
  };
}
