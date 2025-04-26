import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { CellClickedEvent, RowStyle } from 'ag-grid-community';
import { format } from 'date-fns';
import { RowData } from 'src/app/domain/row-data';
import { MoneyDiaryBaseUsecase } from 'src/app/features/money-diary/money-diary-base/money-diary-base.usecase';
import * as Const from 'src/app/shared/constants/constants';
import {
  RowDataAdd,
  RowDataEdit,
  RowDataKey,
  ValueType,
} from 'src/app/shared/constants/types';
import * as Util from 'src/app/shared/constants/utils';
import {
  DIALOG_BUTTON,
  DialogInput,
  DialogInputData,
  DialogOutputData,
} from 'src/app/shared/dialog-input/dialog-input.component';
import { DialogInputButtonOption } from '../../../shared/dialog-input/dialog-input.component';

@Injectable()
export abstract class SettingUsecase extends MoneyDiaryBaseUsecase {
  /**
   * 行データ取得
   * @param rowDatas
   * @param inputDatas
   * @param credit
   */
  readonly getRowDatas = (
    rowDatas: RowData[],
    _inputDatas: RowData[],
    _credit: RowData[],
  ) => structuredClone(rowDatas);

  /**
   * 行スタイル返却(Custom)
   * @param rowData
   * @param style
   * @default style = {}
   * @returns 行スタイル
   */
  protected override readonly getRowStyleCustom = (
    rowData: RowData,
    style: RowStyle = {},
  ): RowStyle => {
    if (!rowData[Const.ROW_DATA_COMMON_COL_ID.LABEL]) {
      // 空データの場合
      style['backgroundColor'] = Const.GRID_ROW_COLOR.NONE;
    } else if (!!rowData[Const.ROW_DATA_COMMON_COL_ID.UPDATE]) {
      // // 更新済データの場合
      // style['backgroundColor'] = Const.GRID_ROW_COLOR.UPDATE;
    }

    return style;
  };

  /**
   * 入力チェック(ダイアログオープン前)
   * @param event
   * @returns チェック結果
   */
  override readonly checkInputData = (
    event: CellClickedEvent<RowData, ValueType>,
  ): boolean => {
    if (!event.node.id || !event.data) {
      // 選択行がない、または、入力データがない場合
      return false;
    }

    if (
      event.data[Const.ROW_DATA_COMMON_COL_ID.ID] === Const.MARK.NO_SELECT.ID
    ) {
      // 未選択項目の場合
      return false;
    }

    return true;
  };

  /**
   * ダイアログ入力データ作成
   * @param selectRowDatas
   * @param rowDataKey
   * @param rowDatas
   * @param inputDatas
   * @param inputColId
   * @returns 入力データ
   */
  override readonly createInputData = <MoneyDiaryColId>(
    selectRowDatas: RowData[],
    rowDataKey: RowDataKey,
    [rowDatas, inputDatas]: RowData[][],
    inputColId: MoneyDiaryColId,
  ): DialogInput => {
    // 初期データ
    const rowData = selectRowDatas[0];
    const rowDataVal = structuredClone(rowData);
    const rowDataInitVal = Util.getInitRowData(rowDataKey);
    const datas: DialogInputData[] = this.getDialogInputData(
      rowDataVal,
      rowDataInitVal,
    );

    // MoneyDiary で使用中の場合、Delボタン非活性
    const id = rowData[Const.ROW_DATA_COMMON_COL_ID.ID];
    const inUseFlg = inputDatas.some(
      (data) => data[inputColId as string] === id,
    );
    const buttonOptions: DialogInputButtonOption[] = [
      {
        id: DIALOG_BUTTON.DEL,
        disabled: inUseFlg,
      },
    ];

    // 非選択行、かつ有効なデータを取得
    const labelList = rowDatas
      .filter(
        (data) =>
          data[Const.ROW_DATA_COMMON_COL_ID.ID] !== id &&
          !!data[Const.ROW_DATA_COMMON_COL_ID.LABEL],
      )
      .map((data) => data[Const.ROW_DATA_COMMON_COL_ID.LABEL]);

    // バリデーションチェック用コールバック関数
    const validatorFn = (control: AbstractControl): ValidationErrors => {
      const errors: ValidationErrors = {};
      const label = control.get(Const.ROW_DATA_COMMON_COL_ID.LABEL)?.value;

      // 他データのラベルと重複している場合、OK/Addボタン非活性
      if (labelList.includes(label)) {
        errors[DIALOG_BUTTON.OK] = true;
        errors[DIALOG_BUTTON.ADD] = true;
      }

      // 選択行のラベルと同じ場合、Addボタン非活性
      if (label === rowData[Const.ROW_DATA_COMMON_COL_ID.LABEL]) {
        errors[DIALOG_BUTTON.ADD] = true;
      }

      return errors;
    };

    return {
      title: Util.getScreenTitle2(rowDataKey),
      datas,
      buttonOptions,
      validatorFn,
    };
  };

  /**
   * ダイアログ入力データ返却
   * @param rowData
   * @param initValues
   */
  protected readonly getDialogInputData = (
    rowData: RowData,
    initValues: RowData,
  ): DialogInputData[] => [
    {
      id: Const.ROW_DATA_COMMON_COL_ID.LABEL,
      label: 'Label',
      value: rowData[Const.ROW_DATA_COMMON_COL_ID.LABEL],
      required: true,
      initValue: initValues[Const.ROW_DATA_COMMON_COL_ID.LABEL],
    },
    ...this.getDialogInputDataCustom(rowData, initValues),
    {
      id: Const.ROW_DATA_COMMON_COL_ID.VALID,
      label: 'Valid',
      value: rowData[Const.ROW_DATA_COMMON_COL_ID.VALID],
      type: Const.INPUT_TYPE.TOGGLE,
      initValue: initValues[Const.ROW_DATA_COMMON_COL_ID.VALID],
    },
    {
      id: Const.ROW_DATA_COMMON_COL_ID.UPD_DATE,
      label: 'Upd Date',
      value: rowData[Const.ROW_DATA_COMMON_COL_ID.UPD_DATE],
      disabled: true,
      initValue: initValues[Const.ROW_DATA_COMMON_COL_ID.UPD_DATE],
    },
  ];

  /**
   * ダイアログ入力データ返却(custom)
   * @param rowData
   * @param initValues
   */
  protected abstract readonly getDialogInputDataCustom: (
    rowData: RowData,
    initValues: RowData,
  ) => DialogInputData[];

  /**
   * 入力項目反映(行編集Emitterデータ作成)
   * @param selectRowDatas
   * @param outputDatas
   * @returns 行データ項目追加後データ
   */
  protected override readonly reflectRowDatas = (
    selectRowDatas: RowData[],
    outputDatas: DialogOutputData[],
  ): RowData[] => {
    const newDatas = this.reflectRowDatasDefault(selectRowDatas, outputDatas);
    // 更新日時設定
    newDatas[0][Const.ROW_DATA_COMMON_COL_ID.UPD_DATE] = format(
      new Date(),
      Const.DATE_FORMAT.YY_MM_DD_HH_MM_SS,
    );
    // 更新フラグ設定
    newDatas[0][Const.ROW_DATA_COMMON_COL_ID.UPDATE] = true;

    return newDatas;
  };

  /**
   * 空データ追加チェック(行編集Emitterデータ作成)
   * @param newDatas
   * @returns チェック結果
   */
  protected override readonly checkAddEmptyData = (
    newDatas: RowData[],
  ): boolean => {
    return this.existEnptyData(newDatas) || this.existNoSelectData(newDatas);
  };

  /**
   * 空データ存在チェック(行編集Emitterデータ作成)
   * @param newDatas
   * @returns チェック結果
   */
  private readonly existEnptyData = (newDatas: RowData[]): boolean => {
    return !newDatas.some((data) => !data[Const.ROW_DATA_COMMON_COL_ID.LABEL]);
  };

  /**
   * 未選択データ存在チェック(行編集Emitterデータ作成)
   * @param newDatas
   * @returns チェック結果
   */
  private readonly existNoSelectData = (newDatas: RowData[]): boolean => {
    return !newDatas.some(
      (data) =>
        data[Const.ROW_DATA_COMMON_COL_ID.ID] === Const.MARK.NO_SELECT.ID,
    );
  };

  /**
   * 空行追加(行編集Emitterデータ作成)
   * @param rowDatas
   * @param rowDataKey
   * @param editInfo
   * @returns [編集後行データ、行編集情報]
   * @default [newDatas,editInfo]
   */
  protected override readonly procAddEmptyData = (
    rowDatas: RowData[],
    rowDataKey: RowDataKey,
    editInfo: RowDataEdit[],
  ): [RowData[], RowDataEdit[]] => {
    let newDatas = structuredClone(rowDatas);
    let newEditInfo = structuredClone(editInfo);
    if (this.existEnptyData(newDatas)) {
      // 空データ追加
      [newDatas, newEditInfo] = this.procAddStatus(
        [Util.getInitRowData(rowDataKey)],
        newDatas,
        rowDataKey,
        newEditInfo,
      );
    }
    if (this.existNoSelectData(newDatas)) {
      // 未選択データ追加
      const addData = Util.getInitRowData(rowDataKey);
      addData[Const.ROW_DATA_COMMON_COL_ID.ID] = Const.MARK.NO_SELECT.ID;
      addData[Const.ROW_DATA_COMMON_COL_ID.LABEL] = Const.MARK.NO_SELECT.LABEL;
      newEditInfo = [
        ...newEditInfo,
        {
          type: Const.ROW_DATA_EDIT_TYPE.ADD,
          event: {
            key: rowDataKey,
            datas: [addData],
            addIds: [newDatas[0][Const.ROW_DATA_COMMON_COL_ID.ID]],
          } as RowDataAdd,
        },
      ];
      newDatas = [addData, ...newDatas];
    }

    return [newDatas, newEditInfo];
  };
}
